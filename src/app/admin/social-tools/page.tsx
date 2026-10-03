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

  const serializedProducts = products.map((p) => ({
    ...p,
    name: p.title || p.name || "",
    brand: p.brand,
    price: Number(p.price),
    ramRom: p.ram && p.storage ? `${p.ram} / ${p.storage}` : p.ramRom || p.storage || p.ram || "",
    batteryHealth: p.batteryHealth ? String(p.batteryHealth) : null,
    imeiStatus: p.imeiStatus || "Resmi Terdaftar",
    completeness: p.completeness || "Fullset",
    condition: p.grade || p.condition || "Mulus",
    minusNotes: p.conditionNotes || p.minusNotes || null,
    status: p.status,
    images: Array.isArray(p.images) ? p.images : [],
  }));

  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt?.toISOString() ?? null,
    lastTemplateChangeAt: store.lastTemplateChangeAt?.toISOString() ?? null,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <SocialGeneratorClient store={serializedStore} products={serializedProducts as any} />
    </div>
  );
}
