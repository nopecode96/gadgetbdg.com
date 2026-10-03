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
