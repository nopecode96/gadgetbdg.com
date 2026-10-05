import { prisma } from "@/lib/prisma";
import type { SubscriptionPlan, Store } from "@prisma/client";
import { getAvailableTemplatesForTier } from "@/lib/constants/templates";

export interface PlanGuardResult<T = void> {
  allowed: boolean;
  error?: string;
  data?: T;
}

/**
 * Mengambil data Toko beserta konfigurasi SubscriptionPlan aktif dari database (SSoT).
 */
export async function getStoreWithPlan(storeId: string): Promise<(Store & { plan: SubscriptionPlan }) | null> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      plan: true,
    },
  });

  return store as (Store & { plan: SubscriptionPlan }) | null;
}

export type StoreTier = "STARTER" | "PRO" | "ADVANCE";

/**
 * Validasi batasan kuota item produk (Product Limit) berdasarkan paket langganan toko:
 * - STARTER: Maksimal 50 item produk aktif.
 * - PRO & ADVANCE: Tanpa batas (Unlimited / null).
 */
export async function checkProductLimit(storeId: string): Promise<{
  allowed: boolean;
  currentCount: number;
  maxLimit: number | null;
  tier: StoreTier;
  error?: string;
}> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return {
      allowed: false,
      currentCount: 0,
      maxLimit: 50,
      tier: "STARTER",
      error: "Toko tidak ditemukan.",
    };
  }

  const tier = (store.planId || store.tier || "STARTER") as StoreTier;
  const currentCount = await prisma.product.count({
    where: {
      storeId: store.id,
      status: { in: ["AVAILABLE", "BOOKED"] },
    },
  });

  const isStarter = tier === "STARTER";
  const maxLimit = isStarter ? 50 : null;
  const allowed = !isStarter || currentCount < 50;

  return {
    allowed,
    currentCount,
    maxLimit,
    tier,
    error: allowed
      ? undefined
      : "Batas 50 produk untuk Paket Starter telah tercapai. Silakan upgrade ke Paket Pro untuk menambah produk tanpa batas.",
  };
}

/**
 * Validasi hak akses penambahan stok produk berdasarkan kuota aktif.
 * SSoT: Starter maks 50, Pro & Advance unlimited.
 */
export async function assertCanAddProduct(storeId: string): Promise<PlanGuardResult<{ activeCount: number; maxActive: number | null }>> {
  const limitCheck = await checkProductLimit(storeId);
  if (!limitCheck.allowed) {
    return {
      allowed: false,
      error: limitCheck.error || "Batas 50 produk untuk Paket Starter telah tercapai. Silakan upgrade ke Paket Pro untuk menambah produk tanpa batas.",
      data: { activeCount: limitCheck.currentCount, maxActive: limitCheck.maxLimit },
    };
  }

  return {
    allowed: true,
    data: { activeCount: limitCheck.currentCount, maxActive: limitCheck.maxLimit },
  };
}

/**
 * Validasi pergantian template berdasarkan aturan SubscriptionPlan:
 * - STARTER (templateCooldownDays = -1): Hanya 1x saat pendaftaran.
 * - PRO (templateCooldownDays = 30): Cooldown 30 hari.
 * - ADVANCE (templateCooldownDays = 0): Bebas kapan saja.
 * Serta memvalidasi apakah templateId yang dituju masuk dalam kuota template tier (2, 4, atau 6 template).
 */
export async function assertCanChangeTemplate(storeId: string, newTemplateId: string): Promise<PlanGuardResult> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  const plan = store.plan;

  // 1. Verifikasi apakah newTemplateId diizinkan untuk paket ini
  const tierKey = (store.planId || store.tier) as "STARTER" | "PRO" | "ADVANCE";
  const allowedTemplates = getAvailableTemplatesForTier(tierKey);
  const isTemplateAllowed = allowedTemplates.some(
    (t) => t.id === newTemplateId || (newTemplateId === "tokyo-street" && t.id === "tokyo-editorial")
  );

  if (!isTemplateAllowed) {
    return {
      allowed: false,
      error: `Template ini hanya tersedia untuk paket yang lebih tinggi (${plan.availableTemplatesCount} template diizinkan untuk ${plan.name}). Silakan upgrade paket langganan Anda.`,
    };
  }

  // Jika memilih template yang sama dengan yang aktif saat ini, izinkan tanpa penolakan
  if (store.templateId === newTemplateId) {
    return { allowed: true };
  }

  // 2. Evaluasi Cooldown Pergantian Template
  // Starter: templateCooldownDays === -1 (hanya 1x saat pendaftaran)
  if (plan.templateCooldownDays === -1) {
    return {
      allowed: false,
      error: `Paket ${plan.name} hanya mengizinkan pemilihan template 1x saat pendaftaran toko. Upgrade ke paket Pro untuk mengganti template tiap 30 hari atau Advance untuk bebas mengganti tema kapan saja.`,
    };
  }

  // Pro: templateCooldownDays === 30 (1x per 30 hari)
  if (plan.templateCooldownDays > 0 && store.lastTemplateChangeAt) {
    const now = new Date();
    const lastChange = new Date(store.lastTemplateChangeAt);
    const diffMs = now.getTime() - lastChange.getTime();
    const diffDays = diffMs / (1000 * 3600 * 24);

    if (diffDays < plan.templateCooldownDays) {
      const nextAvailableDate = new Date(lastChange.getTime() + plan.templateCooldownDays * 24 * 3600 * 1000);
      const formattedDate = nextAvailableDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      return {
        allowed: false,
        error: `Paket ${plan.name} memiliki jeda (cooldown) ganti template ${plan.templateCooldownDays} hari. Anda baru dapat mengganti tema kembali pada ${formattedDate}. Upgrade ke Advance untuk bebas ganti tema kapan saja.`,
      };
    }
  }

  // Advance: templateCooldownDays === 0 (bebas kapan saja)
  return { allowed: true };
}

/**
 * Validasi akses fitur Google Review QR Stand.
 * Terbuka penuh untuk semua paket (Starter, Pro, Advance).
 */
export async function assertCanAccessQrGoogleReview(storeId: string): Promise<PlanGuardResult> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  return { allowed: true };
}

/**
 * Validasi akses fitur Generator Media & Caption Medsos (Marketing Generator & Story Card 9:16).
 * Terbuka penuh untuk SEMUA paket (STARTER & PRO) tanpa lock barrier.
 */
export async function assertCanAccessMarketingGenerator(storeId: string): Promise<PlanGuardResult> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  return { allowed: true };
}

/**
 * Generic feature flag guard berdasarkan kolom boolean SubscriptionPlan.
 */
export async function assertFeatureAccess(
  storeId: string,
  featureKey: keyof Pick<SubscriptionPlan, "hasWatermark" | "hasQrWebsite" | "hasQrGoogleReview" | "hasStoryMaker" | "hasCustomDomain">
): Promise<PlanGuardResult> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  // Fitur QR Website, QR Google Review, dan Story Maker / Marketing terbuka untuk semua paket
  if (
    featureKey === "hasStoryMaker" ||
    featureKey === "hasQrWebsite" ||
    featureKey === "hasQrGoogleReview"
  ) {
    return { allowed: true };
  }

  const hasAccess = Boolean(store.plan[featureKey]);
  if (!hasAccess) {
    return {
      allowed: false,
      error: `Fitur ${featureKey} tidak termasuk dalam paket ${store.plan.name}. Silakan upgrade paket langganan Anda.`,
    };
  }

  return { allowed: true };
}
