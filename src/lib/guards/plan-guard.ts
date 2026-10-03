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

/**
 * Validasi hak akses penambahan stok produk berdasarkan kuota aktif di tabel SubscriptionPlan.
 */
export async function assertCanAddProduct(storeId: string): Promise<PlanGuardResult<{ activeCount: number; maxActive: number }>> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  const plan = store.plan;
  const activeCount = await prisma.product.count({
    where: {
      storeId: store.id,
      status: { in: ["AVAILABLE", "BOOKED"] },
    },
  });

  // Advance / unlimited threshold
  const isUnlimited = plan.maxActiveProducts >= 999999;
  if (!isUnlimited && activeCount >= plan.maxActiveProducts) {
    return {
      allowed: false,
      error: `Kuota stok aktif paket ${plan.name} sudah penuh (${activeCount}/${plan.maxActiveProducts} unit). Ubah status unit terjual ke SOLD, atau upgrade ke paket yang lebih tinggi untuk menambah lebih banyak unit.`,
      data: { activeCount, maxActive: plan.maxActiveProducts },
    };
  }

  return {
    allowed: true,
    data: { activeCount, maxActive: plan.maxActiveProducts },
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
 * Hanya tersedia untuk Pro dan Advance.
 */
export async function assertCanAccessQrGoogleReview(storeId: string): Promise<PlanGuardResult> {
  const store = await getStoreWithPlan(storeId);
  if (!store) {
    return { allowed: false, error: "Toko tidak ditemukan." };
  }

  if (!store.plan.hasQrGoogleReview) {
    return {
      allowed: false,
      error: `Fitur Cetak QR Code Google Review hanya tersedia untuk Paket Pro dan Advance. Paket ${store.plan.name} hanya mencakup QR Stand Website Toko.`,
    };
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

  const hasAccess = Boolean(store.plan[featureKey]);
  if (!hasAccess) {
    return {
      allowed: false,
      error: `Fitur ${featureKey} tidak termasuk dalam paket ${store.plan.name}. Silakan upgrade paket langganan Anda.`,
    };
  }

  return { allowed: true };
}
