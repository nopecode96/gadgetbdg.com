import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { DomainManagerClient } from "./DomainManagerClient";

import { requireSaasAdmin } from "@/lib/auth/session";

export const revalidate = 0;

export default async function SuperAdminDomainsPage() {
  await requireSaasAdmin();

  const storesRaw = await prisma.store.findMany({
    where: {
      tier: {
        in: ["PRO", "ADVANCE"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component boundary
  const stores = storesRaw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    customDomain: s.customDomain,
    tier: s.tier,
    whatsapp: s.whatsapp,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <DomainManagerClient stores={stores as any} />
      </main>
    </div>
  );
}
