import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { AdminsManagerClient } from "./AdminsManagerClient";
import { getInternalAdminsAction } from "@/lib/actions/admin-management-actions";

export const revalidate = 0;

export default async function SuperAdminStaffPage() {
  const admins = await getInternalAdminsAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <AdminsManagerClient initialAdmins={admins} />
      </main>
    </div>
  );
}
