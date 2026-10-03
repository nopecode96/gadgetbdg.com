import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { QrStandsClient } from "./QrStandsClient";

export const revalidate = 0;

export default async function QrStandsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const serializedStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    customDomain: store.customDomain,
    whatsapp: store.whatsapp,
    address: store.address,
    mapsUrl: store.mapsUrl,
    tier: store.tier as "STARTER" | "PRO" | "ADVANCE",
    hasQrGoogleReview: Boolean(store.plan?.hasQrGoogleReview ?? (store.tier !== "STARTER")),
    logoUrl: store.logoUrl,
    primaryColor: store.primaryColor,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <QrStandsClient store={serializedStore} />
    </div>
  );
}
