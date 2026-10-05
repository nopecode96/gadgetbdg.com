"use server";

import { prisma } from "@/lib/prisma";
import { requireSalesPartner } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

/**
 * Server Action to update sales partner bank details
 * Guarded strictly by requireSalesPartner()
 */
export async function updateSalesBankDetailsAction(data: {
  bankName: string;
  bankAccount: string;
  bankHolder: string;
}) {
  try {
    const { partner } = await requireSalesPartner();

    const bankName = data.bankName?.trim() || null;
    const bankAccount = data.bankAccount?.trim() || null;
    const bankHolder = data.bankHolder?.trim() || null;

    if (!bankName || !bankAccount || !bankHolder) {
      return { success: false, error: "Semua kolom rekening bank wajib diisi." };
    }

    const updated = await prisma.salesPartner.update({
      where: { id: partner.id },
      data: {
        bankName,
        bankAccount,
        bankHolder,
      },
    });

    // Also sync to User for convenience
    await prisma.user.update({
      where: { id: partner.userId },
      data: {
        bankName,
        bankNumber: bankAccount,
        bankHolder,
      },
    });

    revalidatePath("/sales");

    return {
      success: true,
      message: "Informasi rekening bank berhasil diperbarui.",
      partner: {
        bankName: updated.bankName,
        bankAccount: updated.bankAccount,
        bankHolder: updated.bankHolder,
      },
    };
  } catch (error: any) {
    console.error("updateSalesBankDetailsAction error:", error);
    return { success: false, error: error.message || "Gagal memperbarui data bank." };
  }
}

/**
 * Super Admin Action: Create new Sales Partner
 */
export async function createSalesPartnerAction(data: {
  name: string;
  email: string;
  password?: string;
  phone: string;
  referralCode?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
}) {
  try {
    const { requireSaasAdmin } = await import("@/lib/auth/session");
    await requireSaasAdmin();

    const name = data.name?.trim();
    const email = data.email?.toLowerCase().trim();
    const password = data.password?.trim() || "Sales123!";
    let phone = (data.phone || "").replace(/\D/g, "");

    if (!name || !email || !phone) {
      return { success: false, error: "Nama, email, dan nomor WhatsApp wajib diisi." };
    }

    if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    if (phone.length < 9) {
      return { success: false, error: "Nomor WhatsApp tidak valid." };
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, error: "Email sudah terdaftar di platform." };
    }

    // Process referral code
    let refCode = data.referralCode?.trim().toUpperCase();
    if (refCode) {
      const codeExists =
        (await prisma.salesPartner.findUnique({ where: { code: refCode } })) ||
        (await prisma.user.findUnique({ where: { referralCode: refCode } }));
      if (codeExists) {
        return { success: false, error: `Kode referral "${refCode}" sudah digunakan.` };
      }
    } else {
      const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      for (let attempt = 0; attempt < 10 && !refCode; attempt++) {
        let suffix = "";
        for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
        const candidate = `SLS-${suffix}`;
        const codeExists =
          (await prisma.salesPartner.findUnique({ where: { code: candidate } })) ||
          (await prisma.user.findUnique({ where: { referralCode: candidate } }));
        if (!codeExists) refCode = candidate;
      }
      if (!refCode) {
        refCode = `SLS-${Date.now().toString().slice(-4)}`;
      }
    }

    const bcrypt = (await import("bcryptjs")).default;
    const passwordHash = await bcrypt.hash(password, 10);

    const bankName = data.bankName?.trim() || null;
    const bankAccount = data.bankAccount?.trim() || null;
    const bankHolder = data.bankHolder?.trim() || name;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "SALES_AGENT",
          phone,
          referralCode: refCode,
          bankName,
          bankNumber: bankAccount,
          bankHolder,
        },
      });

      const partner = await tx.salesPartner.create({
        data: {
          userId: user.id,
          code: refCode!,
          name,
          phone,
          bankName,
          bankAccount,
          bankHolder,
          isActive: true,
        },
      });

      return { user, partner };
    });

    revalidatePath("/super-admin/sales-portal");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Mitra sales ${result.partner.name} (${result.partner.code}) berhasil didaftarkan!`,
      partner: result.partner,
    };
  } catch (error: any) {
    console.error("createSalesPartnerAction error:", error);
    return { success: false, error: error.message || "Gagal membuat mitra sales." };
  }
}

/**
 * Super Admin Action: Toggle Sales Partner active status
 */
export async function toggleSalesPartnerStatusAction(partnerId: string, isActive: boolean) {
  try {
    const { requireSaasAdmin } = await import("@/lib/auth/session");
    await requireSaasAdmin();

    if (!partnerId) return { success: false, error: "Partner ID wajib diisi." };

    const partner = await prisma.salesPartner.findFirst({
      where: {
        OR: [{ id: partnerId }, { userId: partnerId }],
      },
    });

    if (!partner) {
      return { success: false, error: "Mitra sales tidak ditemukan." };
    }

    const updated = await prisma.salesPartner.update({
      where: { id: partner.id },
      data: { isActive },
    });

    revalidatePath("/super-admin/sales-portal");
    revalidatePath(`/super-admin/sales-portal/${partner.id}`);
    revalidatePath(`/super-admin/sales-portal/${partner.userId}`);

    return {
      success: true,
      message: `Status mitra ${updated.name} diubah menjadi: ${isActive ? "Aktif" : "Nonaktif"}.`,
      isActive: updated.isActive,
    };
  } catch (error: any) {
    console.error("toggleSalesPartnerStatusAction error:", error);
    return { success: false, error: error.message || "Gagal mengubah status mitra sales." };
  }
}

/**
 * Super Admin Action: Pay all pending commissions for a sales partner
 */
export async function payAllPendingCommissionsAction(salesId: string) {
  try {
    const { requireSaasAdmin } = await import("@/lib/auth/session");
    await requireSaasAdmin();

    if (!salesId) return { success: false, error: "Sales ID wajib diisi." };

    // Find partner or user
    const partner = await prisma.salesPartner.findFirst({
      where: {
        OR: [{ id: salesId }, { userId: salesId }],
      },
    });

    const now = new Date();
    let totalUpdated = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Update SalesCommission
      if (partner) {
        const res1 = await tx.salesCommission.updateMany({
          where: {
            salesPartnerId: partner.id,
            status: "PENDING",
          },
          data: {
            status: "PAID",
            paidAt: now,
          },
        });
        totalUpdated += res1.count;
      }

      // 2. Update SalesCommissionLog
      const userId = partner?.userId || salesId;
      const res2 = await tx.salesCommissionLog.updateMany({
        where: {
          salesUserId: userId,
          status: "PENDING",
        },
        data: {
          status: "PAID",
          paidAt: now,
        },
      });
      totalUpdated += res2.count;
    });

    revalidatePath("/super-admin/sales-portal");
    revalidatePath(`/super-admin/sales-portal/${salesId}`);
    if (partner) {
      revalidatePath(`/super-admin/sales-portal/${partner.id}`);
      revalidatePath(`/super-admin/sales-portal/${partner.userId}`);
    }

    return {
      success: true,
      message: `Berhasil mencairkan ${totalUpdated} komisi pending untuk mitra sales!`,
      count: totalUpdated,
    };
  } catch (error: any) {
    console.error("payAllPendingCommissionsAction error:", error);
    return { success: false, error: error.message || "Gagal mencairkan komisi." };
  }
}
