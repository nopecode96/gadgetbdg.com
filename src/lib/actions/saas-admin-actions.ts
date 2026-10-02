"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
 * 3. Buat akun staf internal platform SaaS (SUPER_ADMIN / ADMIN_SAAS)
 */
export async function createSaasStaffAction(data: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS";
}) {
  try {
    const { name, email, password, role } = data;

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

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role,
        storeId: null, // Akun internal platform tidak terikat toko
      },
    });

    revalidatePath("/super-admin/admins");
    return {
      success: true,
      message: `Admin ${role} berhasil dibuat untuk ${newUser.name} (${newUser.email})!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("createSaasStaffAction error:", error);
    return { success: false, error: error.message || "Gagal membuat akun admin SaaS." };
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
