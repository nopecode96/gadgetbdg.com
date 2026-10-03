import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { LeadsManagerClient } from "./LeadsManagerClient";
import { getLeadsOverviewAction } from "@/lib/actions/leads-actions";

export const revalidate = 0;

export default async function SuperAdminLeadsPage() {
  const { leads, pendingCount } = await getLeadsOverviewAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <LeadsManagerClient initialLeads={leads} initialCount={pendingCount} />
      </main>
    </div>
  );
}
