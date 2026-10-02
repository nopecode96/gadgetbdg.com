import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/templates/shared/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ store: string; id: string }> | { store: string; id: string };
}

export const revalidate = 0; // Dynamic server component

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").trim();
  const productId = (resolvedParams?.id || "").trim();

  const store = await prisma.store.findFirst({
    where: {
      slug: {
        equals: storeSlug,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      isActive: true,
      logoUrl: true,
      bannerUrl: true,
    },
  });

  if (!store || !store.isActive) {
    return { title: "Toko Tidak Ditemukan - GadgetBdg" };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      name: true,
      price: true,
      condition: true,
      imeiStatus: true,
      images: true,
    },
  });

  if (!product) {
    return { title: "Unit HP Tidak Ditemukan - GadgetBdg" };
  }

  const title = `${product.name} - ${store.name} | GadgetBDG`;
  const description = `Harga Rp ${Number(product.price).toLocaleString("id-ID")} - Kondisi ${
    product.condition
  } - IMEI: ${product.imeiStatus}. Siap COD & cek fisik langsung di Bandung.`;
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? String(product.images[0])
      : store.bannerUrl || store.logoUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function StoreProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").trim();
  const productId = (resolvedParams?.id || "").trim();

  if (!storeSlug || !productId) {
    notFound();
  }

  const rawStore = await prisma.store.findFirst({
    where: {
      slug: {
        equals: storeSlug,
        mode: "insensitive",
      },
    },
  });

  if (!rawStore || !rawStore.isActive) {
    notFound();
  }

  const rawProduct = await prisma.product.findFirst({
    where: {
      id: productId,
      storeId: rawStore.id,
    },
  });

  if (!rawProduct) {
    notFound();
  }

  // Sanitasi Plain Object untuk batas Client Component
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
    hasWatermark: Boolean(rawStore.hasWatermark || rawStore.tier !== "STARTER"),
  };

  const productData = {
    id: String(rawProduct.id),
    name: String(rawProduct.name),
    brand: String(rawProduct.brand),
    price: Number(rawProduct.price || 0),
    ramRom: String(rawProduct.ramRom || ""),
    batteryHealth:
      rawProduct.batteryHealth !== null && rawProduct.batteryHealth !== undefined
        ? Number(rawProduct.batteryHealth)
        : null,
    imeiStatus: String(rawProduct.imeiStatus || ""),
    completeness: String(rawProduct.completeness || ""),
    condition: String(rawProduct.condition || ""),
    minusNotes: rawProduct.minusNotes ? String(rawProduct.minusNotes) : null,
    status: String(rawProduct.status || "AVAILABLE"),
    images: Array.isArray(rawProduct.images) ? rawProduct.images.map(String) : [],
  };

  return (
    <ProductDetailView
      store={storeData}
      product={productData}
      backUrl={`/${storeData.slug}`}
    />
  );
}
