import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProductManagerClient } from "./ProductManagerClient";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store, limits, usage, permissions } = ctx;

  const [products, branches] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            mapsUrl: true,
            isMain: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.branch.findMany({
      where: { storeId: store.id },
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        address: true,
        isMain: true,
      },
    }),
  ]);

  // Serialize store for client component
  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt?.toISOString() ?? null,
    lastTemplateChangeAt: store.lastTemplateChangeAt?.toISOString() ?? null,
  };

  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <ProductManagerClient
        store={serializedStore}
        initialProducts={serializedProducts as any}
        branches={branches}
        canAddProduct={permissions.canAddProduct}
        maxActiveProducts={limits.maxActiveProducts}
        activeProductCount={usage.activeProductCount}
      />
    </div>
  );
}
