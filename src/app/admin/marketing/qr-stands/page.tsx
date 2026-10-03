import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { assertCanAccessQrGoogleReview } from "@/lib/guards/plan-guard";
import { QrStandsClient } from "./QrStandsClient";

export const revalidate = 0;

export default async function QrStandsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const qrReviewGuard = await assertCanAccessQrGoogleReview(store.id);

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

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <QrStandsClient store={serializedStore} />
    </div>
  );
}
