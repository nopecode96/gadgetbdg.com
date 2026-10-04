"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";
import { requireStoreAccess } from "@/lib/auth/tenant-guard";

export interface SubmitStoreReviewInput {
  storeId: string;
  branchId?: string | null;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string | null;
}

export interface AdminCreateReviewInput {
  storeId: string;
  branchId?: string | null;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit?: string | null;
}

/**
 * Public action: Disubmit oleh pengunjung dari storefront (jika diaktifkan)
 */
export async function submitStoreReviewAction(input: SubmitStoreReviewInput) {
  try {
    const { storeId, branchId, customerName, rating, comment, purchasedUnit } = input;

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

    const tierLimit = TIER_LIMITS[store.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.STARTER;

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

    // Validasi branch jika disertakan
    let validBranchId: string | null = null;
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, storeId: store.id },
      });
      if (branch) {
        validBranchId = branch.id;
      }
    }

    // 3. Simpan Ulasan ke Database
    const review = await prisma.storeReview.create({
      data: {
        storeId: store.id,
        branchId: validBranchId,
        customerName: customerName.trim(),
        rating: safeRating,
        comment: comment.trim(),
        purchasedUnit: purchasedUnit?.trim() || null,
        isApproved: true,
      },
      include: {
        branch: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // 4. Revalidasi halaman storefront
    revalidatePath(`/${store.slug}`);
    if (store.customDomain) {
      revalidatePath(`/custom-domain/${store.customDomain}`);
    }
    revalidatePath("/admin/reviews");

    return {
      success: true,
      review: {
        id: review.id,
        customerName: review.customerName,
        rating: review.rating,
        comment: review.comment,
        purchasedUnit: review.purchasedUnit,
        branchId: review.branchId,
        branchName: review.branch?.name || null,
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

/**
 * Admin action: Tambah ulasan pembeli langsung dari panel admin merchant
 */
export async function createStoreReviewAction(input: AdminCreateReviewInput) {
  try {
    const { storeId, branchId, customerName, rating, comment, purchasedUnit } = input;

    // Strict multi-tenant session check
    await requireStoreAccess(storeId);

    if (!customerName?.trim() || !comment?.trim()) {
      return { success: false, error: "Nama pembeli dan isi testimoni wajib diisi." };
    }

    const safeRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, slug: true, tier: true, customDomain: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    const tierLimit = TIER_LIMITS[store.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.STARTER;

    // Cek limit kuota ulasan
    if (Number.isFinite(tierLimit.maxReviews)) {
      const currentReviewCount = await prisma.storeReview.count({
        where: { storeId: store.id },
      });

      if (currentReviewCount >= tierLimit.maxReviews) {
        return {
          success: false,
          error: `Batas kuota ${tierLimit.maxReviews} ulasan untuk paket ${tierLimit.name} telah tercapai. Upgrade ke Advance untuk menambah ulasan tanpa batas.`,
        };
      }
    }

    // Validasi branchId jika dipilih
    let validBranchId: string | null = null;
    if (branchId) {
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, storeId: store.id },
      });
      if (branch) {
        validBranchId = branch.id;
      }
    }

    const review = await prisma.storeReview.create({
      data: {
        storeId: store.id,
        branchId: validBranchId,
        customerName: customerName.trim(),
        rating: safeRating,
        comment: comment.trim(),
        purchasedUnit: purchasedUnit?.trim() || null,
        isApproved: true,
      },
      include: {
        branch: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    // Revalidate paths
    revalidatePath("/admin/reviews");
    revalidatePath(`/${store.slug}`);
    if (store.customDomain) {
      revalidatePath(`/custom-domain/${store.customDomain}`);
    }

    return {
      success: true,
      review: {
        id: review.id,
        storeId: review.storeId,
        branchId: review.branchId,
        branchName: review.branch?.name || null,
        customerName: review.customerName,
        rating: review.rating,
        comment: review.comment,
        purchasedUnit: review.purchasedUnit,
        createdAt: review.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Error creating store review:", error);
    return {
      success: false,
      error: error?.message || "Gagal menambahkan ulasan.",
    };
  }
}

/**
 * Admin action: Hapus ulasan pembeli
 */
export async function deleteStoreReviewAction(reviewId: string) {
  try {
    const existing = await prisma.storeReview.findUnique({
      where: { id: reviewId },
      include: {
        store: { select: { id: true, slug: true, customDomain: true } },
      },
    });

    if (!existing) {
      return { success: false, error: "Ulasan tidak ditemukan." };
    }

    // Strict multi-tenant verification
    await requireStoreAccess(existing.storeId);

    await prisma.storeReview.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/reviews");
    revalidatePath(`/${existing.store.slug}`);
    if (existing.store.customDomain) {
      revalidatePath(`/custom-domain/${existing.store.customDomain}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting store review:", error);
    return {
      success: false,
      error: error?.message || "Gagal menghapus ulasan.",
    };
  }
}
