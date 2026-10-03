"use server";

import { prisma } from "@/lib/prisma";

export interface LandingPageData {
  settings: {
    platformName: string;
    tagline: string;
    cityCoverage: string;
    heroTitle: string;
    heroSubtitle: string;
    supportWhatsapp: string;
    supportEmail: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolder: string;
    qrisImageUrl: string | null;
    serverIp: string;
    cnameTarget: string;
  };
  plans: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    maxActiveProducts: number;
    maxAdmins: number;
    hasWatermark: boolean;
    hasCustomDomain: boolean;
    description: string | null;
  }[];
  featuredStores: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
    tier: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    productCount: number;
  }[];
}

const DEFAULT_SETTINGS = {
  platformName: "GadgetBdg.com",
  tagline: "Platform Toko Online Konter HP Terpercaya",
  cityCoverage: "Bandung Raya",
  heroTitle: "Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit",
  heroSubtitle: "Tingkatkan penjualan unit second & baru, kelola tukar tambah, dan miliki katalog modern tanpa repot koding.",
  supportWhatsapp: "62895389974414",
  supportEmail: "support@gadgetbdg.com",
  bankName: "BCA",
  bankAccountNumber: "1234567890",
  bankAccountHolder: "PT Gadget Bandung Solusindo",
  qrisImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
  serverIp: "72.62.75.149",
  cnameTarget: "cname.gadgetbdg.com",
};

/**
 * getLandingPageDataAction
 * Public query action for Homepage / Landing Page.
 * Returns PlatformSetting, ordered SubscriptionPlans, and active featured stores.
 */
export async function getLandingPageDataAction(): Promise<LandingPageData> {
  const [settingRecord, plansRaw, storesRaw] = await Promise.all([
    prisma.platformSetting.findUnique({
      where: { id: "GLOBAL" },
    }),
    prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsapp: true,
        tier: true,
        logoUrl: true,
        bannerUrl: true,
        _count: {
          select: { products: true },
        },
      },
    }),
  ]);

  const settings = {
    platformName: settingRecord?.platformName || DEFAULT_SETTINGS.platformName,
    tagline: settingRecord?.tagline || DEFAULT_SETTINGS.tagline,
    cityCoverage: settingRecord?.cityCoverage || DEFAULT_SETTINGS.cityCoverage,
    heroTitle: settingRecord?.heroTitle || DEFAULT_SETTINGS.heroTitle,
    heroSubtitle: settingRecord?.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle,
    supportWhatsapp: settingRecord?.supportWhatsapp || DEFAULT_SETTINGS.supportWhatsapp,
    supportEmail: settingRecord?.supportEmail || DEFAULT_SETTINGS.supportEmail,
    bankName: settingRecord?.bankName || DEFAULT_SETTINGS.bankName,
    bankAccountNumber: settingRecord?.bankAccountNumber || DEFAULT_SETTINGS.bankAccountNumber,
    bankAccountHolder: settingRecord?.bankAccountHolder || DEFAULT_SETTINGS.bankAccountHolder,
    qrisImageUrl: settingRecord?.qrisImageUrl || DEFAULT_SETTINGS.qrisImageUrl,
    serverIp: settingRecord?.serverIp || DEFAULT_SETTINGS.serverIp,
    cnameTarget: settingRecord?.cnameTarget || DEFAULT_SETTINGS.cnameTarget,
  };

  const plans = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    maxActiveProducts: p.maxActiveProducts,
    maxAdmins: p.maxAdmins,
    hasWatermark: p.hasWatermark,
    hasCustomDomain: p.hasCustomDomain,
    description: p.description,
  }));

  const featuredStores = storesRaw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    whatsapp: s.whatsapp,
    tier: s.tier,
    logoUrl: s.logoUrl,
    bannerUrl: s.bannerUrl,
    productCount: s._count.products,
  }));

  return {
    settings,
    plans,
    featuredStores,
  };
}
