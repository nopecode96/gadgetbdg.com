import { prisma } from "@/lib/prisma";
import { requireSalesPartner } from "@/lib/auth/session";
import { SalesDashboardClient } from "./SalesDashboardClient";
import type { RecruitedStore, SalesCommissionItem, SalesPartnerProfile } from "./SalesDashboardClient";

export const revalidate = 0;

const COMMISSION_RATE: Record<string, number> = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

export default async function SalesPortalPage() {
  // Strictly enforce RBAC: Only SALES / SALES_AGENT (or Super Admin inspecting)
  // STORE_OWNER / STORE_STAFF are automatically redirected to /admin
  const { user, partner } = await requireSalesPartner();

  // ISOLATION: Fetch strictly this sales partner's stores and commissions
  const [storesRaw, commissionsRaw] = await Promise.all([
    // Toko yang direkrut sales partner ini
    prisma.store.findMany({
      where: {
        OR: [
          { referredBySalesId: partner.id },
          { salesUserId: user.id },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        isActive: true,
        whatsapp: true,
        createdAt: true,
      },
    }),

    // Komisi yang diatribusikan ke partner ini
    prisma.salesCommission.findMany({
      where: {
        salesPartnerId: partner.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        store: {
          select: {
            name: true,
            slug: true,
            tier: true,
          },
        },
      },
    }),
  ]);

  // Serialized data for client component
  const profile: SalesPartnerProfile = {
    id: partner.id,
    name: partner.name,
    code: partner.code,
    phone: partner.phone,
    email: user.email,
    bankName: partner.bankName,
    bankAccount: partner.bankAccount,
    bankHolder: partner.bankHolder,
  };

  const stores: RecruitedStore[] = storesRaw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tier: s.tier,
    isActive: s.isActive,
    whatsapp: s.whatsapp,
    createdAt: s.createdAt.toISOString(),
    monthlyCommission: COMMISSION_RATE[s.tier] || 50_000,
  }));

  const commissions: SalesCommissionItem[] = commissionsRaw.map((c) => ({
    id: c.id,
    storeName: c.store.name,
    storeSlug: c.store.slug,
    tier: c.store.tier,
    amount: Number(c.amount),
    status: c.status as "PENDING" | "PAID" | "CANCELLED",
    period: c.period,
    createdAt: c.createdAt.toISOString(),
    paidAt: c.paidAt ? c.paidAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <SalesDashboardClient
          profile={profile}
          stores={stores}
          commissions={commissions}
        />
      </main>
    </div>
  );
}
