"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp-service";

// ---------------------------------------------------------------
// Tier quota: maks jumlah user (termasuk STORE_OWNER)
// ---------------------------------------------------------------
const STAFF_QUOTA: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: 1,
  PRO: 3,
  ADVANCE: 5,
};

const TIER_PRICE: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: 250_000,
  PRO: 600_000,
  ADVANCE: 1_000_000,
};

// ---------------------------------------------------------------
// 1. REGISTER STORE + OWNER + PAYMENT (dari Wizard Onboarding)
// ---------------------------------------------------------------
export async function registerStoreWithPaymentAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const rawSlug = formData.get("slug") as string;
    const tier = (formData.get("tier") as "STARTER" | "PRO" | "ADVANCE") || "STARTER";
    const templateId = (formData.get("templateId") as string) || "minimal-clean";
    const whatsapp = formData.get("whatsapp") as string;
    const address = formData.get("address") as string;
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const ownerName = formData.get("ownerName") as string;
    const receiptUrl = formData.get("receiptUrl") as string | null;
    const refCode = (formData.get("refCode") as string | null)?.trim() || null;

    // Validasi wajib
    if (!name || !rawSlug || !whatsapp || !email || !password || !ownerName) {
      return { success: false, error: "Semua kolom wajib harus dilengkapi." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    // Cek apakah slug termasuk subdomain yang dilindungi sistem
    if (isReservedSlug(cleanSlug)) {
      return {
        success: false,
        error: "Subdomain ini dilindungi sistem dan tidak dapat digunakan.",
      };
    }

    // Cek slug unik
    const existingStore = await prisma.store.findUnique({ where: { slug: cleanSlug } });
    if (existingStore) {
      return { success: false, error: "Subdomain sudah digunakan. Pilih nama lain." };
    }

    // Cek email unik
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email ini sudah terdaftar. Gunakan email lain." };
    }

    // Cek referral code sales jika diisi
    let salesUserId: string | null = null;
    if (refCode) {
      const salesUser = await prisma.user.findFirst({
        where: {
          role: "SALES_AGENT",
          referralCode: { equals: refCode, mode: "insensitive" },
        },
        select: { id: true },
      });
      if (salesUser) {
        salesUserId = salesUser.id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Clean WhatsApp
    let cleanWa = whatsapp.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    // Transaction: buat Store + User + Payment sekaligus
    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name,
          slug: cleanSlug,
          tier,
          planId: tier,
          templateId,
          whatsapp: cleanWa,
          address: address || null,
          primaryColor: templateId === "dark-gaming" ? "#10b981" : "#2563eb",
          hasWatermark: tier !== "STARTER",
          lastTemplateChangeAt: new Date(),
          isActive: false, // aktif setelah pembayaran diverifikasi
          salesUserId,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: ownerName,
          role: "STORE_OWNER",
          storeId: store.id,
        },
      });

      const payment = await tx.subscriptionPayment.create({
        data: {
          storeId: store.id,
          tier,
          planId: tier,
          amount: TIER_PRICE[tier],
          receiptUrl: receiptUrl || null,
          status: "PENDING",
        },
      });

      return { store, user, payment };
    });

    // Notifikasi WhatsApp instan ke Super Admin Platform (Non-blocking)
    try {
      const superAdminWa = process.env.SUPERADMIN_WHATSAPP;
      if (superAdminWa) {
        const amountFormatted = (TIER_PRICE[tier] || 0).toLocaleString("id-ID");
        const adminAlertMsg =
          `🔔 *PEMBAYARAN QRIS BARU*\n\n` +
          `Toko: *${name}*\n` +
          `Paket: *${tier}* (Rp ${amountFormatted})\n` +
          `No WA: ${cleanWa}\n\n` +
          `Mohon verifikasi di: https://admin.gadgetbdg.com/billing`;

        sendWhatsAppMessage({
          target: superAdminWa,
          message: adminAlertMsg,
        }).catch((err) => {
          console.warn("Non-blocking WA notification to superadmin failed:", err);
        });
      }
    } catch (err) {
      console.warn("Error preparing WA notification to superadmin:", err);
    }

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin/leads");

    return { success: true, storeId: result.store.id, paymentId: result.payment.id };
  } catch (error: any) {
    console.error("Error registerStoreWithPaymentAction:", error);
    return { success: false, error: error?.message || "Gagal mendaftarkan toko." };
  }
}


// ---------------------------------------------------------------
// 4. CREATE STAFF USER — Store Owner only
// ---------------------------------------------------------------
export async function createStaffUserAction(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const staffName = formData.get("staffName") as string;
    const branchId = (formData.get("branchId") as string) || null;

    if (!storeId || !email || !password || !staffName) {
      return { success: false, error: "Semua kolom wajib dilengkapi." };
    }
    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { _count: { select: { users: true } } },
    });

    if (!store) return { success: false, error: "Toko tidak ditemukan." };

    const maxQuota = STAFF_QUOTA[store.tier];
    const currentCount = store._count.users;

    if (currentCount >= maxQuota) {
      if (store.tier === "STARTER") {
        return {
          success: false,
          error: `Paket Starter hanya mendukung 1 akun (Pemilik Toko). Upgrade ke Pro untuk menambah staf kasir.`,
        };
      }
      return {
        success: false,
        error: `Kuota akun paket ${store.tier} sudah penuh (${maxQuota} akun). Upgrade ke tier lebih tinggi untuk menambah staf.`,
      };
    }

    // Validasi cabang jika diberikan
    let validBranchId: string | null = null;
    if (branchId && branchId.trim()) {
      const branchExists = await prisma.branch.findFirst({
        where: { id: branchId.trim(), storeId },
      });
      if (branchExists) {
        validBranchId = branchExists.id;
      }
    }

    // Cek email unik
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email ini sudah digunakan." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: staffName,
        role: "STORE_STAFF",
        storeId,
        branchId: validBranchId,
      },
    });

    revalidatePath("/admin/team");
    return { success: true, userId: user.id };
  } catch (error: any) {
    console.error("Error createStaffUserAction:", error);
    return { success: false, error: error?.message || "Gagal membuat akun staf." };
  }
}

// ---------------------------------------------------------------
// 5. DELETE STAFF USER — Store Owner only
// ---------------------------------------------------------------
export async function deleteStaffUserAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "User tidak ditemukan." };
    if (user.role === "STORE_OWNER") {
      return { success: false, error: "Tidak bisa menghapus akun pemilik toko utama." };
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal menghapus staf." };
  }
}
