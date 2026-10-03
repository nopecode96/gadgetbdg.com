"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";
import { sendWhatsAppMessage } from "@/lib/services/whatsapp-service";

const SUBSCRIPTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const SALES_COMMISSION: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

export interface BillingPaymentRow {
  id: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  amount: number;
  receiptUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  reviewedByName: string | null;
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
    subscriptionExpiresAt: string | null;
  };
  plan: { name: string; labelBadge: string; price: number } | null;
}

export interface BillingOverview {
  totalRevenue: number;
  activeStores: number;
  pendingCount: number;
  pending: BillingPaymentRow[];
  history: BillingPaymentRow[];
  paymentSetting?: {
    enableBankTransfer?: boolean;
    bankName: string | null;
    bankAccountNumber: string | null;
    bankAccountHolder: string | null;
    qrisImageUrl: string | null;
    qrisNmid?: string | null;
  };
}

const paymentInclude = {
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      whatsapp: true,
      subscriptionExpiresAt: true,
    },
  },
  plan: { select: { name: true, labelBadge: true, price: true } },
} as const;

function serialize(p: any): BillingPaymentRow {
  return {
    id: p.id,
    tier: p.tier,
    amount: p.amount,
    receiptUrl: p.receiptUrl,
    status: p.status,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    reviewedByName: p.reviewedByName ?? null,
    store: {
      ...p.store,
      subscriptionExpiresAt: p.store.subscriptionExpiresAt
        ? p.store.subscriptionExpiresAt.toISOString()
        : null,
    },
    plan: p.plan ? { ...p.plan, price: Number(p.plan.price) } : null,
  };
}

// ---------------------------------------------------------------
// a. OVERVIEW
// ---------------------------------------------------------------
export async function getBillingOverviewAction(): Promise<BillingOverview> {
  await requireSaasAdmin();

  const [revenue, activeStores, pendingRaw, historyRaw, setting] = await Promise.all([
    prisma.subscriptionPayment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.store.count({ where: { isActive: true } }),
    prisma.subscriptionPayment.findMany({
      where: { status: "PENDING" },
      include: paymentInclude,
      orderBy: { createdAt: "asc" },
    }),
    prisma.subscriptionPayment.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: paymentInclude,
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.platformSetting.findUnique({
      where: { id: "GLOBAL" },
    }),
  ]);

  return {
    totalRevenue: revenue._sum.amount ?? 0,
    activeStores,
    pendingCount: pendingRaw.length,
    pending: pendingRaw.map(serialize),
    history: historyRaw.map(serialize),
    paymentSetting: setting
      ? {
          enableBankTransfer: Boolean(setting.enableBankTransfer),
          bankName: setting.bankName,
          bankAccountNumber: setting.bankAccountNumber,
          bankAccountHolder: setting.bankAccountHolder,
          qrisImageUrl: setting.qrisImageUrl,
          qrisNmid: setting.qrisNmid,
        }
      : undefined,
  };
}

// ---------------------------------------------------------------
// b. APPROVE
// ---------------------------------------------------------------
export async function approveSubscriptionPaymentAction(paymentId: string) {
  try {
    const admin = await requireSaasAdmin();

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.findUnique({
        where: { id: paymentId },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              customDomain: true,
              whatsapp: true,
              salesUserId: true,
              referredBySalesId: true,
              subscriptionExpiresAt: true,
            },
          },
        },
      });

      if (!payment) throw new Error("Data pembayaran tidak ditemukan.");
      if (payment.status === "APPROVED") {
        throw new Error("Pembayaran sudah disetujui sebelumnya.");
      }

      const now = new Date();
      const currentEnd = payment.store.subscriptionExpiresAt;
      // Perpanjangan sebelum habis: tumpuk di atas masa aktif; selain itu mulai dari sekarang.
      const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
      const newEnd = new Date(base.getTime() + SUBSCRIPTION_DAYS * DAY_MS);

      // Sinkronkan plan: planId dari payment, fallback ke id paket sesuai tier.
      const planId = payment.planId ?? payment.tier;
      const plan = await tx.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new Error(`Paket "${planId}" tidak ditemukan di database.`);

      await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          paidAt: now,
          reviewedByName: admin.name,
        },
      });

      await tx.store.update({
        where: { id: payment.storeId },
        data: {
          isActive: true,
          planId: plan.id,
          tier: payment.tier,
          hasWatermark: plan.hasWatermark,
          subscriptionStartedAt: now,
          subscriptionExpiresAt: newEnd,
        },
      });

      const commAmount = Number(plan.salesCommission) > 0 ? Number(plan.salesCommission) : (SALES_COMMISSION[payment.tier] || 50_000);
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // 1. Catat ke SalesPartner jika toko terhubung ke sales partner via referral
      let partnerId = payment.store.referredBySalesId;
      if (!partnerId && payment.store.salesUserId) {
        // Fallback: cari partner dari salesUserId jika ada
        const existingPartner = await tx.salesPartner.findUnique({
          where: { userId: payment.store.salesUserId },
        });
        if (existingPartner) {
          partnerId = existingPartner.id;
        }
      }

      if (partnerId) {
        await tx.salesCommission.create({
          data: {
            salesPartnerId: partnerId,
            storeId: payment.storeId,
            amount: commAmount,
            status: "PENDING",
            period: currentPeriod,
          },
        });
      }

      // 2. Catat ke SalesCommissionLog (legacy/backward compatibility)
      if (payment.store.salesUserId) {
        await tx.salesCommissionLog.create({
          data: {
            salesUserId: payment.store.salesUserId,
            storeId: payment.storeId,
            paymentId: payment.id,
            tier: payment.tier,
            amount: commAmount,
            status: "PENDING",
          },
        });
      }

      return { payment, newEnd };
    });

    // Notifikasi WA — non-blocking, di luar transaksi.
    try {
      const { payment } = result;
      if (payment.store.whatsapp) {
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";
        const storeUrl = payment.store.customDomain || `${payment.store.slug}.${mainDomain}`;
        sendWhatsAppMessage({
          target: payment.store.whatsapp,
          message:
            `🎉 *Selamat! Toko Anda Telah Aktif di GadgetBdg.com*\n\n` +
            `Pembayaran paket *${payment.tier}* untuk *${payment.store.name}* telah berhasil diverifikasi.\n\n` +
            `🌐 *Website Toko:*\nhttps://${storeUrl}\n\n` +
            `🔐 *Login Panel Admin:*\nhttps://toko.${mainDomain}\n\n` +
            `Masa aktif hingga ${result.newEnd.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}.`,
        }).catch((err) => console.warn("WA notification failed:", err));
      }
    } catch (err) {
      console.warn("Error preparing WA notification:", err);
    }

    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin");
    revalidatePath("/super-admin/sales-portal");
    revalidatePath("/admin");

    return {
      success: true as const,
      store: result.payment.store,
      subscriptionExpiresAt: result.newEnd.toISOString(),
    };
  } catch (error: any) {
    console.error("Error approveSubscriptionPaymentAction:", error);
    return { success: false as const, error: error?.message || "Gagal menyetujui pembayaran." };
  }
}

// ---------------------------------------------------------------
// c. REJECT
// ---------------------------------------------------------------
export async function rejectSubscriptionPaymentAction(paymentId: string, rejectReason: string) {
  try {
    const admin = await requireSaasAdmin();
    const reason = (rejectReason || "").trim();
    if (!reason) return { success: false as const, error: "Alasan penolakan wajib diisi." };

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      select: { status: true },
    });
    if (!payment) return { success: false as const, error: "Data pembayaran tidak ditemukan." };
    if (payment.status === "APPROVED") {
      return { success: false as const, error: "Pembayaran yang sudah disetujui tidak dapat ditolak." };
    }

    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: { status: "REJECTED", notes: reason, reviewedByName: admin.name },
    });

    revalidatePath("/super-admin/billing");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error?.message || "Gagal menolak pembayaran." };
  }
}
