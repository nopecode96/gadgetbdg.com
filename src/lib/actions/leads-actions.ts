"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";
import type { StoreTier } from "@prisma/client";

export interface LeadStoreItem {
  id: string;
  name: string;
  slug: string;
  tier: StoreTier;
  planId: string;
  planName: string;
  planPrice: number;
  whatsapp: string;
  templateId: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  salesPartner: {
    id: string;
    code: string;
    name: string;
    phone: string;
  } | null;
  latestPayment: {
    id: string;
    amount: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    receiptUrl: string | null;
    createdAt: string;
  } | null;
}

export interface LeadsOverviewResponse {
  leads: LeadStoreItem[];
  pendingCount: number;
}

const SALES_COMMISSION: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

/**
 * 1. getLeadsOverviewAction
 * Queries Store with where: { isActive: false }
 * Includes users (STORE_OWNER), plan, salesPartner, and payments
 */
export async function getLeadsOverviewAction(filters?: {
  search?: string;
  planId?: string;
}): Promise<LeadsOverviewResponse> {
  await requireSaasAdmin();

  const search = filters?.search?.trim() || "";
  const planId = filters?.planId && filters.planId !== "ALL" ? filters.planId : undefined;

  const whereClause: any = {
    isActive: false,
  };

  if (planId) {
    whereClause.tier = planId as StoreTier;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { whatsapp: { contains: search, mode: "insensitive" } },
      {
        users: {
          some: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
      {
        referredBySales: {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ],
        },
      },
      {
        salesUser: {
          salesPartner: {
            OR: [
              { code: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const inactiveStoresRaw = await prisma.store.findMany({
    where: whereClause,
    include: {
      plan: true,
      referredBySales: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
        },
      },
      salesUser: {
        include: {
          salesPartner: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
            },
          },
        },
      },
      users: {
        where: { role: "STORE_OWNER" },
        select: { id: true, name: true, email: true, phone: true },
        take: 1,
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          amount: true,
          status: true,
          receiptUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const leads: LeadStoreItem[] = inactiveStoresRaw.map((s) => {
    const owner = s.users.length > 0 ? s.users[0] : null;
    const sales = s.referredBySales || s.salesUser?.salesPartner || null;
    const payment = s.payments.length > 0 ? s.payments[0] : null;

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      tier: s.tier,
      planId: s.planId,
      planName: s.plan ? s.plan.name : s.tier,
      planPrice: s.plan ? Number(s.plan.price) : 250_000,
      whatsapp: s.whatsapp,
      templateId: s.templateId,
      createdAt: s.createdAt.toISOString(),
      owner,
      salesPartner: sales,
      latestPayment: payment
        ? {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            receiptUrl: payment.receiptUrl,
            createdAt: payment.createdAt.toISOString(),
          }
        : null,
    };
  });

  return {
    leads,
    pendingCount: leads.length,
  };
}

/**
 * 2. activateLeadDirectlyAction
 * Directly activates lead store, approves pending payment if any,
 * and creates SalesCommission record if referred by sales.
 */
export async function activateLeadDirectlyAction(storeId: string, daysActive: number = 30) {
  try {
    const admin = await requireSaasAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const store = await tx.store.findUnique({
        where: { id: storeId },
        include: {
          plan: true,
          referredBySales: true,
          salesUser: {
            include: { salesPartner: true },
          },
          payments: {
            where: { status: "PENDING" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!store) {
        throw new Error("Toko calon klien tidak ditemukan.");
      }

      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + daysActive * 24 * 60 * 60 * 1000);

      // 1. Update Store to active
      const updatedStore = await tx.store.update({
        where: { id: storeId },
        data: {
          isActive: true,
          subscriptionExpiresAt: newExpiresAt,
        },
      });

      // 2. Update pending payment to APPROVED if exists
      const pendingPayment = store.payments.length > 0 ? store.payments[0] : null;
      if (pendingPayment) {
        await tx.subscriptionPayment.update({
          where: { id: pendingPayment.id },
          data: {
            status: "APPROVED",
            paidAt: now,
            reviewedByName: admin.name,
          },
        });
      }

      // 3. Attribution to Sales Partner (if closing was via sales)
      const salesPartner = store.referredBySales || store.salesUser?.salesPartner;
      if (salesPartner) {
        const commAmount = SALES_COMMISSION[store.tier] || 50_000;
        const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const existingComm = await tx.salesCommission.findFirst({
          where: {
            salesPartnerId: salesPartner.id,
            storeId: store.id,
            period: currentPeriod,
          },
        });

        if (!existingComm) {
          await tx.salesCommission.create({
            data: {
              salesPartnerId: salesPartner.id,
              storeId: store.id,
              amount: commAmount,
              status: "PENDING",
              period: currentPeriod,
            },
          });
        }
      }

      return { store: updatedStore, newExpiresAt };
    });

    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Toko "${result.store.name}" berhasil diaktifkan langsung selama ${daysActive} hari hingga ${result.newExpiresAt.toLocaleDateString("id-ID")}!`,
    };
  } catch (error: any) {
    console.error("activateLeadDirectlyAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengaktivasi toko calon klien.",
    };
  }
}

/**
 * 3. deleteLeadAction
 * Deletes lead store that cancelled registration.
 */
export async function deleteLeadAction(storeId: string) {
  try {
    await requireSaasAdmin();

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, isActive: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    if (store.isActive) {
      return {
        success: false,
        error: "Toko yang sudah aktif tidak dapat dihapus dari pipeline calon klien.",
      };
    }

    await prisma.store.delete({
      where: { id: storeId },
    });

    revalidatePath("/super-admin/leads");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin");

    return {
      success: true,
      message: `Pendaftaran toko "${store.name}" berhasil dibatalkan dan dihapus.`,
    };
  } catch (error: any) {
    console.error("deleteLeadAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal menghapus pendaftaran calon klien.",
    };
  }
}
