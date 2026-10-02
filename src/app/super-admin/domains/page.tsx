import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { DomainManagerClient } from "./DomainManagerClient";

export const revalidate = 0;

export default async function SuperAdminDomainsPage() {
  const stores = await prisma.store.findMany({
    where: {
      tier: {
        in: ["PRO", "ADVANCE"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <DomainManagerClient stores={stores as any} />
      </main>
    </div>
  );
}
