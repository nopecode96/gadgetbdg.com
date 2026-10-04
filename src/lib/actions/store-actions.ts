"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";
import { assertCanChangeTemplate } from "@/lib/guards/plan-guard";

export async function changeStoreTemplate(storeId: string, newTemplateId: string) {
  try {
    const { requireStoreAccess } = await import("@/lib/auth/tenant-guard");
    await requireStoreAccess(storeId);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // Validasi pergantian template via Plan Guard (SSoT SubscriptionPlan)
    const guardCheck = await assertCanChangeTemplate(storeId, newTemplateId);
    if (!guardCheck.allowed) {
      return {
        success: false,
        error: guardCheck.error || "Tidak diizinkan mengganti template saat ini.",
      };
    }

    // Update template dan catat timestamp pergantian
    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        templateId: newTemplateId,
        lastTemplateChangeAt: new Date(),
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");
    revalidatePath(`/${updated.slug}`);
    if (updated.customDomain) {
      revalidatePath(`/custom-domain/${updated.customDomain}`);
    }

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error changing template:", error);
    return { success: false, error: error?.message || "Gagal mengganti template toko." };
  }
}

export async function updateStoreSettings(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const name = formData.get("name") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const address = formData.get("address") as string;
    const mapsUrl = formData.get("mapsUrl") as string;
    const googleReviewUrl = formData.get("googleReviewUrl") as string;
    const primaryColor = formData.get("primaryColor") as string;
    const templateId = formData.get("templateId") as string;
    const rawCustomDomain = formData.get("customDomain") as string;

    if (!storeId || !name || !whatsapp) {
      return { success: false, error: "Nama toko dan WhatsApp wajib diisi." };
    }

    const { requireStoreAccess } = await import("@/lib/auth/tenant-guard");
    await requireStoreAccess(storeId);

    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // Jika ada permintaan pergantian templateId, verifikasi aturan via Plan Guard
    let shouldUpdateLastChange = false;
    if (templateId && templateId !== currentStore.templateId) {
      const guardCheck = await assertCanChangeTemplate(storeId, templateId);
      if (!guardCheck.allowed) {
        return {
          success: false,
          error: guardCheck.error || "Tidak diizinkan mengganti template saat ini.",
        };
      }
      shouldUpdateLastChange = true;
    }

    let customDomain = rawCustomDomain
      ? rawCustomDomain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : null;

    if (customDomain && currentStore.tier === "STARTER") {
      return { success: false, error: "Custom domain hanya tersedia untuk paket PRO dan ADVANCE." };
    }

    if (customDomain && customDomain !== currentStore.customDomain) {
      const existingDomain = await prisma.store.findUnique({
        where: { customDomain },
      });
      if (existingDomain) {
        return { success: false, error: "Custom domain ini sudah dipakai oleh toko lain." };
      }
    }

    let cleanWa = whatsapp.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    const storeImage = formData.get("storeImage") as string;
    const operationalHours = formData.get("operationalHours") as string;
    const warrantyPolicy = formData.get("warrantyPolicy") as string;

    // Guard canCustomProfile (Starter tidak boleh custom storeImage, dsb jika ada perubahan)
    const canCustom = currentStore.tier !== "STARTER";

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        whatsapp: cleanWa,
        address: address || null,
        mapsUrl: mapsUrl || null,
        googleReviewUrl: googleReviewUrl || null,
        ...(canCustom && storeImage !== undefined ? { storeImage: storeImage || null } : {}),
        operationalHours: operationalHours !== undefined ? (operationalHours || "Setiap Hari: 10:00 - 20:30 WIB") : currentStore.operationalHours,
        warrantyPolicy: warrantyPolicy !== undefined ? (warrantyPolicy || "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup.") : currentStore.warrantyPolicy,
        primaryColor: primaryColor || currentStore.primaryColor,
        templateId: templateId || currentStore.templateId,
        template: templateId || currentStore.templateId,
        ...(shouldUpdateLastChange ? { lastTemplateChangeAt: new Date() } : {}),
        customDomain: customDomain || null,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/qr-kit");
    revalidatePath("/admin/marketing/qr-stands");
    revalidatePath("/admin");
    revalidatePath(`/${updated.slug}`, "layout");
    revalidatePath(`/${updated.slug}`);
    if (updated.customDomain) {
      revalidatePath(`/custom-domain/${updated.customDomain}`, "layout");
      revalidatePath(`/custom-domain/${updated.customDomain}`);
    }

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error updating store settings:", error);
    return { success: false, error: error?.message || "Gagal menyimpan pengaturan toko." };
  }
}

export async function updateGoogleReviewUrlAction(storeId: string, googleReviewUrl: string) {
  try {
    const { assertCanAccessQrGoogleReview } = await import("@/lib/guards/plan-guard");
    const guardCheck = await assertCanAccessQrGoogleReview(storeId);
    if (!guardCheck.allowed) {
      return {
        success: false,
        error: guardCheck.error || "Fitur ulasan Google Review tidak tersedia untuk paket Anda.",
      };
    }

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        googleReviewUrl: googleReviewUrl.trim() || null,
      },
    });

    revalidatePath("/admin/marketing/qr-stands");
    revalidatePath("/admin/settings");

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error updating google review URL:", error);
    return { success: false, error: error?.message || "Gagal menyimpan link review Google Maps." };
  }
}
