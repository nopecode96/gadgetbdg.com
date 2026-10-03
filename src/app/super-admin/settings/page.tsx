import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { getSystemSettingsAction } from "@/lib/actions/system-settings-actions";
import { SettingsManagerClient } from "./SettingsManagerClient";

export const metadata = {
  title: "Pengaturan Sistem & Paket | Super Admin GadgetBdg",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminSettingsPage() {
  const data = await getSystemSettingsAction();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <SettingsManagerClient initialData={data} />
      </main>
    </div>
  );
}
