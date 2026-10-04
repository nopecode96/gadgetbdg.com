import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailView } from "@/components/templates/shared/ProductDetailView";
import { extractProductLookup, generateProductSlug, getProductDetailUrl } from "@/lib/product-slug";

interface CustomDomainProductPageProps {
  params: Promise<{ domain: string; id: string }> | { domain: string; id: string };
}

export const revalidate = 0; // Dynamic server component

export async function generateMetadata({ params }: CustomDomainProductPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const customDomain = (resolvedParams?.domain || "").trim();
  const productId = (resolvedParams?.id || "").trim();

  const store = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: customDomain,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      isActive: true,
      logoUrl: true,
      bannerUrl: true,
    },
  });

  if (!store || !store.isActive) {
    return { title: "Store Not Found" };
  }

  const { rawId, shortId, slug } = extractProductLookup(productId);
  const lookupOrConditions: any[] = [{ id: productId }];
  if (rawId && rawId !== productId) {
    lookupOrConditions.push({ id: rawId });
  }
  if (shortId) {
    lookupOrConditions.push({ id: { startsWith: shortId } });
  }
  if (slug) {
    lookupOrConditions.push({ slug });
    lookupOrConditions.push({ slug: { equals: slug, mode: "insensitive" } });
  }

  const product = await prisma.product.findFirst({
    where: {
      storeId: store.id,
      OR: lookupOrConditions,
    },
    select: {
      id: true,
      title: true,
      name: true,
      slug: true,
      price: true,
      condition: true,
      grade: true,
      imeiStatus: true,
      images: true,
    },
  });

  if (!product) {
    return { title: "Unit HP Tidak Ditemukan" };
  }

  const productName = product.title || product.name || "Unit HP";
  const title = `${productName} - ${store.name}`;
  const description = `Harga Rp ${Number(product.price).toLocaleString("id-ID")} - Kondisi ${
    product.grade || product.condition
  } - IMEI: ${product.imeiStatus}. Siap COD & cek fisik langsung.`;
  const image =
    Array.isArray(product.images) && product.images.length > 0
      ? String(product.images[0])
      : store.bannerUrl || store.logoUrl || "/icons/icon-192.png";

  const canonicalUrl = getProductDetailUrl(store.slug, product, true);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: {
      icon: store.logoUrl || "/icon.png",
      apple: store.logoUrl || "/apple-icon.png",
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: image, width: 1200, height: 630, alt: productName }],
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

export default async function CustomDomainProductDetailPage({
  params,
}: CustomDomainProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const customDomain = (resolvedParams?.domain || "").trim();
  const productId = (resolvedParams?.id || "").trim();

  if (!customDomain || !productId) {
    notFound();
  }

  const rawStore = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: customDomain,
        mode: "insensitive",
      },
    },
  });

  if (!rawStore || !rawStore.isActive) {
    notFound();
  }

  const { rawId, shortId, slug } = extractProductLookup(productId);
  const lookupOrConditions: any[] = [{ id: productId }];
  if (rawId && rawId !== productId) {
    lookupOrConditions.push({ id: rawId });
  }
  if (shortId) {
    lookupOrConditions.push({ id: { startsWith: shortId } });
  }
  if (slug) {
    lookupOrConditions.push({ slug });
    lookupOrConditions.push({ slug: { equals: slug, mode: "insensitive" } });
  }

  const rawProduct = await prisma.product.findFirst({
    where: {
      storeId: rawStore.id,
      OR: lookupOrConditions,
    },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          address: true,
          whatsapp: true,
          phone: true,
          mapsUrl: true,
          googleMapsUrl: true,
          image: true,
          businessHours: true,
          warrantyInfo: true,
          isMain: true,
        },
      },
    },
  });

  if (!rawProduct) {
    notFound();
  }

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
    isTenantHost: true,
  };

  const canonicalSlug =
    rawProduct.slug && rawProduct.slug.trim() !== ""
      ? rawProduct.slug.trim()
      : generateProductSlug(rawProduct.title || rawProduct.name || "unit", rawProduct.id);

  const productData = {
    id: String(rawProduct.id),
    name: String(rawProduct.title || rawProduct.name || ""),
    title: String(rawProduct.title || rawProduct.name || ""),
    slug: canonicalSlug,
    category: String(rawProduct.category || "SMARTPHONE"),
    brand: String(rawProduct.brand),
    price: Number(rawProduct.price || 0),
    grade: rawProduct.grade ? String(rawProduct.grade) : (rawProduct.condition ? String(rawProduct.condition) : null),
    ram: rawProduct.ram ? String(rawProduct.ram) : null,
    storage: rawProduct.storage ? String(rawProduct.storage) : null,
    ramRom: rawProduct.ram && rawProduct.storage ? `${rawProduct.ram} / ${rawProduct.storage}` : String(rawProduct.storage || rawProduct.ram || rawProduct.ramRom || ""),
    batteryHealth:
      rawProduct.batteryHealth !== null && rawProduct.batteryHealth !== undefined
        ? String(rawProduct.batteryHealth)
        : null,
    imeiStatus: String(rawProduct.imeiStatus || "Resmi Terdaftar"),
    completeness: String(rawProduct.completeness || ""),
    condition: String(rawProduct.grade || rawProduct.condition || ""),
    conditionNotes: rawProduct.conditionNotes ? String(rawProduct.conditionNotes) : (rawProduct.minusNotes ? String(rawProduct.minusNotes) : null),
    minusNotes: rawProduct.conditionNotes ? String(rawProduct.conditionNotes) : (rawProduct.minusNotes ? String(rawProduct.minusNotes) : null),
    description: rawProduct.description ? String(rawProduct.description) : null,
    warrantyBonus: (rawProduct as any).warrantyBonus ? String((rawProduct as any).warrantyBonus) : (rawProduct.description ? String(rawProduct.description) : null),
    thumbnail: (rawProduct as any).thumbnail ? String((rawProduct as any).thumbnail) : (Array.isArray(rawProduct.images) && rawProduct.images.length > 0 ? String(rawProduct.images[0]) : null),
    status: String(rawProduct.status || "AVAILABLE"),
    images: Array.isArray(rawProduct.images) ? rawProduct.images.map(String) : [],
    branchId: rawProduct.branchId ? String(rawProduct.branchId) : null,
    branch: rawProduct.branch
      ? {
          id: String(rawProduct.branch.id),
          name: String(rawProduct.branch.name),
          address: String(rawProduct.branch.address),
          whatsapp: rawProduct.branch.whatsapp || rawProduct.branch.phone || null,
          phone: rawProduct.branch.phone ? String(rawProduct.branch.phone) : null,
          mapsUrl: rawProduct.branch.googleMapsUrl || rawProduct.branch.mapsUrl ? String(rawProduct.branch.googleMapsUrl || rawProduct.branch.mapsUrl) : null,
          googleMapsUrl: rawProduct.branch.googleMapsUrl ? String(rawProduct.branch.googleMapsUrl) : null,
          image: rawProduct.branch.image ? String(rawProduct.branch.image) : null,
          businessHours: rawProduct.branch.businessHours ? String(rawProduct.branch.businessHours) : null,
          warrantyInfo: rawProduct.branch.warrantyInfo ? String(rawProduct.branch.warrantyInfo) : null,
          isMain: Boolean(rawProduct.branch.isMain),
        }
      : null,
  };

  return (
    <ProductDetailView
      store={storeData}
      product={productData}
      backUrl="/"
    />
  );
}
