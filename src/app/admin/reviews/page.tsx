import { Metadata } from "next";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { requireStoreAccess } from "@/lib/auth/tenant-guard";
import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "./ReviewsClient";

export const metadata: Metadata = {
  title: "Kelola Ulasan & Testimoni | Panel Merchant",
  description: "Manajemen reputasi toko, ulasan pembeli, dan testimoni unit.",
};

export default async function ReviewsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  await requireStoreAccess(ctx.store.id);

  const [reviews, branches] = await Promise.all([
    prisma.storeReview.findMany({
      where: { storeId: ctx.store.id },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.branch.findMany({
      where: { storeId: ctx.store.id },
      select: {
        id: true,
        name: true,
        slug: true,
        isMain: true,
      },
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
    }),
  ]);

  const serializedReviews = reviews.map((r) => ({
    id: r.id,
    storeId: r.storeId,
    branchId: r.branchId,
    branchName: r.branch?.name || null,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    purchasedUnit: r.purchasedUnit,
    reviewDate: (r.reviewDate || r.createdAt).toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    isMain: b.isMain,
  }));

  return (
    <ReviewsClient
      storeId={ctx.store.id}
      storeName={ctx.store.name}
      tier={ctx.store.tier}
      initialReviews={serializedReviews}
      branches={serializedBranches}
    />
  );
}
