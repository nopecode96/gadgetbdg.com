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

    const storeImage = formData.get("storeImage") as string | null;
    const logoUrl = formData.get("logoUrl") as string | null;
    const operationalHours = formData.get("operationalHours") as string;
    const warrantyPolicy = formData.get("warrantyPolicy") as string;

    // Promo banner fields
    const promoBannerActiveRaw = formData.get("promoBannerActive");
    const promoBannerActive = promoBannerActiveRaw !== null ? promoBannerActiveRaw === "true" || promoBannerActiveRaw === "on" : undefined;
    const promoBannerBadge = formData.get("promoBannerBadge") as string | null;
    const promoBannerTitle = formData.get("promoBannerTitle") as string | null;
    const promoBannerSubtitle = formData.get("promoBannerSubtitle") as string | null;
    const promoBannerImage = formData.get("promoBannerImage") as string | null;
    const promoBannerCtaText = formData.get("promoBannerCtaText") as string | null;
    const promoBannerCtaLink = formData.get("promoBannerCtaLink") as string | null;

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
        ...(logoUrl !== null && logoUrl !== undefined ? { logoUrl: logoUrl || null } : {}),
        ...(canCustom && storeImage !== null && storeImage !== undefined ? { storeImage: storeImage || null } : {}),
        operationalHours: operationalHours !== undefined ? (operationalHours || null) : currentStore.operationalHours,
        warrantyPolicy: warrantyPolicy !== undefined ? (warrantyPolicy || null) : currentStore.warrantyPolicy,
        primaryColor: primaryColor || currentStore.primaryColor,
        templateId: templateId || currentStore.templateId,
        template: templateId || currentStore.templateId,
        ...(shouldUpdateLastChange ? { lastTemplateChangeAt: new Date() } : {}),
        customDomain: customDomain || null,
        ...(promoBannerActive !== undefined ? { promoBannerActive } : {}),
        ...(promoBannerBadge !== null && promoBannerBadge !== undefined ? { promoBannerBadge: promoBannerBadge || null } : {}),
        ...(promoBannerTitle !== null && promoBannerTitle !== undefined ? { promoBannerTitle: promoBannerTitle || null } : {}),
        ...(promoBannerSubtitle !== null && promoBannerSubtitle !== undefined ? { promoBannerSubtitle: promoBannerSubtitle || null } : {}),
        ...(promoBannerImage !== null && promoBannerImage !== undefined ? { promoBannerImage: promoBannerImage || null } : {}),
        ...(promoBannerCtaText !== null && promoBannerCtaText !== undefined ? { promoBannerCtaText: promoBannerCtaText || null } : {}),
        ...(promoBannerCtaLink !== null && promoBannerCtaLink !== undefined ? { promoBannerCtaLink: promoBannerCtaLink || null } : {}),
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/[store]", "layout");
    revalidatePath("/[store]/manifest.webmanifest");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/qr-kit");
    revalidatePath("/admin/marketing/qr-stands");
    revalidatePath("/admin");
    revalidatePath(`/${updated.slug}`, "layout");
    revalidatePath(`/${updated.slug}`);
    revalidatePath(`/${updated.slug}/manifest.webmanifest`);
    if (updated.customDomain) {
      revalidatePath(`/custom-domain/${updated.customDomain}`, "layout");
      revalidatePath(`/custom-domain/${updated.customDomain}`);
      revalidatePath(`/custom-domain/${updated.customDomain}/manifest.webmanifest`);
    }

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error updating store settings:", error);
    return { success: false, error: error?.message || "Gagal menyimpan pengaturan toko." };
  }
}

export async function uploadStoreLogoAction(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const file = formData.get("file") as File | null;

    if (!storeId || !file) {
      return { success: false, error: "Data toko atau file logo tidak ditemukan." };
    }

    const { requireStoreAccess } = await import("@/lib/auth/tenant-guard");
    await requireStoreAccess(storeId);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, slug: true, customDomain: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowedMimeTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format file tidak didukung. Format yang diizinkan: PNG, JPG/JPEG, WebP, dan SVG.",
      };
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "Ukuran file logo maksimal 2 MB." };
    }

    const { mkdir, writeFile } = await import("fs/promises");
    const path = await import("path");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = path.extname(file.name).toLowerCase();
    if (!ext || ext === ".") {
      if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/svg+xml") ext = ".svg";
      else ext = ".jpg";
    }

    const filename = `${store.id}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const savedFileUrl = `/uploads/logos/${filename}`;

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { logoUrl: savedFileUrl },
    });

    revalidatePath("/[store]", "layout");
    revalidatePath("/[store]/manifest.webmanifest");
    revalidatePath(`/${store.slug}`, "layout");
    revalidatePath(`/${store.slug}`);
    revalidatePath(`/${store.slug}/manifest.webmanifest`);
    if (store.customDomain) {
      revalidatePath(`/custom-domain/${store.customDomain}`, "layout");
      revalidatePath(`/custom-domain/${store.customDomain}`);
      revalidatePath(`/custom-domain/${store.customDomain}/manifest.webmanifest`);
    }
    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: true, logoUrl: savedFileUrl, store: updated };
  } catch (error: any) {
    console.error("Error uploading store logo action:", error);
    return { success: false, error: error?.message || "Gagal mengunggah logo toko." };
  }
}

export async function deleteStoreLogoAction(storeId: string) {
  try {
    if (!storeId) {
      return { success: false, error: "ID toko tidak ditemukan." };
    }

    const { requireStoreAccess } = await import("@/lib/auth/tenant-guard");
    await requireStoreAccess(storeId);

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, slug: true, customDomain: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { logoUrl: null },
    });

    revalidatePath("/[store]", "layout");
    revalidatePath("/[store]/manifest.webmanifest");
    revalidatePath(`/${store.slug}`, "layout");
    revalidatePath(`/${store.slug}`);
    revalidatePath(`/${store.slug}/manifest.webmanifest`);
    if (store.customDomain) {
      revalidatePath(`/custom-domain/${store.customDomain}`, "layout");
      revalidatePath(`/custom-domain/${store.customDomain}`);
      revalidatePath(`/custom-domain/${store.customDomain}/manifest.webmanifest`);
    }
    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { success: true, logoUrl: null, store: updated };
  } catch (error: any) {
    console.error("Error deleting store logo action:", error);
    return { success: false, error: error?.message || "Gagal menghapus logo toko." };
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
    revalidatePath("/admin/marketing/qrcode");
    revalidatePath("/admin/qrcode");
    revalidatePath("/admin/settings");

    return { success: true, store: updated };
  } catch (error: any) {
    console.error("Error updating google review URL:", error);
    return { success: false, error: error?.message || "Gagal menyimpan link review Google Maps." };
  }
}
