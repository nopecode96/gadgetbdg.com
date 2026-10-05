"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";
import type { StoreTier } from "@prisma/client";

export interface StoreAdminListItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  tier: StoreTier;
  planId: string;
  templateId: string;
  hasWatermark: boolean;
  lastTemplateChangeAt: string | null;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  isActive: boolean;
  isDemo: boolean;
  verifiedBadge: boolean;
  activeProductCount: number;
  template: string;
  address: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  salesPartner: {
    id: string;
    code: string;
    name: string;
    phone: string;
  } | null;
  _count: {
    products: number;
    tradeInOffers: number;
  };
}

/**
 * 1. getAllStoresAction(filters?: { search?: string, tier?: string })
 * Queries Store table with plan, users (owner), salesPartner, and counts.
 */
export async function getAllStoresAction(filters?: {
  search?: string;
  tier?: string;
}): Promise<StoreAdminListItem[]> {
  await requireSaasAdmin();

  const search = filters?.search?.trim() || "";
  const tier = filters?.tier && filters.tier !== "ALL" ? filters.tier : undefined;

  const whereClause: any = {};

  if (tier) {
    whereClause.tier = tier as StoreTier;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { customDomain: { contains: search, mode: "insensitive" } },
      {
        users: {
          some: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const storesRaw = await prisma.store.findMany({
    where: whereClause,
    include: {
      plan: true,
      referredBySales: {
        select: {
          id: true,
          code: true,
          name: true,
          phone: true,
        },
      },
      salesUser: {
        include: {
          salesPartner: {
            select: {
              id: true,
              code: true,
              name: true,
              phone: true,
            },
          },
        },
      },
      users: {
        where: { role: "STORE_OWNER" },
        select: { id: true, name: true, email: true },
        take: 1,
      },
      _count: {
        select: { products: true, tradeInOffers: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Hitung jumlah produk berstatus aktif (AVAILABLE & BOOKED) per toko
  const activeProducts = await prisma.product.groupBy({
    by: ["storeId"],
    where: {
      status: { in: ["AVAILABLE", "BOOKED"] },
    },
    _count: {
      id: true,
    },
  });

  const activeCountMap = new Map<string, number>();
  for (const item of activeProducts) {
    activeCountMap.set(item.storeId, item._count.id);
  }

  return storesRaw.map((s) => {
    const owner = s.users.length > 0 ? s.users[0] : null;
    const sales = s.referredBySales || s.salesUser?.salesPartner || null;

    return {
      id: s.id,
      name: s.name,
      slug: s.slug,
      customDomain: s.customDomain,
      whatsapp: s.whatsapp,
      tier: s.tier,
      planId: s.planId,
      templateId: s.templateId,
      hasWatermark: s.hasWatermark,
      lastTemplateChangeAt: s.lastTemplateChangeAt ? s.lastTemplateChangeAt.toISOString() : null,
      subscriptionStartedAt: s.subscriptionStartedAt ? s.subscriptionStartedAt.toISOString() : null,
      subscriptionExpiresAt: s.subscriptionExpiresAt ? s.subscriptionExpiresAt.toISOString() : null,
      isActive: s.isActive,
      isDemo: Boolean(s.isDemo),
      verifiedBadge: Boolean(s.verifiedBadge),
      activeProductCount: activeCountMap.get(s.id) ?? 0,
      template: s.template || "minimal-clean",
      address: s.address,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      owner,
      salesPartner: sales,
      _count: s._count,
    };
  });
}

/**
 * 2. updateStoreTierAction(storeId: string, newPlanId: string)
 * Updates store tier and synchronizes planId and watermark from SubscriptionPlan.
 */
export async function updateStoreTierAction(storeId: string, newPlanId: string) {
  try {
    await requireSaasAdmin();

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: newPlanId },
    });

    if (!plan) {
      return { success: false, error: `Paket dengan ID ${newPlanId} tidak ditemukan.` };
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        planId: plan.id,
        tier: plan.id as StoreTier,
        hasWatermark: plan.hasWatermark,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/domains");
    revalidatePath("/admin/settings");
    revalidatePath(`/${updated.slug}`);

    return {
      success: true,
      message: `Paket toko ${updated.name} berhasil diubah ke ${plan.name} (${plan.id}).`,
      store: {
        id: updated.id,
        tier: updated.tier,
        planId: updated.planId,
        hasWatermark: updated.hasWatermark,
      },
    };
  } catch (error: any) {
    console.error("updateStoreTierAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah paket tier toko." };
  }
}

/**
 * 3. toggleStoreStatusAction(storeId: string, isActive: boolean)
 * Activates or deactivates store operational state.
 */
export async function toggleStoreStatusAction(storeId: string, isActive: boolean) {
  try {
    await requireSaasAdmin();

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { isActive },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath(`/${updated.slug}`);

    return {
      success: true,
      message: `Status toko ${updated.name} sekarang: ${isActive ? "Aktif" : "Nonaktif (Beku)"}.`,
      store: {
        id: updated.id,
        isActive: updated.isActive,
      },
    };
  } catch (error: any) {
    console.error("toggleStoreStatusAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status toko." };
  }
}

/**
 * 4. extendStoreSubscriptionAction(storeId: string, days: number)
 * Extends store subscription duration by `days` days.
 */
export async function extendStoreSubscriptionAction(storeId: string, days: number = 30) {
  try {
    await requireSaasAdmin();

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, name: true, subscriptionExpiresAt: true, isActive: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const now = new Date();
    const baseDate =
      store.subscriptionExpiresAt && store.subscriptionExpiresAt > now
        ? new Date(store.subscriptionExpiresAt)
        : now;

    const isLifetime = days >= 10000;
    const newExpiresAt = isLifetime
      ? new Date("2099-12-31T23:59:59.999Z")
      : new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        subscriptionExpiresAt: newExpiresAt,
        isActive: true, // Otomatis aktifkan toko jika diperpanjang
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/leads");
    revalidatePath(`/${store.id}`);

    const durationLabel = isLifetime
      ? "Selamanya (Tahun 2099)"
      : `+${days} hari s/d ${newExpiresAt.toLocaleDateString("id-ID")}`;

    return {
      success: true,
      message: `Langganan ${store.name} berhasil diatur: ${durationLabel}`,
      subscriptionExpiresAt: newExpiresAt.toISOString(),
      isActive: updated.isActive,
    };
  } catch (error: any) {
    console.error("extendStoreSubscriptionAction error:", error);
    return { success: false, error: error?.message || "Gagal memperpanjang masa aktif." };
  }
}

/**
 * 5. resetTemplateCooldownAction(storeId: string)
 * Resets lastTemplateChangeAt to null so merchant can change template freely.
 */
export async function resetTemplateCooldownAction(storeId: string) {
  try {
    await requireSaasAdmin();

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { lastTemplateChangeAt: null },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/admin/settings");
    revalidatePath(`/${updated.slug}`);

    return {
      success: true,
      message: `Cooldown ganti template toko ${updated.name} berhasil di-reset.`,
      store: {
        id: updated.id,
        lastTemplateChangeAt: null,
      },
    };
  } catch (error: any) {
    console.error("resetTemplateCooldownAction error:", error);
    return { success: false, error: error?.message || "Gagal mereset cooldown tema." };
  }
}

/**
 * 6. toggleStoreVerifiedBadgeAction(storeId: string, verifiedBadge: boolean)
 * Toggles the verified badge status of a store.
 */
export async function toggleStoreVerifiedBadgeAction(storeId: string, verifiedBadge: boolean) {
  try {
    await requireSaasAdmin();

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { verifiedBadge },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath(`/${updated.slug}`);

    return {
      success: true,
      message: `Verified badge toko ${updated.name} berhasil ${verifiedBadge ? "diaktifkan" : "dinonaktifkan"}.`,
      store: {
        id: updated.id,
        verifiedBadge: updated.verifiedBadge,
      },
    };
  } catch (error: any) {
    console.error("toggleStoreVerifiedBadgeAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status verified badge." };
  }
}

/**
 * 7. toggleStoreDemoAction(storeId: string, isDemo: boolean)
 * Toggles whether a store is marked as a demo store.
 */
export async function toggleStoreDemoAction(storeId: string, isDemo: boolean) {
  try {
    await requireSaasAdmin();

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { isDemo },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath(`/${updated.slug}`);

    return {
      success: true,
      message: `Status demo toko ${updated.name} berhasil ${isDemo ? "diaktifkan" : "dinonaktifkan"}.`,
      store: {
        id: updated.id,
        isDemo: updated.isDemo,
      },
    };
  } catch (error: any) {
    console.error("toggleStoreDemoAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status demo toko." };
  }
}
