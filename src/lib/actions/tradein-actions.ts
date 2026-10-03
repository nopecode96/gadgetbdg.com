"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import type { TradeInStatus } from "@prisma/client";

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
    const phoneModel = (formData.get("phoneModel") as string)?.trim() || (formData.get("deviceModel") as string)?.trim();
    const ramStorage = (formData.get("ramStorage") as string)?.trim();
    const condition = (formData.get("condition") as string)?.trim() || (formData.get("conditionDesc") as string)?.trim();
    const batteryHealthRaw = (formData.get("batteryHealth") as string)?.trim();
    const imeiStatus = (formData.get("imeiStatus") as string)?.trim();
    const completeness = (formData.get("completeness") as string)?.trim();
    const expectedPriceRaw = (formData.get("expectedPrice") as string)?.trim();
    const minusNotes = (formData.get("minusNotes") as string)?.trim() || null;
    const photoUrl = (formData.get("photoUrl") as string)?.trim() || null;
    const photoUrlsRaw = (formData.get("photoUrls") as string)?.trim();

    if (!storeId) {
      return { success: false, error: "Identitas toko tidak valid." };
    }

    if (!customerName || !customerWaRaw || !phoneModel || !condition) {
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

    const batteryHealth = batteryHealthRaw
      ? parseInt(batteryHealthRaw.replace(/\D/g, ""), 10)
      : null;

    const fullDeviceModel = ramStorage ? `${phoneModel} (${ramStorage})` : phoneModel;

    let photoUrls: string[] = [];
    if (photoUrlsRaw) {
      try {
        const parsed = JSON.parse(photoUrlsRaw);
        if (Array.isArray(parsed)) photoUrls = parsed.filter(Boolean);
      } catch {
        photoUrls = [photoUrlsRaw];
      }
    } else if (photoUrl) {
      photoUrls = [photoUrl];
    }

    const offer = await prisma.tradeInOffer.create({
      data: {
        storeId: store.id,
        customerName,
        customerPhone: cleanCustomerWa,
        customerWa: cleanCustomerWa,
        phoneModel: fullDeviceModel,
        deviceModel: fullDeviceModel,
        condition,
        conditionDesc: condition,
        batteryHealth: batteryHealth && !isNaN(batteryHealth) ? batteryHealth : null,
        imeiStatus: imeiStatus || null,
        completeness: completeness || null,
        minusNotes: minusNotes || null,
        expectedPrice: expectedPrice && !isNaN(expectedPrice) ? expectedPrice : null,
        photoUrls,
        status: "PENDING",
      },
    });

    let cleanStoreWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanStoreWa.startsWith("0")) {
      cleanStoreWa = "62" + cleanStoreWa.slice(1);
    }

    const waMessage = encodeURIComponent(
      `Halo ${store.name}, saya ingin mengajukan *TUKAR TAMBAH / JUAL HP*:\n\n` +
        `• *Nama Pengirim:* ${customerName}\n` +
        `• *Tipe HP Lama:* ${fullDeviceModel}\n` +
        `• *Kondisi Fisik:* ${condition}\n` +
        (batteryHealth ? `• *Battery Health:* ${batteryHealth}%\n` : "") +
        (imeiStatus ? `• *Status IMEI:* ${imeiStatus}\n` : "") +
        (completeness ? `• *Kelengkapan:* ${completeness}\n` : "") +
        (minusNotes ? `• *Catatan Minus:* ${minusNotes}\n` : "") +
        (expectedPrice ? `• *Ekspektasi Harga:* ${formatRupiah(expectedPrice)}\n\n` : "\n") +
        (photoUrls.length > 0 ? `• *Foto Unit Terlampir:* ${photoUrls.length} foto di sistem\n\n` : "") +
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

export async function updateTradeInStatusAction(offerId: string, newStatus: TradeInStatus) {
  try {
    const updated = await prisma.tradeInOffer.update({
      where: { id: offerId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/trade-in");
    return { success: true, offer: updated };
  } catch (error: any) {
    console.error("updateTradeInStatusAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status penawaran." };
  }
}
