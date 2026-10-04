import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { assertCanAccessQrGoogleReview } from "@/lib/guards/plan-guard";
import { prisma } from "@/lib/prisma";
import { QrStandsClient } from "./QrStandsClient";

export const revalidate = 0;

export default async function QrStandsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const [qrReviewGuard, branches] = await Promise.all([
    assertCanAccessQrGoogleReview(store.id),
    prisma.branch.findMany({
      where: { storeId: store.id },
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        address: true,
        whatsapp: true,
        phone: true,
        mapsUrl: true,
        isMain: true,
      },
    }),
  ]);

  const serializedStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    customDomain: store.customDomain,
    whatsapp: store.whatsapp,
    address: store.address,
    mapsUrl: store.mapsUrl,
    googleReviewUrl: store.googleReviewUrl,
    tier: store.tier as "STARTER" | "PRO" | "ADVANCE",
    planName: store.plan?.name || store.tier,
    hasQrGoogleReview: qrReviewGuard.allowed,
    logoUrl: store.logoUrl,
    primaryColor: store.primaryColor,
  };

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    address: b.address,
    whatsapp: b.whatsapp || b.phone || "",
    mapsUrl: b.mapsUrl,
    isMain: b.isMain,
  }));

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <QrStandsClient store={serializedStore} branches={serializedBranches} />
    </div>
  );
}
