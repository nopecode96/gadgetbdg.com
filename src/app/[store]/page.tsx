import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";

interface StorePageProps {
  params: Promise<{ store: string }> | { store: string };
}

export const revalidate = 0; // Dynamic server component

export default async function StorePage({ params }: StorePageProps) {
  // Safe params unwrap (handles Promise in Next.js 14/15 and plain object)
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").trim();

  if (!storeSlug) {
    notFound();
  }

  // Query store with case-insensitive check and products
  const rawStore = await prisma.store.findFirst({
    where: {
      slug: {
        equals: storeSlug,
        mode: "insensitive",
      },
    },
    include: {
      products: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!rawStore || !rawStore.isActive) {
    notFound();
  }

  // Deep plain-object sanitization for Client Components boundary
  const storeData = {
    id: String(rawStore.id),
    name: String(rawStore.name),
    slug: String(rawStore.slug),
    whatsapp: String(rawStore.whatsapp || ""),
    address: rawStore.address ? String(rawStore.address) : null,
    mapsUrl: rawStore.mapsUrl ? String(rawStore.mapsUrl) : null,
    primaryColor: String(rawStore.primaryColor || "#2563eb"),
    bannerUrl: rawStore.bannerUrl ? String(rawStore.bannerUrl) : null,
    logoUrl: rawStore.logoUrl ? String(rawStore.logoUrl) : null,
    tier: String(rawStore.tier || "STARTER"),
    templateId: String(rawStore.templateId || "minimal-clean"),
  };

  const productsData = (rawStore.products || []).map((p) => ({
    id: String(p.id),
    name: String(p.name),
    brand: String(p.brand),
    price: Number(p.price || 0),
    ramRom: String(p.ramRom || ""),
    batteryHealth: p.batteryHealth !== null && p.batteryHealth !== undefined ? Number(p.batteryHealth) : null,
    imeiStatus: String(p.imeiStatus || ""),
    completeness: String(p.completeness || ""),
    condition: String(p.condition || ""),
    minusNotes: p.minusNotes ? String(p.minusNotes) : null,
    status: String(p.status || "AVAILABLE"),
    images: Array.isArray(p.images) ? p.images.map(String) : [],
  }));

  return <TemplateRenderer store={storeData} products={productsData} />;
}
