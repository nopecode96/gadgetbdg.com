"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";

export interface SerializedSubscriptionPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  maxActiveProducts: number;
  maxAdmins: number;
  hasWatermark: boolean;
  hasCustomDomain: boolean;
  salesCommission: number;
  description: string | null;
  updatedAt: string;
}

export interface SerializedPlatformSetting {
  id: string;
  platformName: string;
  tagline: string;
  cityCoverage: string;
  heroTitle: string;
  heroSubtitle: string;
  supportWhatsapp: string;
  supportEmail: string;
  serverIp: string;
  cnameTarget: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisImageUrl: string | null;
  updatedAt: string;
}

export interface SystemSettingsOverview {
  plans: SerializedSubscriptionPlan[];
  settings: SerializedPlatformSetting;
}

const DEFAULT_PLATFORM_SETTINGS = {
  id: "GLOBAL",
  platformName: "GadgetBdg.com",
  tagline: "Platform Toko Online Konter HP Terpercaya",
  cityCoverage: "Bandung Raya",
  heroTitle: "Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit",
  heroSubtitle: "Tingkatkan penjualan unit second & baru, kelola tukar tambah, dan miliki katalog modern tanpa repot koding.",
  supportWhatsapp: "62895389974414",
  supportEmail: "support@gadgetbdg.com",
  serverIp: "72.62.75.149",
  cnameTarget: "cname.gadgetbdg.com",
  bankName: "BCA",
  bankAccountNumber: "1234567890",
  bankAccountHolder: "PT Gadget Bandung Solusindo",
  qrisImageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
};

/**
 * 1. getSystemSettingsAction
 * Fetches all SubscriptionPlan records and PlatformSetting record.
 * Auto-creates default PlatformSetting if it doesn't exist yet.
 */
export async function getSystemSettingsAction(): Promise<SystemSettingsOverview> {
  await requireSaasAdmin();

  // 1. Get or create PlatformSetting
  let setting = await prisma.platformSetting.findUnique({
    where: { id: "GLOBAL" },
  });

  if (!setting) {
    setting = await prisma.platformSetting.upsert({
      where: { id: "GLOBAL" },
      update: {},
      create: DEFAULT_PLATFORM_SETTINGS,
    });
  }

  // 2. Get SubscriptionPlan records
  const plansRaw = await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
  });

  // Seed default sales commission if 0
  const defaultComms: Record<string, number> = {
    STARTER: 50000,
    PRO: 100000,
    ADVANCE: 150000,
  };

  const plans: SerializedSubscriptionPlan[] = [];
  for (const p of plansRaw) {
    let comm = Number(p.salesCommission);
    if (comm === 0 && defaultComms[p.id]) {
      comm = defaultComms[p.id];
      await prisma.subscriptionPlan.update({
        where: { id: p.id },
        data: { salesCommission: comm },
      });
    }

    plans.push({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      originalPrice: Number(p.originalPrice),
      maxActiveProducts: p.maxActiveProducts,
      maxAdmins: p.maxAdmins,
      hasWatermark: p.hasWatermark,
      hasCustomDomain: p.hasCustomDomain,
      salesCommission: comm,
      description: p.description,
      updatedAt: p.updatedAt.toISOString(),
    });
  }

  return {
    plans,
    settings: {
      id: setting.id,
      platformName: setting.platformName,
      tagline: setting.tagline || DEFAULT_PLATFORM_SETTINGS.tagline,
      cityCoverage: setting.cityCoverage || DEFAULT_PLATFORM_SETTINGS.cityCoverage,
      heroTitle: setting.heroTitle || DEFAULT_PLATFORM_SETTINGS.heroTitle,
      heroSubtitle: setting.heroSubtitle || DEFAULT_PLATFORM_SETTINGS.heroSubtitle,
      supportWhatsapp: setting.supportWhatsapp,
      supportEmail: setting.supportEmail || DEFAULT_PLATFORM_SETTINGS.supportEmail,
      serverIp: setting.serverIp,
      cnameTarget: setting.cnameTarget,
      bankName: setting.bankName,
      bankAccountNumber: setting.bankAccountNumber,
      bankAccountHolder: setting.bankAccountHolder,
      qrisImageUrl: setting.qrisImageUrl,
      updatedAt: setting.updatedAt.toISOString(),
    },
  };
}

/**
 * 2. updateSubscriptionPlanAction
 * Updates specific SubscriptionPlan details (price, maxActiveProducts, watermark, customDomain, salesCommission).
 * Guarded strictly for SUPER_ADMIN role.
 */
export async function updateSubscriptionPlanAction(
  planId: string,
  data: {
    price: number;
    maxProducts: number;
    hasWatermark: boolean;
    customDomain: boolean;
    salesCommission: number;
  }
) {
  try {
    const admin = await requireSaasAdmin();
    if (admin.role !== "SUPER_ADMIN") {
      return { success: false, error: "Hanya Super Admin yang berwenang mengubah konfigurasi paket langganan." };
    }

    const price = Number(data.price);
    const maxActiveProducts = Number(data.maxProducts);
    const salesCommission = Number(data.salesCommission);

    if (isNaN(price) || price < 0) {
      return { success: false, error: "Harga paket harus berupa angka valid non-negatif." };
    }

    const updated = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        price,
        maxActiveProducts,
        hasWatermark: data.hasWatermark,
        hasCustomDomain: data.customDomain,
        customDomain: data.customDomain,
        salesCommission,
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/leads");
    revalidatePath("/");

    return {
      success: true,
      message: `Konfigurasi paket ${updated.name} (${updated.id}) berhasil diperbarui!`,
      plan: {
        id: updated.id,
        name: updated.name,
        price: Number(updated.price),
        maxActiveProducts: updated.maxActiveProducts,
        hasWatermark: updated.hasWatermark,
        hasCustomDomain: updated.hasCustomDomain,
        salesCommission: Number(updated.salesCommission),
      },
    };
  } catch (error: any) {
    console.error("updateSubscriptionPlanAction error:", error);
    return { success: false, error: error?.message || "Gagal memperbarui paket langganan." };
  }
}

/**
 * 3. updatePlatformSettingsAction
 * Upserts global platform settings (payment bank, QRIS, hotline CS, server IP, CNAME).
 * Guarded strictly for SUPER_ADMIN role.
 */
export async function updatePlatformSettingsAction(data: {
  platformName?: string;
  tagline?: string;
  cityCoverage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  supportWhatsapp: string;
  supportEmail?: string;
  serverIp: string;
  cnameTarget: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisImageUrl?: string;
}) {
  try {
    const admin = await requireSaasAdmin();
    if (admin.role !== "SUPER_ADMIN") {
      return { success: false, error: "Hanya Super Admin yang berwenang mengubah konfigurasi platform." };
    }

    const cleanWhatsapp = data.supportWhatsapp?.trim().replace(/\D/g, "") || "62895389974414";
    const cleanServerIp = data.serverIp?.trim() || "72.62.75.149";
    const cleanCname = data.cnameTarget?.trim() || "cname.gadgetbdg.com";
    const bankName = data.bankName?.trim() || "BCA";
    const bankAccountNumber = data.bankAccountNumber?.trim() || "1234567890";
    const bankAccountHolder = data.bankAccountHolder?.trim() || "PT Gadget Bandung Solusindo";
    const platformName = data.platformName?.trim() || "GadgetBdg.com";
    const tagline = data.tagline?.trim() || "Platform Toko Online Konter HP Terpercaya";
    const cityCoverage = data.cityCoverage?.trim() || "Bandung Raya";
    const heroTitle = data.heroTitle?.trim() || "Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit";
    const heroSubtitle = data.heroSubtitle?.trim() || "Tingkatkan penjualan unit second & baru, kelola tukar tambah, dan miliki katalog modern tanpa repot koding.";
    const supportEmail = data.supportEmail?.trim() || "support@gadgetbdg.com";

    const updated = await prisma.platformSetting.upsert({
      where: { id: "GLOBAL" },
      update: {
        platformName,
        tagline,
        cityCoverage,
        heroTitle,
        heroSubtitle,
        supportWhatsapp: cleanWhatsapp,
        supportEmail,
        serverIp: cleanServerIp,
        cnameTarget: cleanCname,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        qrisImageUrl: data.qrisImageUrl?.trim() || null,
      },
      create: {
        id: "GLOBAL",
        platformName,
        tagline,
        cityCoverage,
        heroTitle,
        heroSubtitle,
        supportWhatsapp: cleanWhatsapp,
        supportEmail,
        serverIp: cleanServerIp,
        cnameTarget: cleanCname,
        bankName,
        bankAccountNumber,
        bankAccountHolder,
        qrisImageUrl: data.qrisImageUrl?.trim() || null,
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/super-admin/billing");
    revalidatePath("/super-admin/domains");
    revalidatePath("/super-admin");
    revalidatePath("/");

    return {
      success: true,
      message: "Pengaturan platform dan rekening penampung berhasil disimpan!",
      settings: updated,
    };
  } catch (error: any) {
    console.error("updatePlatformSettingsAction error:", error);
    return { success: false, error: error?.message || "Gagal memperbarui pengaturan platform." };
  }
}
