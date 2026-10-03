import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { getTemplateConfig } from "@/lib/constants/templates";
import { resolveHexColor } from "@/lib/pwa-utils";

interface CustomDomainPageProps {
  params: Promise<{ domain: string }> | { domain: string };
}

export const revalidate = 0;

export async function generateMetadata({ params }: CustomDomainPageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const customDomain = (resolvedParams?.domain || "").trim();

  const store = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: customDomain,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      slug: true,
      templateId: true,
      primaryColor: true,
      bannerUrl: true,
      logoUrl: true,
      products: {
        take: 3,
        select: { name: true },
      },
    },
  });

  if (!store) {
    return {
      title: "Store Not Found",
    };
  }

  const title = `${store.name} - Storefront Resmi`;
  const productPreview = store.products.map((p) => p.name).join(", ");
  const description = `Katalog HP second berkualitas di ${store.name}. Unit teruji & bergaransi: ${
    productPreview || "Katalog HP Second Resmi"
  }.`;
  const image = store.bannerUrl || store.logoUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80";

  const themeConfig = getTemplateConfig(store.templateId || "clean-ledger");
  const themeColor = store.primaryColor?.startsWith("#")
    ? store.primaryColor
    : resolveHexColor(themeConfig.colors.accent || themeConfig.colors.bgContainer, themeConfig.colors.isDark ? "#000000" : "#0f172a");

  return {
    title,
    description,
    manifest: "/manifest.webmanifest",
    themeColor: themeColor,
    icons: {
      icon: store.logoUrl || "/icons/icon-192.png",
      apple: store.logoUrl || "/icons/icon-192.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: store.name,
    },
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: store.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CustomDomainPage({ params }: CustomDomainPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const customDomain = (resolvedParams?.domain || "").trim();

  if (!customDomain) {
    notFound();
  }

  const rawStore = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: customDomain,
        mode: "insensitive",
      },
    },
    include: {
      branches: {
        orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
      },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      products: {
        where: {
          status: { in: ["AVAILABLE", "BOOKED"] },
        },
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
    storeImage: rawStore.storeImage ? String(rawStore.storeImage) : null,
    mapsUrl: rawStore.mapsUrl ? String(rawStore.mapsUrl) : null,
    operationalHours: rawStore.operationalHours ? String(rawStore.operationalHours) : "Setiap Hari: 10:00 - 20:30 WIB",
    warrantyPolicy: rawStore.warrantyPolicy ? String(rawStore.warrantyPolicy) : "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup.",
    verifiedBadge: Boolean(rawStore.verifiedBadge),
    primaryColor: String(rawStore.primaryColor || "#2563eb"),
    bannerUrl: rawStore.bannerUrl ? String(rawStore.bannerUrl) : null,
    logoUrl: rawStore.logoUrl ? String(rawStore.logoUrl) : null,
    tier: String(rawStore.tier || "STARTER"),
    templateId: String(rawStore.templateId || "minimal-clean"),
    hasWatermark: Boolean(rawStore.hasWatermark || rawStore.tier !== "STARTER"),
    branches: (rawStore.branches || []).map((b) => ({
      id: String(b.id),
      name: String(b.name),
      address: String(b.address),
      phone: b.phone ? String(b.phone) : null,
      mapsUrl: b.mapsUrl ? String(b.mapsUrl) : null,
      isMain: Boolean(b.isMain),
    })),
    reviews: (rawStore.reviews || []).map((r) => ({
      id: String(r.id),
      customerName: String(r.customerName),
      rating: Number(r.rating || 5),
      comment: String(r.comment),
      purchasedUnit: r.purchasedUnit ? String(r.purchasedUnit) : null,
      createdAt: r.createdAt.toISOString(),
    })),
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
    branchId: p.branchId ? String(p.branchId) : null,
    branch: p.branch
      ? {
          id: String(p.branch.id),
          name: String(p.branch.name),
          address: String(p.branch.address),
          phone: p.branch.phone ? String(p.branch.phone) : null,
          mapsUrl: p.branch.mapsUrl ? String(p.branch.mapsUrl) : null,
          isMain: Boolean(p.branch.isMain),
        }
      : null,
  }));

  return <TemplateRenderer store={storeData} products={productsData} />;
}
