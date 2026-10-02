import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { LeadsManagerClient } from "./LeadsManagerClient";

import { requireSaasAdmin } from "@/lib/auth/session";

export const revalidate = 0;

export default async function SuperAdminLeadsPage() {
  await requireSaasAdmin();

  const inactiveStoresRaw = await prisma.store.findMany({
    where: {
      isActive: false,
    },
    include: {
      users: {
        where: { role: "STORE_OWNER" },
        select: { id: true, name: true, email: true },
      },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          receiptUrl: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for Client Component
  const leads = inactiveStoresRaw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tier: s.tier,
    whatsapp: s.whatsapp,
    templateId: s.templateId,
    createdAt: s.createdAt.toISOString(),
    owner: s.users.length > 0 ? s.users[0] : null,
    payments: s.payments.map((p) => ({
      id: p.id,
      status: p.status,
      receiptUrl: p.receiptUrl,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <LeadsManagerClient initialLeads={leads as any} />
      </main>
    </div>
  );
}
