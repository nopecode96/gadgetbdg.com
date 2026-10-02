import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { SocialGeneratorClient } from "./SocialGeneratorClient";

export const revalidate = 0;

export default async function AdminSocialToolsPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeStore = stores[0];

  const products = activeStore
    ? await prisma.product.findMany({
        where: { storeId: activeStore.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNav currentSlug={activeStore?.slug} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <SocialGeneratorClient store={activeStore} products={products} />
      </main>
    </div>
  );
}
