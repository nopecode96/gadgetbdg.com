import { getSystemSettingsAction } from "@/lib/actions/system-settings-actions";
import { SettingsManagerClient } from "./SettingsManagerClient";
import { Sliders } from "lucide-react";

export const metadata = {
  title: "Pengaturan Sistem & Paket | Super Admin GadgetBdg",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminSettingsPage() {
  const data = await getSystemSettingsAction();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Pengaturan Sistem SaaS & Paket
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Konfigurasi kuota paket langganan, komisi sales, rekening penampung biaya langganan, dan infrastruktur DNS.
          </p>
        </div>
      </div>

      <SettingsManagerClient initialData={data} />
    </div>
  );
}
