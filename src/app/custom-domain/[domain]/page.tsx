import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { getTemplateConfig } from "@/lib/constants/templates";
import { resolveHexColor } from "@/lib/pwa-utils";

interface CustomDomainPageProps {
  params: Promise<{ domain: string }> | { domain: string };
  searchParams?: Promise<{ branch?: string }> | { branch?: string };
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
        select: { title: true, name: true },
      },
    },
  });

  if (!store) {
    return {
      title: "Store Not Found",
    };
  }

  const title = `${store.name} - Storefront Resmi`;
  const productPreview = store.products.map((p) => p.title || p.name).join(", ");
  const description = `Katalog HP second berkualitas di ${store.name}. ${
    productPreview ? `Unit teruji & bergaransi: ${productPreview}.` : ""
  }`;
  const image = store.bannerUrl || store.logoUrl || "/icons/icon-192.png";

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
      icon: store.logoUrl || "/icon.png",
      apple: store.logoUrl || "/apple-icon.png",
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

export default async function CustomDomainPage({ params, searchParams }: CustomDomainPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const customDomain = (resolvedParams?.domain || "").trim();
  const requestedBranchSlug = (resolvedSearchParams?.branch || "").trim().toLowerCase();

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
        include: {
          branch: {
            select: { id: true, name: true, slug: true },
          },
        },
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
              slug: true,
              address: true,
              whatsapp: true,
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

  // Branch matching for Advance tier
  const isAdvanceTier = rawStore.tier === "ADVANCE" || rawStore.planId === "ADVANCE";
  const matchedBranch = requestedBranchSlug && isAdvanceTier
    ? (rawStore.branches || []).find((b) => (b.slug || "").toLowerCase() === requestedBranchSlug)
    : null;

  const activeWhatsapp = matchedBranch?.whatsapp || matchedBranch?.phone || rawStore.whatsapp || "";
  const activeAddress = matchedBranch?.address || rawStore.address;
  const activeMapsUrl = matchedBranch?.googleMapsUrl || matchedBranch?.mapsUrl || rawStore.mapsUrl;
  const activeImage = matchedBranch?.image || rawStore.storeImage || rawStore.bannerUrl || null;
  const activeOperationalHours = matchedBranch?.businessHours || rawStore.operationalHours || null;
  const activeWarrantyPolicy = matchedBranch?.warrantyInfo || rawStore.warrantyPolicy || null;
  const activeGoogleReviewUrl = matchedBranch?.googleReviewUrl || rawStore.googleReviewUrl || null;

  const filteredRawProducts = matchedBranch
    ? (rawStore.products || []).filter((p) => p.branchId === matchedBranch.id)
    : rawStore.products || [];

  // Filter reviews: If branch mode, load specific branch reviews + general reviews (branchId: null)
  const filteredRawReviews = matchedBranch
    ? (rawStore.reviews || []).filter((r) => r.branchId === matchedBranch.id || !r.branchId)
    : rawStore.reviews || [];

  // Deep plain-object sanitization for Client Components boundary
  const storeData = {
    id: String(rawStore.id),
    name: matchedBranch ? `${rawStore.name} (${matchedBranch.name})` : String(rawStore.name),
    slug: String(rawStore.slug),
    whatsapp: String(activeWhatsapp),
    address: activeAddress ? String(activeAddress) : null,
    storeImage: activeImage ? String(activeImage) : null,
    mapsUrl: activeMapsUrl ? String(activeMapsUrl) : null,
    googleReviewUrl: activeGoogleReviewUrl ? String(activeGoogleReviewUrl) : null,
    operationalHours: activeOperationalHours ? String(activeOperationalHours) : null,
    warrantyPolicy: activeWarrantyPolicy ? String(activeWarrantyPolicy) : null,
    verifiedBadge: Boolean(rawStore.verifiedBadge),
    primaryColor: String(rawStore.primaryColor || "#2563eb"),
    bannerUrl: rawStore.bannerUrl ? String(rawStore.bannerUrl) : null,
    logoUrl: rawStore.logoUrl ? String(rawStore.logoUrl) : null,
    tier: String(rawStore.tier || "STARTER"),
    templateId: String(rawStore.templateId || "minimal-clean"),
    hasWatermark: Boolean(rawStore.hasWatermark || rawStore.tier !== "STARTER"),
    promoBannerActive: rawStore.promoBannerActive !== false,
    promoBannerBadge: rawStore.promoBannerBadge ? String(rawStore.promoBannerBadge) : null,
    promoBannerTitle: rawStore.promoBannerTitle ? String(rawStore.promoBannerTitle) : null,
    promoBannerSubtitle: rawStore.promoBannerSubtitle ? String(rawStore.promoBannerSubtitle) : null,
    promoBannerImage: rawStore.promoBannerImage ? String(rawStore.promoBannerImage) : null,
    promoBannerCtaText: rawStore.promoBannerCtaText ? String(rawStore.promoBannerCtaText) : null,
    promoBannerCtaLink: rawStore.promoBannerCtaLink ? String(rawStore.promoBannerCtaLink) : null,
    branches: (rawStore.branches || []).map((b) => ({
      id: String(b.id),
      name: String(b.name),
      slug: b.slug ? String(b.slug) : "",
      address: String(b.address),
      whatsapp: b.whatsapp || b.phone || "",
      phone: b.phone ? String(b.phone) : null,
      mapsUrl: b.googleMapsUrl || b.mapsUrl ? String(b.googleMapsUrl || b.mapsUrl) : null,
      image: b.image ? String(b.image) : null,
      googleReviewUrl: b.googleReviewUrl ? String(b.googleReviewUrl) : null,
      businessHours: b.businessHours ? String(b.businessHours) : null,
      warrantyInfo: b.warrantyInfo ? String(b.warrantyInfo) : null,
      isMain: Boolean(b.isMain),
    })),
    reviews: (filteredRawReviews || []).map((r) => ({
      id: String(r.id),
      customerName: String(r.customerName),
      rating: Number(r.rating || 5),
      comment: String(r.comment),
      purchasedUnit: r.purchasedUnit ? String(r.purchasedUnit) : null,
      branchId: r.branchId ? String(r.branchId) : null,
      branchName: r.branch?.name ? String(r.branch.name) : null,
      reviewDate: (r.reviewDate || r.createdAt).toISOString(),
      createdAt: r.createdAt.toISOString(),
    })),
  };

  const productsData = (filteredRawProducts || []).map((p) => ({
    id: String(p.id),
    name: String(p.title || p.name || ""),
    title: String(p.title || p.name || ""),
    slug: String(p.slug || ""),
    category: String(p.category || "SMARTPHONE"),
    brand: String(p.brand),
    price: Number(p.price || 0),
    grade: p.grade ? String(p.grade) : (p.condition ? String(p.condition) : null),
    ram: p.ram ? String(p.ram) : null,
    storage: p.storage ? String(p.storage) : null,
    ramRom: p.ram && p.storage ? `${p.ram} / ${p.storage}` : String(p.storage || p.ram || p.ramRom || ""),
    batteryHealth: p.batteryHealth !== null && p.batteryHealth !== undefined ? String(p.batteryHealth) : null,
    imeiStatus: String(p.imeiStatus || "Resmi Terdaftar"),
    completeness: String(p.completeness || ""),
    condition: String(p.grade || p.condition || ""),
    conditionNotes: p.conditionNotes ? String(p.conditionNotes) : (p.minusNotes ? String(p.minusNotes) : null),
    minusNotes: p.conditionNotes ? String(p.conditionNotes) : (p.minusNotes ? String(p.minusNotes) : null),
    description: p.description ? String(p.description) : null,
    status: String(p.status || "AVAILABLE"),
    isFeatured: Boolean(p.isFeatured),
    isReadyCod: p.isReadyCod !== undefined ? Boolean(p.isReadyCod) : true,
    images: Array.isArray(p.images) ? p.images.map(String) : [],
    branchId: p.branchId ? String(p.branchId) : null,
    branch: p.branch
      ? {
          id: String(p.branch.id),
          name: String(p.branch.name),
          address: String(p.branch.address),
          whatsapp: p.branch.whatsapp || p.branch.phone || null,
          phone: p.branch.phone ? String(p.branch.phone) : null,
          mapsUrl: p.branch.mapsUrl ? String(p.branch.mapsUrl) : null,
          isMain: Boolean(p.branch.isMain),
        }
      : null,
  }));

  return <TemplateRenderer store={storeData} products={productsData} />;
}
