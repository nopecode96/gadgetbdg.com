import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { SocialGeneratorClient } from "./SocialGeneratorClient";

export const revalidate = 0;

export default async function AdminSocialToolsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt?.toISOString() ?? null,
    lastTemplateChangeAt: store.lastTemplateChangeAt?.toISOString() ?? null,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <SocialGeneratorClient store={serializedStore} products={products} />
    </div>
  );
}
