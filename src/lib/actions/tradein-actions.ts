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
    const { requireStoreOwnerOrStaff } = await import("@/lib/auth/session");
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const existing = await prisma.tradeInOffer.findUnique({
      where: { id: offerId, storeId: store.id },
    });
    if (!existing) {
      return { success: false, error: "Penawaran tidak ditemukan atau bukan milik toko Anda." };
    }

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

// ============================================================
// 3. SUBMIT TRADE-IN / DIRECT BUYBACK LEAD (Fast & Streamlined)
// ============================================================
export interface SubmitTradeInLeadInput {
  storeId: string;
  branchId?: string | null;
  type: "TRADE_IN" | "SELL_ONLY";
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  condition: string;
  completeness: string;
  notes?: string;
  pricingType: "APPRAISAL_REQUEST" | "EXPECTED_PRICE";
  expectedPrice?: number | null;
  targetProductId?: string | null;
  targetProductTitle?: string | null;
}

export async function submitTradeInLeadAction(formData: FormData | SubmitTradeInLeadInput) {
  try {
    let data: SubmitTradeInLeadInput;

    if (formData instanceof FormData) {
      const storeId = (formData.get("storeId") as string)?.trim();
      const branchId = (formData.get("branchId") as string)?.trim() || null;
      const type = ((formData.get("type") as string)?.trim() || "TRADE_IN") as "TRADE_IN" | "SELL_ONLY";
      const customerName = (formData.get("customerName") as string)?.trim();
      const customerPhone = (formData.get("customerPhone") as string || formData.get("customerWa") as string)?.trim();
      const deviceModel = (formData.get("deviceModel") as string)?.trim();
      const condition = (formData.get("condition") as string)?.trim() || "NORMAL";
      const completeness = (formData.get("completeness") as string)?.trim() || "FULLSET";
      const notes = (formData.get("notes") as string)?.trim() || undefined;
      const pricingType = ((formData.get("pricingType") as string)?.trim() || "APPRAISAL_REQUEST") as "APPRAISAL_REQUEST" | "EXPECTED_PRICE";
      const expectedPriceRaw = formData.get("expectedPrice");
      const expectedPrice = expectedPriceRaw ? parseInt(String(expectedPriceRaw).replace(/\D/g, ""), 10) : null;
      const targetProductId = (formData.get("targetProductId") as string)?.trim() || null;
      const targetProductTitle = (formData.get("targetProductTitle") as string)?.trim() || null;

      data = {
        storeId,
        branchId,
        type,
        customerName,
        customerPhone,
        deviceModel,
        condition,
        completeness,
        notes,
        pricingType,
        expectedPrice,
        targetProductId,
        targetProductTitle,
      };
    } else {
      data = formData;
    }

    if (!data.storeId) {
      return { success: false, error: "Identitas toko tidak valid." };
    }
    if (!data.customerName || !data.customerPhone || !data.deviceModel) {
      return {
        success: false,
        error: "Mohon lengkapi Nama Anda, Nomor WhatsApp, dan Tipe HP Lama.",
      };
    }

    const store = await prisma.store.findUnique({
      where: { id: data.storeId },
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

    let cleanCustomerPhone = data.customerPhone.replace(/\D/g, "");
    if (cleanCustomerPhone.startsWith("0")) {
      cleanCustomerPhone = "62" + cleanCustomerPhone.slice(1);
    }

    // Verify branchId if supplied
    let validBranchId: string | null = null;
    let branchWa: string | null = null;
    if (data.branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: data.branchId, storeId: store.id },
      });
      if (branch) {
        validBranchId = branch.id;
        branchWa = branch.whatsapp || branch.phone || null;
      }
    }

    // Insert to PostgreSQL
    const lead = await prisma.tradeInLead.create({
      data: {
        storeId: store.id,
        branchId: validBranchId,
        type: data.type,
        customerName: data.customerName,
        customerPhone: cleanCustomerPhone,
        deviceModel: data.deviceModel,
        condition: data.condition,
        completeness: data.completeness,
        notes: data.notes || null,
        pricingType: data.pricingType,
        expectedPrice: data.expectedPrice && !isNaN(data.expectedPrice) ? data.expectedPrice : null,
        targetProductId: data.targetProductId || null,
        targetProductTitle: data.targetProductTitle || null,
        status: "PENDING",
      },
    });

    // Format clean WhatsApp redirection message (use branchWa if allocated)
    let cleanStoreWa = (branchWa || store.whatsapp || "").replace(/\D/g, "");
    if (cleanStoreWa.startsWith("0")) {
      cleanStoreWa = "62" + cleanStoreWa.slice(1);
    }

    const typeLabel = data.type === "TRADE_IN" ? "TUKAR TAMBAH" : "JUAL HP LANGSUNG";
    const pricingLabel =
      data.pricingType === "EXPECTED_PRICE" && data.expectedPrice
        ? `Target Harga Saya: ${formatRupiah(data.expectedPrice)}`
        : "Minta Estimasi Taksiran Tertinggi Admin";

    const conditionMap: Record<string, string> = {
      LIKE_NEW: "Mulus Like New (99%)",
      NORMAL: "Normal Pemakaian Wajar (95-98%)",
      MINUS: "Ada Minus Fisik / Fungsi",
    };
    const completenessMap: Record<string, string> = {
      FULLSET: "Fullset Box Original",
      UNIT_ONLY: "Unit Only (Batangan)",
    };

    const conditionDisplay = conditionMap[data.condition] || data.condition;
    const completenessDisplay = completenessMap[data.completeness] || data.completeness;

    let waMessageText =
      `Halo *${store.name}*, saya ingin mengajukan *${typeLabel}*:\n\n` +
      `• *Nama Pengirim:* ${data.customerName}\n` +
      `• *No WhatsApp:* ${cleanCustomerPhone}\n` +
      `• *HP Lama:* ${data.deviceModel}\n` +
      `• *Kondisi:* ${conditionDisplay}\n` +
      `• *Kelengkapan:* ${completenessDisplay}\n`;

    if (data.notes) {
      waMessageText += `• *Catatan / Minus / BH:* ${data.notes}\n`;
    }

    waMessageText += `• *Ekspektasi Harga:* ${pricingLabel}\n`;

    if (data.type === "TRADE_IN") {
      waMessageText += `• *Mau Tukar ke:* ${data.targetProductTitle || "Mau Konsultasi Dulu"}\n`;
    }

    waMessageText += `\nMohon dicek dan dibantu taksirannya ya kak, siap COD / transaksi hari ini. Terima kasih!`;

    const whatsappUrl = `https://wa.me/${cleanStoreWa}?text=${encodeURIComponent(waMessageText)}`;

    if (store.slug) {
      revalidatePath(`/${store.slug}`);
    }
    revalidatePath("/admin/trade-ins");
    revalidatePath("/admin/trade-in");
    revalidatePath("/admin");

    return {
      success: true,
      leadId: lead.id,
      whatsappNumber: cleanStoreWa,
      whatsappUrl,
    };
  } catch (error: any) {
    console.error("submitTradeInLeadAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memproses penawaran tukar tambah.",
    };
  }
}

export async function updateTradeInLeadStatusAction(
  leadId: string,
  newStatus: string,
  adminNotes?: string
) {
  try {
    const { requireStoreOwnerOrStaff } = await import("@/lib/auth/session");
    const ctx = await requireStoreOwnerOrStaff();
    const { store, user } = ctx;

    const existing = await prisma.tradeInLead.findUnique({
      where: { id: leadId, storeId: store.id },
    });
    if (!existing) {
      return { success: false, error: "Lead tidak ditemukan atau bukan milik toko Anda." };
    }

    if (user.role === "STORE_STAFF" && user.branchId) {
      if (existing.branchId && existing.branchId !== user.branchId) {
        return {
          success: false,
          error: "FORBIDDEN: Anda hanya dapat memproses leads pada cabang yang ditugaskan.",
        };
      }
    }

    const dataToUpdate: any = { status: newStatus };
    if (adminNotes !== undefined) {
      dataToUpdate.adminNotes = adminNotes;
    }

    const updated = await prisma.tradeInLead.update({
      where: { id: leadId },
      data: dataToUpdate,
    });

    revalidatePath("/admin/trade-ins");
    revalidatePath("/admin/trade-in");
    revalidatePath("/admin");
    return { success: true, lead: updated };
  } catch (error: any) {
    console.error("updateTradeInLeadStatusAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status lead." };
  }
}

export async function deleteTradeInLeadAction(leadId: string) {
  try {
    const { requireStoreOwnerOrStaff } = await import("@/lib/auth/session");
    const ctx = await requireStoreOwnerOrStaff();
    const { store, user } = ctx;

    const existing = await prisma.tradeInLead.findUnique({
      where: { id: leadId, storeId: store.id },
    });
    if (!existing) {
      return { success: false, error: "Lead tidak ditemukan atau bukan milik toko Anda." };
    }

    if (user.role === "STORE_STAFF" && user.branchId) {
      if (existing.branchId && existing.branchId !== user.branchId) {
        return {
          success: false,
          error: "FORBIDDEN: Anda hanya dapat menghapus leads pada cabang yang ditugaskan.",
        };
      }
    }

    await prisma.tradeInLead.delete({
      where: { id: leadId },
    });

    revalidatePath("/admin/trade-ins");
    revalidatePath("/admin/trade-in");
    return { success: true };
  } catch (error: any) {
    console.error("deleteTradeInLeadAction error:", error);
    return { success: false, error: error?.message || "Gagal menghapus lead." };
  }
}

