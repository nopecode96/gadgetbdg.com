import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { SalesPortalClient } from "./SalesPortalClient";

export const revalidate = 0;

const COMMISSION_RATE = {
  STARTER: 50_000,
  PRO: 100_000,
  ADVANCE: 150_000,
};

export default async function SalesPortalPage() {
  const salesAgentsRaw = await prisma.user.findMany({
    where: { role: "SALES_AGENT" },
    include: {
      clientStores: {
        orderBy: { createdAt: "desc" },
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
      },
      commissions: {
        orderBy: { createdAt: "desc" },
        include: {
          store: {
            select: { name: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const allAgents = salesAgentsRaw.map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    referralCode: agent.referralCode || "SALES",
    bankName: agent.bankName,
    bankNumber: agent.bankNumber,
    bankHolder: agent.bankHolder,
    clientStores: agent.clientStores.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      tier: s.tier,
      isActive: s.isActive,
      subscriptionExpiresAt: s.subscriptionExpiresAt ? s.subscriptionExpiresAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      whatsapp: s.whatsapp,
      monthlyCommission: COMMISSION_RATE[s.tier] || 50_000,
    })),
    commissions: agent.commissions.map((c) => ({
      id: c.id,
      amount: c.amount,
      tier: c.tier,
      status: c.status,
      paidAt: c.paidAt ? c.paidAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
      storeName: c.store.name,
      storeSlug: c.store.slug,
    })),
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <SalesPortalClient allAgents={allAgents} isSuperAdmin={true} />
      </main>
    </div>
  );
}
