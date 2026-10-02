import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProductManagerClient } from "./ProductManagerClient";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store, limits, usage, permissions } = ctx;

  const products = await prisma.product.findMany({
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
      <ProductManagerClient
        store={serializedStore}
        initialProducts={products}
        canAddProduct={permissions.canAddProduct}
        maxActiveProducts={limits.maxActiveProducts}
        activeProductCount={usage.activeProductCount}
      />
    </div>
  );
}
