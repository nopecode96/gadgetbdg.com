import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { SettingsClient } from "./SettingsClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store, user } = ctx;

  // Settings page is owner-only
  if (user.role !== "STORE_OWNER") {
    redirect("/admin");
  }

  const serializedStore = {
    ...store,
    subscriptionExpiresAt: store.subscriptionExpiresAt?.toISOString() ?? null,
    updatedAt: new Date().toISOString(), // not exposed in SerializedStore, use current
    createdAt: new Date().toISOString(),
    lastTemplateChangeAt: store.lastTemplateChangeAt?.toISOString() ?? null,
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
      <SettingsClient store={serializedStore} />
    </div>
  );
}
