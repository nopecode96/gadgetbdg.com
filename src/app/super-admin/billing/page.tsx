import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { BillingManagerClient } from "./BillingManagerClient";
import { getBillingOverviewAction } from "@/lib/actions/billing-actions";

export const revalidate = 0;

export default async function SuperAdminBillingPage() {
  // getBillingOverviewAction memvalidasi sesi SUPER_ADMIN / ADMIN_SAAS.
  const overview = await getBillingOverviewAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <BillingManagerClient initialOverview={overview} />
      </main>
    </div>
  );
}
