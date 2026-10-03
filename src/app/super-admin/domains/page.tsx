import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { DomainManagerClient } from "./DomainManagerClient";
import { getCustomDomainsOverviewAction } from "@/lib/actions/domain-actions";

export const revalidate = 0;

export default async function SuperAdminDomainsPage() {
  const overviewData = await getCustomDomainsOverviewAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <DomainManagerClient initialData={overviewData} />
      </main>
    </div>
  );
}
