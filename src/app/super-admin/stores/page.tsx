import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { StoreManagementClient } from "./StoreManagementClient";
import { getAllStoresAction } from "@/lib/actions/store-management-actions";

export const revalidate = 0;

export default async function SuperAdminStoresPage() {
  const stores = await getAllStoresAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <StoreManagementClient initialStores={stores} />
      </main>
    </div>
  );
}
