"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";

export interface SubmitStoreReviewInput {
  storeId: string;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string;
}

export async function submitStoreReviewAction(input: SubmitStoreReviewInput) {
  try {
    const { storeId, customerName, rating, comment, purchasedUnit } = input;

    if (!storeId || !customerName?.trim() || !comment?.trim()) {
      return { success: false, error: "Nama dan komentar ulasan wajib diisi." };
    }

    const safeRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        slug: true,
        tier: true,
        customDomain: true,
      },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const tierLimit = TIER_LIMITS[store.tier as keyof typeof TIER_LIMITS];

    // 1. Guard Paket Starter: Dilarang ulasan
    if (!tierLimit.allowCustomerReviews) {
      return {
        success: false,
        error: "Fitur ulasan pelanggan belum aktif untuk toko ini. Upgrade ke paket Pro untuk mengaktifkan reputasi toko.",
      };
    }

    // 2. Guard Kuota Review Paket Pro (maks 25)
    if (Number.isFinite(tierLimit.maxReviews)) {
      const currentReviewCount = await prisma.storeReview.count({
        where: { storeId: store.id },
      });

      if (currentReviewCount >= tierLimit.maxReviews) {
        return {
          success: false,
          error: `Batas maksimal ${tierLimit.maxReviews} ulasan untuk paket ${tierLimit.name} telah tercapai. Upgrade ke paket Advance untuk ulasan tanpa batas.`,
        };
      }
    }

    // 3. Simpan Ulasan ke Database
    const review = await prisma.storeReview.create({
      data: {
        storeId: store.id,
        customerName: customerName.trim(),
        rating: safeRating,
        comment: comment.trim(),
        purchasedUnit: purchasedUnit?.trim() || null,
        isApproved: true,
      },
    });

    // 4. Revalidasi halaman storefront
    revalidatePath(`/${store.slug}`);
    if (store.customDomain) {
      revalidatePath(`/custom-domain/${store.customDomain}`);
    }

    return {
      success: true,
      review: {
        id: review.id,
        customerName: review.customerName,
        rating: review.rating,
        comment: review.comment,
        purchasedUnit: review.purchasedUnit,
        createdAt: review.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error submitting store review:", error);
    return {
      success: false,
      error: error?.message || "Terjadi kesalahan saat mengirimkan ulasan toko.",
    };
  }
}
