"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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

export async function toggleProductStatus(productId: string, newStatus: "AVAILABLE" | "BOOKED" | "SOLD") {
  try {
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
      include: { store: true },
    });

    revalidatePath("/admin/products");
    if (updated.store?.slug) {
      revalidatePath(`/${updated.store.slug}`);
    }

    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Error updating product status:", error);
    return { success: false, error: error?.message || "Gagal mengubah status unit." };
  }
}

export async function createProductAction(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const priceRaw = formData.get("price") as string;
    const ramRom = formData.get("ramRom") as string;
    const batteryHealthRaw = formData.get("batteryHealth") as string;
    const imeiStatus = formData.get("imeiStatus") as string;
    const completeness = formData.get("completeness") as string;
    const condition = formData.get("condition") as string;
    const minusNotes = formData.get("minusNotes") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!storeId || !name || !brand || !priceRaw || !ramRom || !imeiStatus || !completeness || !condition) {
      return { success: false, error: "Mohon lengkapi field wajib." };
    }

    const price = parseInt(priceRaw.replace(/\D/g, ""), 10);
    const batteryHealth = batteryHealthRaw ? parseInt(batteryHealthRaw, 10) : null;
    const images = imageUrl ? [imageUrl] : [];

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        brand,
        price,
        ramRom,
        batteryHealth: batteryHealth && !isNaN(batteryHealth) ? batteryHealth : null,
        imeiStatus,
        completeness,
        condition,
        minusNotes: minusNotes || null,
        status: "AVAILABLE",
        images,
      },
      include: {
        store: true,
      },
    });

    revalidatePath("/admin/products");
    if (product.store?.slug) {
      revalidatePath(`/${product.store.slug}`);
    }

    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error?.message || "Gagal menambahkan produk." };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    const deleted = await prisma.product.delete({
      where: { id: productId },
      include: { store: true },
    });

    revalidatePath("/admin/products");
    if (deleted.store?.slug) {
      revalidatePath(`/${deleted.store.slug}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error?.message || "Gagal menghapus produk." };
  }
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

export async function checkSlugAvailabilityAction(slug: string) {
  try {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!cleanSlug || cleanSlug.length < 3) {
      return { available: false, error: "Slug minimal 3 karakter huruf/angka." };
    }

    const reserved = ["admin", "super-admin", "api", "app", "dashboard", "settings", "login", "register", "custom-domain"];
    if (reserved.includes(cleanSlug)) {
      return { available: false, error: "Subdomain ini dilindungi oleh sistem." };
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

    let customDomain = rawCustomDomain ? rawCustomDomain.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") : null;

    // Check if store tier allows custom domain
    const currentStore = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!currentStore) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    if (customDomain && currentStore.tier === "STARTER") {
      return { success: false, error: "Custom domain hanya tersedia untuk paket PRO dan ADVANCE." };
    }

    // Check custom domain collision
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

