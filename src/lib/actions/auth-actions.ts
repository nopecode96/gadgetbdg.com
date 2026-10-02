"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";

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
          templateId,
          whatsapp: cleanWa,
          address: address || null,
          primaryColor: templateId === "dark-gaming" ? "#10b981" : "#2563eb",
          hasWatermark: tier !== "STARTER",
          lastTemplateChangeAt: new Date(),
          isActive: false, // aktif setelah pembayaran diverifikasi
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
          amount: TIER_PRICE[tier],
          receiptUrl: receiptUrl || null,
          status: "PENDING",
        },
      });

      return { store, user, payment };
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/billing");

    return { success: true, storeId: result.store.id, paymentId: result.payment.id };
  } catch (error: any) {
    console.error("Error registerStoreWithPaymentAction:", error);
    return { success: false, error: error?.message || "Gagal mendaftarkan toko." };
  }
}

// ---------------------------------------------------------------
// 2. APPROVE PAYMENT — Super Admin
// ---------------------------------------------------------------
export async function approvePaymentAction(paymentId: string) {
  try {
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { store: true },
    });

    if (!payment) return { success: false, error: "Data pembayaran tidak ditemukan." };
    if (payment.status === "APPROVED") return { success: false, error: "Pembayaran sudah disetujui sebelumnya." };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.$transaction([
      prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: { status: "APPROVED" },
      }),
      prisma.store.update({
        where: { id: payment.storeId },
        data: {
          isActive: true,
          subscriptionExpiresAt: expiresAt,
        },
      }),
    ]);

    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin");

    return {
      success: true,
      store: payment.store,
      whatsapp: payment.store.whatsapp,
    };
  } catch (error: any) {
    console.error("Error approvePaymentAction:", error);
    return { success: false, error: error?.message || "Gagal menyetujui pembayaran." };
  }
}

// ---------------------------------------------------------------
// 3. REJECT PAYMENT — Super Admin
// ---------------------------------------------------------------
export async function rejectPaymentAction(paymentId: string, notes: string) {
  try {
    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", notes: notes || null },
    });

    revalidatePath("/super-admin/billing");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal menolak pembayaran." };
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
