import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { getStoreSubscriptionStatusAction } from "@/lib/actions/billing-actions";
import { SubscriptionClient } from "./SubscriptionClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminSubscriptionPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const result = await getStoreSubscriptionStatusAction(store.id);

  if (!result.success || !result.store) {
    redirect("/admin");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <SubscriptionClient
        store={result.store}
        usage={result.usage}
        plans={result.plans}
        platformSetting={result.platformSetting}
      />
    </div>
  );
}
