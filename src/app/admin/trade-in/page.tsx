import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { TradeInInboxClient } from "./TradeInInboxClient";

export const revalidate = 0;

export default async function AdminTradeInPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeStore = stores[0];

  const offers = activeStore
    ? await prisma.tradeInOffer.findMany({
        where: { storeId: activeStore.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNav currentSlug={activeStore?.slug} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <TradeInInboxClient store={activeStore} offers={offers} />
      </main>
    </div>
  );
}
