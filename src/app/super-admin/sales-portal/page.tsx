import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { requireSalesAgent } from "@/lib/auth/session";
import {
  SalesPortalMasterClient,
  MasterSalesPartnerItem,
  GlobalSalesMetrics,
} from "./SalesPortalMasterClient";

export const revalidate = 0;

export const metadata = {
  title: "Sales & Affiliate Portal | Super Admin",
};

const COMMISSION_RATE: Record<string, number> = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

export default async function SalesPortalMasterPage() {
  await requireSalesAgent();

  // 1. Ambil data seluruh SalesPartner beserta toko binaan & komisi
  const partnersRaw = await prisma.salesPartner.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          referralCode: true,
          bankName: true,
          bankNumber: true,
          bankHolder: true,
          createdAt: true,
        },
      },
      stores: {
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          isActive: true,
          createdAt: true,
        },
      },
      commissions: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Ambil juga user dengan role SALES/SALES_AGENT yang mungkin belum terhubung SalesPartner (backward compatibility)
  const salesUsersRaw = await prisma.user.findMany({
    where: {
      role: { in: ["SALES", "SALES_AGENT"] },
      salesPartner: null, // Hanya ambil jika belum ada di tabel SalesPartner
    },
    include: {
      clientStores: {
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          isActive: true,
          createdAt: true,
        },
      },
      commissions: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Gabungkan semua data sales partner
  const masterPartners: MasterSalesPartnerItem[] = [];
  const uniqueStoreIds = new Set<string>();

  let globalPendingCommission = 0;
  let globalPaidCommission = 0;

  for (const p of partnersRaw) {
    // Toko binaan sales partner
    const stores = p.stores;
    for (const s of stores) uniqueStoreIds.add(s.id);

    const activeStores = stores.filter((s) => s.isActive);

    // Hitung komisi
    const pendingComm = p.commissions
      .filter((c) => c.status === "PENDING")
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const paidComm = p.commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    globalPendingCommission += pendingComm;
    globalPaidCommission += paidComm;

    const estimatedNextMonth = activeStores.reduce(
      (sum, s) => sum + (COMMISSION_RATE[s.tier] || 50_000),
      0
    );

    masterPartners.push({
      id: p.id,
      userId: p.userId,
      name: p.name || p.user.name,
      email: p.user.email,
      phone: p.phone || p.user.phone || "-",
      referralCode: p.code || p.user.referralCode || "SALES",
      bankName: p.bankName || p.user.bankName,
      bankAccount: p.bankAccount || p.user.bankNumber,
      bankHolder: p.bankHolder || p.user.bankHolder || p.name,
      isActive: p.isActive,
      activeStoresCount: activeStores.length,
      totalStoresCount: stores.length,
      pendingCommission: pendingComm,
      paidCommission: paidComm,
      estimatedNextMonth,
      createdAt: p.createdAt.toISOString(),
    });
  }

  // Tambahkan salesUsersRaw jika ada
  for (const u of salesUsersRaw) {
    const stores = u.clientStores;
    for (const s of stores) uniqueStoreIds.add(s.id);

    const activeStores = stores.filter((s) => s.isActive);

    const pendingComm = u.commissions
      .filter((c) => c.status === "PENDING")
      .reduce((sum, c) => sum + c.amount, 0);
    const paidComm = u.commissions
      .filter((c) => c.status === "PAID")
      .reduce((sum, c) => sum + c.amount, 0);

    globalPendingCommission += pendingComm;
    globalPaidCommission += paidComm;

    const estimatedNextMonth = activeStores.reduce(
      (sum, s) => sum + (COMMISSION_RATE[s.tier] || 50_000),
      0
    );

    masterPartners.push({
      id: u.id,
      userId: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || "-",
      referralCode: u.referralCode || "SALES",
      bankName: u.bankName,
      bankAccount: u.bankNumber,
      bankHolder: u.bankHolder || u.name,
      isActive: true,
      activeStoresCount: activeStores.length,
      totalStoresCount: stores.length,
      pendingCommission: pendingComm,
      paidCommission: paidComm,
      estimatedNextMonth,
      createdAt: u.createdAt.toISOString(),
    });
  }

  const metrics: GlobalSalesMetrics = {
    totalActiveSales: masterPartners.filter((p) => p.isActive).length,
    totalClientStores: uniqueStoreIds.size,
    totalPendingCommission: globalPendingCommission,
    totalPaidCommission: globalPaidCommission,
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <SalesPortalMasterClient initialPartners={masterPartners} metrics={metrics} />
      </main>
    </div>
  );
}
