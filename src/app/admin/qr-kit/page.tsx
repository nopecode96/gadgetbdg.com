import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { QrKitClient } from "./QrKitClient";

export const revalidate = 0;

export default async function AdminQrKitPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt ? store.subscriptionExpiresAt.toISOString() : null,
    lastTemplateChangeAt: store.lastTemplateChangeAt ? store.lastTemplateChangeAt.toISOString() : null,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <QrKitClient store={serializedStore as any} />
    </div>
  );
}
