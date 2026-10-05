import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { requireSalesAgent } from "@/lib/auth/session";
import {
  SalesPortalDetailClient,
  DetailSalesAgentData,
} from "./SalesPortalDetailClient";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Detail Mitra Sales | Super Admin`,
  };
}

const COMMISSION_RATE: Record<string, number> = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

export default async function SalesPortalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireSalesAgent();

  const salesId = params.id;

  // 1. Cari di SalesPartner
  const partner = await prisma.salesPartner.findFirst({
    where: {
      OR: [
        { id: salesId },
        { userId: salesId },
        { code: salesId },
      ],
    },
    include: {
      user: true,
      stores: {
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          isActive: true,
          subscriptionExpiresAt: true,
          createdAt: true,
          whatsapp: true,
        },
        orderBy: { createdAt: "desc" },
      },
      commissions: {
        include: {
          store: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // 2. Jika tidak ada di SalesPartner, coba cari di User dengan role SALES/SALES_AGENT
  let fallbackUser = null;
  if (!partner) {
    fallbackUser = await prisma.user.findFirst({
      where: {
        id: salesId,
        role: { in: ["SALES", "SALES_AGENT"] },
      },
      include: {
        clientStores: {
          select: {
            id: true,
            name: true,
            slug: true,
            tier: true,
            isActive: true,
            subscriptionExpiresAt: true,
            createdAt: true,
            whatsapp: true,
          },
          orderBy: { createdAt: "desc" },
        },
        commissions: {
          include: {
            store: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!partner && !fallbackUser) {
    notFound();
  }

  // Gabungkan toko binaan (deduplikasi by id)
  const storeMap = new Map<string, any>();
  if (partner) {
    for (const s of partner.stores) {
      storeMap.set(s.id, s);
    }
    // Cek juga clientStores dari user jika ada
    if (partner.userId) {
      const uStores = await prisma.store.findMany({
        where: { salesUserId: partner.userId },
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          isActive: true,
          subscriptionExpiresAt: true,
          createdAt: true,
          whatsapp: true,
        },
      });
      for (const s of uStores) {
        if (!storeMap.has(s.id)) storeMap.set(s.id, s);
      }
    }
  } else if (fallbackUser) {
    for (const s of fallbackUser.clientStores) {
      storeMap.set(s.id, s);
    }
  }

  const clientStoresList = Array.from(storeMap.values()).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tier: s.tier,
    isActive: s.isActive,
    subscriptionExpiresAt: s.subscriptionExpiresAt ? s.subscriptionExpiresAt.toISOString() : null,
    createdAt: s.createdAt.toISOString(),
    whatsapp: s.whatsapp,
    monthlyCommission: COMMISSION_RATE[s.tier] || 50_000,
  }));

  // Gabungkan komisi
  const commissionList: any[] = [];
  if (partner) {
    for (const c of partner.commissions) {
      commissionList.push({
        id: c.id,
        amount: Number(c.amount),
        tier: "PRO", // default display
        status: c.status,
        paidAt: c.paidAt ? c.paidAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        storeName: c.store.name,
        storeSlug: c.store.slug,
      });
    }

    // Ambil juga komisi log dari user jika ada
    if (partner.userId) {
      const uComms = await prisma.salesCommissionLog.findMany({
        where: { salesUserId: partner.userId },
        include: { store: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      });
      for (const c of uComms) {
        commissionList.push({
          id: c.id,
          amount: c.amount,
          tier: c.tier,
          status: c.status,
          paidAt: c.paidAt ? c.paidAt.toISOString() : null,
          createdAt: c.createdAt.toISOString(),
          storeName: c.store.name,
          storeSlug: c.store.slug,
        });
      }
    }
  } else if (fallbackUser) {
    for (const c of fallbackUser.commissions) {
      commissionList.push({
        id: c.id,
        amount: c.amount,
        tier: c.tier,
        status: c.status,
        paidAt: c.paidAt ? c.paidAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
        storeName: c.store.name,
        storeSlug: c.store.slug,
      });
    }
  }

  // Sort commissions descending
  commissionList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const agentData: DetailSalesAgentData = {
    id: partner ? partner.id : fallbackUser!.id,
    userId: partner ? partner.userId : fallbackUser!.id,
    name: partner ? partner.name : fallbackUser!.name,
    email: partner ? partner.user.email : fallbackUser!.email,
    phone: partner ? partner.phone : fallbackUser!.phone || "-",
    referralCode: partner ? partner.code : fallbackUser!.referralCode || "SALES",
    bankName: partner ? partner.bankName || partner.user.bankName : fallbackUser!.bankName,
    bankAccount: partner ? partner.bankAccount || partner.user.bankNumber : fallbackUser!.bankNumber,
    bankHolder: partner ? partner.bankHolder || partner.user.bankHolder : fallbackUser!.bankHolder,
    isActive: partner ? partner.isActive : true,
    clientStores: clientStoresList,
    commissions: commissionList,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <SalesPortalDetailClient agent={agentData} />
      </main>
    </div>
  );
}
