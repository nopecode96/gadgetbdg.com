"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";
import bcrypt from "bcryptjs";

export interface InternalAdminItem {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES" | "SALES_AGENT";
  referralCode?: string | null;
  bankName?: string | null;
  bankNumber?: string | null;
  bankHolder?: string | null;
  createdAt: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES" | "SALES_AGENT";
  phone?: string;
  referralCode?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}

/**
 * 1. getInternalAdminsAction
 * Queries User where storeId is null or role is SUPER_ADMIN, ADMIN_SAAS, SALES, or SALES_AGENT.
 * Includes salesPartner relation and orders by createdAt desc.
 */
export async function getInternalAdminsAction(): Promise<InternalAdminItem[]> {
  await requireSaasAdmin();

  const usersRaw = await prisma.user.findMany({
    where: {
      OR: [
        { storeId: null },
        { role: { in: ["SUPER_ADMIN", "ADMIN_SAAS", "SALES", "SALES_AGENT"] } },
      ],
    },
    include: {
      salesPartner: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return usersRaw.map((u) => {
    const isSales = u.role === "SALES" || u.role === "SALES_AGENT";
    const partner = u.salesPartner;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES" | "SALES_AGENT",
      referralCode: isSales ? partner?.code || u.referralCode : null,
      bankName: isSales ? partner?.bankName || u.bankName : null,
      bankNumber: isSales ? partner?.bankAccount || u.bankNumber : null,
      bankHolder: isSales ? partner?.bankHolder || u.bankHolder : null,
      createdAt: u.createdAt.toISOString(),
    };
  });
}

/**
 * 2. createInternalAdminAction
 * Validates session (SUPER_ADMIN only).
 * Checks unique email.
 * Hashes password with bcryptjs (saltRounds = 10).
 * Runs in a prisma.$transaction to create User and SalesPartner if role is SALES.
 */
export async function createInternalAdminAction(data: CreateAdminInput) {
  try {
    const session = await requireSaasAdmin();

    // Guard: Only SUPER_ADMIN is permitted to create new admins/sales
    if (session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Hanya Super Admin yang berwenang menambah staf atau mitra baru." };
    }

    const { name, email, password, role, referralCode, bankName, bankAccount, bankHolder } = data;

    if (!name || !email || !password || !role) {
      return { success: false, error: "Nama, email, password, dan role wajib diisi." };
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

    const passwordHash = await bcrypt.hash(password, 10);
    const isSalesRole = role === "SALES" || role === "SALES_AGENT";

    let cleanPhone: string | null = null;
    let cleanRefCode: string | null = null;
    if (isSalesRole) {
      let digits = (data.phone || "").replace(/\D/g, "");
      if (digits.length < 9) {
        return { success: false, error: "Nomor WhatsApp aktif sales wajib diisi." };
      }
      if (digits.startsWith("0")) digits = "62" + digits.slice(1);
      cleanPhone = digits;

      const isCodeTaken = async (code: string) =>
        (await prisma.salesPartner.findUnique({ where: { code } })) ||
        (await prisma.user.findUnique({ where: { referralCode: code } }));

      const manualCode = referralCode?.trim().toUpperCase();
      if (manualCode) {
        if (await isCodeTaken(manualCode)) {
          return {
            success: false,
            error: "Kode referral sudah digunakan oleh sales lain, silakan gunakan kode lain",
          };
        }
        cleanRefCode = manualCode;
      } else {
        const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (let attempt = 0; attempt < 10 && !cleanRefCode; attempt++) {
          let suffix = "";
          for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
          const candidate = `SLS-${suffix}`;
          if (!(await isCodeTaken(candidate))) cleanRefCode = candidate;
        }
        if (!cleanRefCode) {
          return { success: false, error: "Gagal membuat kode referral otomatis, coba lagi." };
        }
      }
    }

    const newUser = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role,
          phone: cleanPhone,
          storeId: null, // Internal platform user
          referralCode: cleanRefCode,
          bankName: isSalesRole ? bankName || null : null,
          bankNumber: isSalesRole ? bankAccount || null : null,
          bankHolder: isSalesRole ? bankHolder || name.trim() : null,
        },
      });

      // 2. If SALES, create SalesPartner
      if (isSalesRole && cleanRefCode && cleanPhone) {
        await tx.salesPartner.create({
          data: {
            userId: user.id,
            code: cleanRefCode,
            name: user.name,
            phone: cleanPhone,
            bankName: bankName || null,
            bankAccount: bankAccount || null,
            bankHolder: bankHolder || user.name,
            isActive: true,
          },
        });
      }

      return user;
    });

    revalidatePath("/super-admin/admins");
    revalidatePath("/super-admin/sales-portal");

    return {
      success: true,
      message: `Akun ${role} berhasil dibuat untuk ${newUser.name} (${newUser.email})!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES" | "SALES_AGENT",
        referralCode: cleanRefCode,
        bankName: isSalesRole ? bankName || null : null,
        bankNumber: isSalesRole ? bankAccount || null : null,
        bankHolder: isSalesRole ? bankHolder || newUser.name : null,
        createdAt: newUser.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("createInternalAdminAction error:", error);
    return { success: false, error: error?.message || "Gagal membuat akun internal SaaS." };
  }
}

/**
 * 3. deleteInternalAdminAction
 * Validates session (SUPER_ADMIN only).
 * Prevents self-deletion.
 * Deletes user from DB (cascades to salesPartner).
 */
export async function deleteInternalAdminAction(userId: string) {
  try {
    const session = await requireSaasAdmin();

    // Guard: Only SUPER_ADMIN can delete
    if (session.role !== "SUPER_ADMIN") {
      return { success: false, error: "Hanya Super Admin yang berwenang mencabut akses akun." };
    }

    if (!userId) {
      return { success: false, error: "User ID wajib diisi." };
    }

    // Security Guard: Prevent deleting own account
    if (userId === session.id) {
      return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif." };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Guard: Prevent deleting the last SUPER_ADMIN
    if (targetUser.role === "SUPER_ADMIN") {
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
    revalidatePath("/super-admin/sales-portal");

    return {
      success: true,
      message: `Akses akun ${targetUser.name} (${targetUser.email}) berhasil dicabut dan dihapus.`,
    };
  } catch (error: any) {
    console.error("deleteInternalAdminAction error:", error);
    return { success: false, error: error?.message || "Gagal menghapus akun internal SaaS." };
  }
}
