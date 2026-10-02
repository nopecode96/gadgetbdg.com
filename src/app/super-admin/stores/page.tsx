import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { StoreManagementClient } from "./StoreManagementClient";

export const revalidate = 0;

export default async function SuperAdminStoresPage() {
  const storesRaw = await prisma.store.findMany({
    include: {
      _count: {
        select: { products: true, tradeInOffers: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component boundary
  const stores = storesRaw.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    lastTemplateChangeAt: s.lastTemplateChangeAt ? s.lastTemplateChangeAt.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <StoreManagementClient initialStores={stores as any} />
      </main>
    </div>
  );
}
