"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";

export interface TradeInInput {
  storeId: string;
  storeSlug: string;
  customerName: string;
  customerWa: string;
  deviceModel: string;
  expectedPrice?: number;
  conditionDesc: string;
  minusNotes?: string;
  photoUrls?: string[];
}

export async function createTradeInOffer(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const storeSlug = formData.get("storeSlug") as string;
    const customerName = formData.get("customerName") as string;
    const customerWa = formData.get("customerWa") as string;
    const deviceModel = formData.get("deviceModel") as string;
    const expectedPriceRaw = formData.get("expectedPrice") as string;
    const conditionDesc = formData.get("conditionDesc") as string;
    const minusNotes = formData.get("minusNotes") as string;
    const photoUrl = formData.get("photoUrl") as string;

    if (!storeId || !customerName || !customerWa || !deviceModel || !conditionDesc) {
      return { success: false, error: "Mohon lengkapi formulir wajib." };
    }

    const expectedPrice = expectedPriceRaw ? parseInt(expectedPriceRaw.replace(/\D/g, ""), 10) : null;
    const photoUrls = photoUrl ? [photoUrl] : [];

    const offer = await prisma.tradeInOffer.create({
      data: {
        storeId,
        customerName,
        customerWa,
        deviceModel,
        expectedPrice: expectedPrice && !isNaN(expectedPrice) ? expectedPrice : null,
        conditionDesc,
        minusNotes: minusNotes || null,
        photoUrls,
      },
    });

    if (storeSlug) {
      revalidatePath(`/${storeSlug}`);
    }
    revalidatePath("/admin/trade-in");

    return {
      success: true,
      offerId: offer.id,
    };
  } catch (error: any) {
    console.error("Error creating trade-in offer:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengirimkan pengajuan tukar tambah.",
    };
  }
}

import {
  submitTradeInOfferAction as baseSubmitTradeInOfferAction,
  updateTradeInStatusAction as baseUpdateTradeInStatusAction,
} from "./actions/tradein-actions";

export async function submitTradeInOfferAction(formData: FormData) {
  return baseSubmitTradeInOfferAction(formData);
}

export async function updateTradeInStatusAction(offerId: string, newStatus: any) {
  return baseUpdateTradeInStatusAction(offerId, newStatus);
}

import {
  createProductAction as guardedCreateProduct,
  updateProductStatusAction as guardedUpdateProductStatus,
  deleteProductAction as guardedDeleteProduct,
} from "./actions/product-actions";

import {
  changeStoreTemplate as guardedChangeStoreTemplate,
  updateStoreSettings as guardedUpdateStoreSettings,
} from "./actions/store-actions";

import { trackWhatsAppClickAction as baseTrackWhatsAppClickAction } from "./actions/analytics-actions";

import {
  registerStoreWithPaymentAction as baseRegisterStoreWithPayment,
  approvePaymentAction as baseApprovePayment,
  rejectPaymentAction as baseRejectPayment,
  createStaffUserAction as baseCreateStaffUser,
  deleteStaffUserAction as baseDeleteStaffUser,
} from "./actions/auth-actions";

import { submitStoreReviewAction as baseSubmitStoreReviewAction } from "./actions/review-actions";
import { getSubscriptionPlansAction as baseGetSubscriptionPlansAction } from "./actions/pricing-actions";

export async function getSubscriptionPlansAction() {
  return baseGetSubscriptionPlansAction();
}

export async function submitStoreReviewAction(input: {
  storeId: string;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string;
}) {
  return baseSubmitStoreReviewAction(input);
}

export async function trackWhatsAppClickAction(productId: string, storeId: string) {
  return baseTrackWhatsAppClickAction(productId, storeId);
}

export async function registerStoreWithPaymentAction(formData: FormData) {
  return baseRegisterStoreWithPayment(formData);
}

export async function approvePaymentAction(paymentId: string) {
  return baseApprovePayment(paymentId);
}

import {
  resetStoreOwnerPasswordAction as baseResetStoreOwnerPassword,
  extendStoreSubscriptionAction as baseExtendStoreSubscription,
  createSaasStaffAction as baseCreateSaasStaff,
  deleteSaasStaffAction as baseDeleteSaasStaff,
  manualActivateStoreAction as baseManualActivateStore,
  paySalesCommissionAction as basePaySalesCommission,
} from "./actions/saas-admin-actions";

export async function resetStoreOwnerPasswordAction(storeId: string, newPassword: string) {
  return baseResetStoreOwnerPassword(storeId, newPassword);
}

export async function extendStoreSubscriptionAction(storeId: string, additionalDays: number = 30) {
  return baseExtendStoreSubscription(storeId, additionalDays);
}

export async function createSaasStaffAction(data: {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES_AGENT";
  referralCode?: string;
  bankName?: string;
  bankNumber?: string;
  bankHolder?: string;
}) {
  return baseCreateSaasStaff(data);
}

export async function deleteSaasStaffAction(staffId: string) {
  return baseDeleteSaasStaff(staffId);
}

export async function manualActivateStoreAction(storeId: string, days: number = 30) {
  return baseManualActivateStore(storeId, days);
}

export async function paySalesCommissionAction(commissionId: string) {
  return basePaySalesCommission(commissionId);
}

export async function rejectPaymentAction(paymentId: string, notes: string) {
  return baseRejectPayment(paymentId, notes);
}

export async function createStaffUserAction(formData: FormData) {
  return baseCreateStaffUser(formData);
}

export async function deleteStaffUserAction(userId: string) {
  return baseDeleteStaffUser(userId);
}

// ─── Product action wrappers (session-secured) ────────────────────
export async function createProduct(formData: FormData) {
  return guardedCreateProduct(formData);
}

export async function updateProductStatus(
  productId: string,
  newStatus: "AVAILABLE" | "BOOKED" | "SOLD"
) {
  return guardedUpdateProductStatus(productId, newStatus);
}

export async function deleteProduct(productId: string) {
  return guardedDeleteProduct(productId);
}

export async function changeStoreTemplate(storeId: string, newTemplateId: string) {
  return guardedChangeStoreTemplate(storeId, newTemplateId);
}

export async function updateStoreSettings(formData: FormData) {
  return guardedUpdateStoreSettings(formData);
}

/** Alias used by ProductManagerClient */
export async function toggleProductStatus(
  productId: string,
  newStatus: "AVAILABLE" | "BOOKED" | "SOLD"
) {
  return guardedUpdateProductStatus(productId, newStatus);
}

/** Alias used by ProductManagerClient */
export async function createProductAction(formData: FormData) {
  return guardedCreateProduct(formData);
}

/** Alias used by ProductManagerClient */
export async function deleteProductAction(productId: string) {
  return guardedDeleteProduct(productId);
}

// -------------------------------------------------------------
// TAHAP 3: Super Admin, Onboarding, & Store Settings Actions
// -------------------------------------------------------------

export async function toggleStoreActiveAction(storeId: string, currentActive: boolean) {
  try {
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !currentActive },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath(`/${updated.slug}`);

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error toggling store status:", error);
    return { success: false, error: error?.message || "Gagal mengubah status toko." };
  }
}

export async function cycleStoreTierAction(storeId: string, currentTier: "STARTER" | "PRO" | "ADVANCE") {
  try {
    const nextTier =
      currentTier === "STARTER" ? "PRO" : currentTier === "PRO" ? "ADVANCE" : "STARTER";

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { tier: nextTier as any },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/domains");
    revalidatePath("/admin/settings");

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error updating store tier:", error);
    return { success: false, error: error?.message || "Gagal mengupdate tier toko." };
  }
}

export async function updateStoreTierAction(storeId: string, newTier: "STARTER" | "PRO" | "ADVANCE") {
  try {
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        tier: newTier,
        hasWatermark: newTier !== "STARTER",
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/super-admin/domains");
    revalidatePath("/admin/settings");
    revalidatePath(`/${updated.slug}`);

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error setting store tier:", error);
    return { success: false, error: error?.message || "Gagal mengubah tier toko." };
  }
}

export async function resetTemplateCooldownAction(storeId: string) {
  try {
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: { lastTemplateChangeAt: null },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath("/admin/settings");
    revalidatePath(`/${updated.slug}`);

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error resetting template cooldown:", error);
    return { success: false, error: error?.message || "Gagal mereset cooldown template." };
  }
}

export async function checkSlugAvailabilityAction(slug: string) {
  try {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug || cleanSlug.length < 3) {
      return { available: false, error: "Slug minimal 3 karakter huruf/angka." };
    }

    if (isReservedSlug(cleanSlug)) {
      return { available: false, error: "Subdomain ini dilindungi sistem dan tidak dapat digunakan." };
    }

    const existing = await prisma.store.findUnique({
      where: { slug: cleanSlug },
      select: { id: true },
    });

    return { available: !existing, cleanSlug };
  } catch (error: any) {
    return { available: false, error: "Gagal mengecek ketersediaan subdomain." };
  }
}

export async function registerNewStoreAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const rawSlug = formData.get("slug") as string;
    const tier = (formData.get("tier") as any) || "STARTER";
    const templateId = (formData.get("templateId") as string) || "minimal-clean";
    const whatsapp = formData.get("whatsapp") as string;
    const address = formData.get("address") as string;

    if (!name || !rawSlug || !whatsapp) {
      return { success: false, error: "Nama Toko, Subdomain, dan No WhatsApp wajib diisi." };
    }

    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (isReservedSlug(cleanSlug)) {
      return { success: false, error: "Subdomain ini dilindungi sistem dan tidak dapat digunakan." };
    }

    const existing = await prisma.store.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return { success: false, error: "Subdomain sudah digunakan. Silakan pilih nama lain." };
    }

    // Clean WA
    let cleanWa = whatsapp.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    const store = await prisma.store.create({
      data: {
        name,
        slug: cleanSlug,
        tier,
        templateId,
        whatsapp: cleanWa,
        address: address || null,
        primaryColor: templateId === "dark-gaming" ? "#10b981" : "#2563eb",
        hasWatermark: tier !== "STARTER",
        lastTemplateChangeAt: new Date(),
        isActive: true,
      },
    });

    revalidatePath("/super-admin");
    revalidatePath("/super-admin/stores");
    revalidatePath(`/${store.slug}`);

    return { success: true, store };
  } catch (error: any) {
    console.error("Error registering store:", error);
    return { success: false, error: error?.message || "Gagal mendaftarkan toko baru." };
  }
}

export async function updateStoreSettingsAction(formData: FormData) {
  return updateStoreSettings(formData);
}

