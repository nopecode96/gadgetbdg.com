"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export interface SubmitTradeInResult {
  success: boolean;
  error?: string;
  offerId?: string;
  whatsappNumber?: string;
  whatsappUrl?: string;
}

export async function submitTradeInOfferAction(
  formData: FormData
): Promise<SubmitTradeInResult> {
  try {
    const storeId = (formData.get("storeId") as string)?.trim();
    const customerName = (formData.get("customerName") as string)?.trim();
    const customerWaRaw = (formData.get("customerWa") as string)?.trim();
    const deviceModel = (formData.get("deviceModel") as string)?.trim();
    const ramStorage = (formData.get("ramStorage") as string)?.trim();
    const conditionDesc = (formData.get("conditionDesc") as string)?.trim();
    const completeness = (formData.get("completeness") as string)?.trim();
    const expectedPriceRaw = (formData.get("expectedPrice") as string)?.trim();
    const minusNotes = (formData.get("minusNotes") as string)?.trim() || null;
    const photoUrl = (formData.get("photoUrl") as string)?.trim() || null;

    if (!storeId) {
      return { success: false, error: "Identitas toko tidak valid." };
    }

    if (!customerName || !customerWaRaw || !deviceModel || !conditionDesc) {
      return {
        success: false,
        error: "Mohon lengkapi formulir wajib: Nama, No WhatsApp, Tipe HP, dan Kondisi Fisik.",
      };
    }

    // Verify target store exists and active
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        whatsapp: true,
        isActive: true,
      },
    });

    if (!store || !store.isActive) {
      return { success: false, error: "Toko tidak ditemukan atau sedang nonaktif." };
    }

    let cleanCustomerWa = customerWaRaw.replace(/\D/g, "");
    if (cleanCustomerWa.startsWith("0")) {
      cleanCustomerWa = "62" + cleanCustomerWa.slice(1);
    }

    const expectedPrice = expectedPriceRaw
      ? parseInt(expectedPriceRaw.replace(/\D/g, ""), 10)
      : null;

    const fullCondition = ramStorage
      ? `${conditionDesc} (RAM/Storage: ${ramStorage})`
      : conditionDesc;

    const fullMinusNotes = completeness
      ? minusNotes
        ? `Kelengkapan: ${completeness}. Minus: ${minusNotes}`
        : `Kelengkapan: ${completeness}`
      : minusNotes;

    const photoUrls = photoUrl ? [photoUrl] : [];

    const offer = await prisma.tradeInOffer.create({
      data: {
        storeId: store.id,
        customerName,
        customerWa: cleanCustomerWa,
        deviceModel,
        expectedPrice:
          expectedPrice && !isNaN(expectedPrice) ? expectedPrice : null,
        conditionDesc: fullCondition,
        minusNotes: fullMinusNotes,
        photoUrls,
      },
    });

    let cleanStoreWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanStoreWa.startsWith("0")) {
      cleanStoreWa = "62" + cleanStoreWa.slice(1);
    }

    const waMessage = encodeURIComponent(
      `Halo ${store.name}, saya ingin mengajukan *TUKAR TAMBAH / JUAL HP*:\n\n` +
        `• *Nama Pengirim:* ${customerName}\n` +
        `• *Tipe HP Lama:* ${deviceModel}${ramStorage ? ` (${ramStorage})` : ""}\n` +
        `• *Kondisi Fisik:* ${conditionDesc}\n` +
        (completeness ? `• *Kelengkapan:* ${completeness}\n` : "") +
        (minusNotes ? `• *Catatan Minus:* ${minusNotes}\n` : "") +
        (expectedPrice ? `• *Ekspektasi Harga:* Rp ${expectedPrice.toLocaleString("id-ID")}\n\n` : "\n") +
        `Mohon ditaksir estimasi harga tertingginya ya kak, terima kasih!`
    );

    const whatsappUrl = `https://wa.me/${cleanStoreWa}?text=${waMessage}`;

    if (store.slug) {
      revalidatePath(`/${store.slug}`);
    }
    revalidatePath("/admin/trade-in");

    return {
      success: true,
      offerId: offer.id,
      whatsappNumber: cleanStoreWa,
      whatsappUrl,
    };
  } catch (error: any) {
    console.error("submitTradeInOfferAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memproses pengajuan tukar tambah.",
    };
  }
}
