import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TradeInInboxClient } from "./TradeInInboxClient";

export const revalidate = 0;

export default async function AdminTradeInPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const offers = await prisma.tradeInOffer.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  // Serialize store for client component
  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt?.toISOString() ?? null,
    lastTemplateChangeAt: store.lastTemplateChangeAt?.toISOString() ?? null,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <TradeInInboxClient store={serializedStore} offers={offers} />
    </div>
  );
}
