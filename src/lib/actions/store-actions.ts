"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";

export async function changeStoreTemplate(storeId: string, newTemplateId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // Validasi untuk paket PRO: batas ganti template 1x per 30 hari
    if (store.tier === "PRO" && store.lastTemplateChangeAt) {
      const now = new Date();
      const lastChange = new Date(store.lastTemplateChangeAt);
      const diffTime = now.getTime() - lastChange.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);

      if (diffDays < 30) {
        const nextAvailableDate = new Date(lastChange.getTime() + 30 * 24 * 3600 * 1000);
        const formattedDate = nextAvailableDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        return {
          success: false,
          error: `Paket Pro hanya dapat mengganti tema 1x dalam 30 hari. Anda baru dapat mengganti tema kembali pada ${formattedDate}. Upgrade ke Advance untuk bebas ganti tema kapan saja.`,
        };
      }
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
    const primaryColor = formData.get("primaryColor") as string;
    const templateId = formData.get("templateId") as string;
    const rawCustomDomain = formData.get("customDomain") as string;

    if (!storeId || !name || !whatsapp) {
      return { success: false, error: "Nama toko dan WhatsApp wajib diisi." };
    }

    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // Jika ada permintaan pergantian templateId, verifikasi cooldown
    let shouldUpdateLastChange = false;
    if (templateId && templateId !== currentStore.templateId) {
      if (currentStore.tier === "PRO" && currentStore.lastTemplateChangeAt) {
        const now = new Date();
        const lastChange = new Date(currentStore.lastTemplateChangeAt);
        const diffDays = (now.getTime() - lastChange.getTime()) / (1000 * 3600 * 24);

        if (diffDays < 30) {
          const nextAvailableDate = new Date(lastChange.getTime() + 30 * 24 * 3600 * 1000);
          const formattedDate = nextAvailableDate.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });

          return {
            success: false,
            error: `Paket Pro hanya dapat mengganti tema 1x dalam 30 hari. Anda baru dapat mengganti tema kembali pada ${formattedDate}. Upgrade ke Advance untuk bebas ganti tema kapan saja.`,
          };
        }
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

    const updated = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        whatsapp: cleanWa,
        address: address || null,
        mapsUrl: mapsUrl || null,
        primaryColor: primaryColor || currentStore.primaryColor,
        templateId: templateId || currentStore.templateId,
        ...(shouldUpdateLastChange ? { lastTemplateChangeAt: new Date() } : {}),
        customDomain: customDomain || null,
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
    console.error("Error updating store settings:", error);
    return { success: false, error: error?.message || "Gagal menyimpan pengaturan toko." };
  }
}
