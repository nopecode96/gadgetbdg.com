"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp-service";

/**
 * 1. Reset kata sandi akun STORE_OWNER yang terikat ke storeId
 */
export async function resetStoreOwnerPasswordAction(storeId: string, newPassword: string) {
  try {
    if (!storeId || !newPassword) {
      return { success: false, error: "Store ID dan password baru wajib diisi." };
    }
    if (newPassword.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const owner = await prisma.user.findFirst({
      where: {
        storeId,
        role: "STORE_OWNER",
      },
    });

    if (!owner) {
      return { success: false, error: "Akun pemilik (STORE_OWNER) tidak ditemukan untuk toko ini." };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: owner.id },
      data: { passwordHash },
    });

    revalidatePath("/super-admin/stores");
    return { success: true, message: `Password untuk ${owner.name} (${owner.email}) berhasil direset!` };
  } catch (error: any) {
    console.error("resetStoreOwnerPasswordAction error:", error);
    return { success: false, error: error.message || "Gagal mereset password." };
  }
}

/**
 * 2. Perpanjang masa aktif subscriptionExpiresAt toko sebanyak additionalDays
 */
export async function extendStoreSubscriptionAction(storeId: string, additionalDays: number = 30) {
  try {
    if (!storeId) {
      return { success: false, error: "Store ID wajib diisi." };
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, subscriptionExpiresAt: true, isActive: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const now = new Date();
    const baseDate =
      store.subscriptionExpiresAt && store.subscriptionExpiresAt > now
        ? new Date(store.subscriptionExpiresAt)
        : now;

    const newExpiresAt = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        subscriptionExpiresAt: newExpiresAt,
        isActive: true, // Otomatis aktifkan jika diperpanjang
      },
    });

    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Langganan ${store.name} diperpanjang +${additionalDays} hari s/d ${newExpiresAt.toLocaleDateString("id-ID")}`,
      subscriptionExpiresAt: newExpiresAt.toISOString(),
      isActive: updated.isActive,
    };
  } catch (error: any) {
    console.error("extendStoreSubscriptionAction error:", error);
    return { success: false, error: error.message || "Gagal memperpanjang langganan." };
  }
}

/**
 * 3. Buat akun staf internal platform SaaS (SUPER_ADMIN / ADMIN_SAAS / SALES_AGENT)
 */
export async function createSaasStaffAction(data: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES_AGENT";
  referralCode?: string;
  bankName?: string;
  bankNumber?: string;
  bankHolder?: string;
}) {
  try {
    const { name, email, password, role, referralCode, bankName, bankNumber, bankHolder } = data;

    if (!name || !email || !password || !role) {
      return { success: false, error: "Semua kolom wajib diisi." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." };
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar. Gunakan email lain." };
    }

    let cleanRefCode: string | null = null;
    if (role === "SALES_AGENT") {
      cleanRefCode = (referralCode || `SALES-${name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6)}`).trim();
      const existingRef = await prisma.user.findUnique({
        where: { referralCode: cleanRefCode },
      });
      if (existingRef) {
        cleanRefCode = `${cleanRefCode}-${Math.floor(100 + Math.random() * 900)}`;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role,
        storeId: null, // Akun internal platform tidak terikat toko
        referralCode: cleanRefCode,
        bankName: bankName || null,
        bankNumber: bankNumber || null,
        bankHolder: bankHolder || null,
      },
    });

    revalidatePath("/super-admin/admins");
    revalidatePath("/super-admin/sales-portal");
    return {
      success: true,
      message: `${role} berhasil dibuat untuk ${newUser.name} (${newUser.email})!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("createSaasStaffAction error:", error);
    return { success: false, error: error.message || "Gagal membuat akun staf SaaS." };
  }
}

/**
 * Tandai komisi sales sudah dibayar / ditransfer oleh Super Admin
 */
export async function paySalesCommissionAction(commissionId: string) {
  try {
    if (!commissionId) return { success: false, error: "Commission ID wajib diisi." };

    // 1. Cek di tabel SalesCommissionLog
    const commLog = await prisma.salesCommissionLog.findUnique({
      where: { id: commissionId },
      include: { salesUser: true, store: true },
    });

    if (commLog) {
      if (commLog.status === "PAID") return { success: false, error: "Komisi ini sudah dicairkan sebelumnya." };

      await prisma.salesCommissionLog.update({
        where: { id: commissionId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      revalidatePath("/super-admin/sales-portal");
      revalidatePath("/super-admin");

      return {
        success: true,
        message: `Komisi Rp ${commLog.amount.toLocaleString("id-ID")} untuk ${commLog.salesUser.name} (${commLog.store.name}) berhasil ditandai LUNAS!`,
      };
    }

    // 2. Cek di tabel SalesCommission
    const comm = await prisma.salesCommission.findUnique({
      where: { id: commissionId },
      include: { salesPartner: true, store: true },
    });

    if (comm) {
      if (comm.status === "PAID") return { success: false, error: "Komisi ini sudah dicairkan sebelumnya." };

      await prisma.salesCommission.update({
        where: { id: commissionId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      revalidatePath("/super-admin/sales-portal");
      revalidatePath("/super-admin");

      return {
        success: true,
        message: `Komisi Rp ${Number(comm.amount).toLocaleString("id-ID")} untuk ${comm.salesPartner.name} (${comm.store.name}) berhasil ditandai LUNAS!`,
      };
    }

    return { success: false, error: "Data komisi tidak ditemukan." };
  } catch (error: any) {
    console.error("paySalesCommissionAction error:", error);
    return { success: false, error: error.message || "Gagal mencairkan komisi." };
  }
}

/**
 * 4. Hapus akun admin internal SaaS
 */
export async function deleteSaasStaffAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID wajib diisi." };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan." };
    }

    if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SAAS") {
      return { success: false, error: "User ini bukan admin internal SaaS." };
    }

    // Pastikan tidak menghapus satu-satunya SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        return { success: false, error: "Tidak dapat menghapus satu-satunya Super Admin platform." };
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/super-admin/admins");
    return { success: true, message: `Akun admin ${user.name} berhasil dihapus.` };
  } catch (error: any) {
    console.error("deleteSaasStaffAction error:", error);
    return { success: false, error: error.message || "Gagal menghapus admin SaaS." };
  }
}

/**
 * 5. Aktivasi Manual Toko (Bypass Pembayaran untuk Promo / Offline Kemitraan)
 */
export async function manualActivateStoreAction(storeId: string, days: number = 30) {
  try {
    if (!storeId) {
      return { success: false, error: "Store ID wajib diisi." };
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { payments: { where: { status: "PENDING" } } },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Update store & approve any pending subscription payment in transaction
    await prisma.$transaction(async (tx) => {
      await tx.store.update({
        where: { id: storeId },
        data: {
          isActive: true,
          subscriptionExpiresAt: expiresAt,
        },
      });

      // Jika ada payment PENDING, tandai APPROVED dengan catatan bypass
      if (store.payments.length > 0) {
        await tx.subscriptionPayment.updateMany({
          where: { storeId, status: "PENDING" },
          data: {
            status: "APPROVED",
            notes: "Diaktivasi manual oleh Super Admin (Bypass Promo/Offline)",
          },
        });
      }
    });

    // Notifikasi WhatsApp ke merchant (Non-blocking)
    try {
      if (store.whatsapp) {
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";
        const storeUrl = store.customDomain || `${store.slug}.${mainDomain}`;
        const activationMsg =
          `🎉 *Selamat! Toko Anda Telah Aktif di GadgetBdg.com*\n\n` +
          `Aktivasi toko *${store.name}* (Paket ${store.tier}) selama ${days} hari telah berhasil diproses oleh Super Admin.\n\n` +
          `🌐 *Website Toko (PWA):*\nhttps://${storeUrl}\n\n` +
          `🔐 *Login Panel Admin Toko:*\nhttps://toko.${mainDomain}\n\n` +
          `Silakan login menggunakan email & kata sandi akun Anda. Selamat berjualan!`;

        sendWhatsAppMessage({
          target: store.whatsapp,
          message: activationMsg,
        }).catch((err) => {
          console.warn("Non-blocking WA notification to merchant failed:", err);
        });
      }
    } catch (err) {
      console.warn("Error preparing WA notification on manual activation:", err);
    }

    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Toko ${store.name} berhasil diaktivasi manual selama ${days} hari!`,
    };
  } catch (error: any) {
    console.error("manualActivateStoreAction error:", error);
    return { success: false, error: error.message || "Gagal aktivasi manual toko." };
  }
}
