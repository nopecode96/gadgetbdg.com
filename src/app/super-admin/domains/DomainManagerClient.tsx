"use client";

import { useState } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Server,
  Clock,
  ShieldCheck,
  Building,
  Info,
} from "lucide-react";
import {
  verifyCustomDomainDnsAction,
  CustomDomainsOverviewData,
  CustomDomainItem,
} from "@/lib/actions/domain-actions";

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DomainManagerClient({ initialData }: { initialData: CustomDomainsOverviewData }) {
  const [data, setData] = useState<CustomDomainsOverviewData>(initialData);
  const [checkingStoreId, setCheckingStoreId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  async function handleVerifyDns(store: CustomDomainItem) {
    setCheckingStoreId(store.id);
    setToast(null);

    try {
      const res = await verifyCustomDomainDnsAction(store.id);

      // Update state data lokal
      setData((prev) => {
        const updatedList = prev.registeredStores.map((item) => {
          if (item.id === store.id) {
            return {
              ...item,
              customDomainStatus: res.status,
              customDomainVerifiedAt: res.verifiedAt,
              customDomainDnsType: res.result.matchType || item.customDomainDnsType,
            };
          }
          return item;
        });

        const newVerifiedCount = updatedList.filter((s) => s.customDomainStatus === "ACTIVE").length;

        return {
          ...prev,
          registeredStores: updatedList,
          verifiedCount: newVerifiedCount,
        };
      });

      if (res.success) {
        setToast({
          type: "success",
          message: `DNS Berhasil Terverifikasi & Aktif! Domain ${store.customDomain} siap melayani traffic via Nginx reverse proxy.`,
        });
      } else {
        setToast({
          type: "info",
          message: res.result.message || `DNS untuk ${store.customDomain} belum cocok atau masih dalam masa propagasi.`,
        });
      }
    } catch (err: any) {
      setToast({
        type: "error",
        message: err?.message || `Gagal memeriksa DNS domain ${store.customDomain}.`,
      });
    } finally {
      setCheckingStoreId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-300"
              : toast.type === "error"
              ? "bg-rose-950/90 border-rose-800 text-rose-300"
              : "bg-amber-950/90 border-amber-800 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <Info className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 font-mono underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            PRO &amp; ADVANCE TIER ONLY
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Live DNS Resolver (Node.js)
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Custom Domain Verification Manager
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Kelola dan verifikasi integrasi nama domain milik toko pribadi langsung dari basis data PostgreSQL ke reverse proxy Nginx.
        </p>
      </div>

      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-mono text-slate-400 uppercase font-semibold">Total Domain Terdaftar</div>
          <div className="text-3xl font-black text-purple-400 mt-2">{data.totalRegistered}</div>
          <div className="text-[11px] text-slate-500 mt-1">Dari merchant PRO &amp; ADVANCE</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-mono text-emerald-400/80 uppercase font-semibold">DNS Terverifikasi (Aktif)</div>
          <div className="text-3xl font-black text-emerald-400 mt-2">{data.verifiedCount}</div>
          <div className="text-[11px] text-emerald-400/70 mt-1">Mengarahkan traffic dengan benar</div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-mono text-amber-400/80 uppercase font-semibold">Belum Setup Domain</div>
          <div className="text-3xl font-black text-amber-400 mt-2">{data.pendingSetupCount}</div>
          <div className="text-[11px] text-amber-400/70 mt-1">Toko berhak yang belum mengisi</div>
        </div>
      </div>

      {/* DNS Configuration Guide Box */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            <span>Target Konfigurasi DNS Server Resmi</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Environment Target</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-sans font-bold">Opsi 1: A Record (Root Domain)</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                Apex Domain
              </span>
            </div>
            <div className="text-slate-400">Type: <b className="text-emerald-400">A</b></div>
            <div className="text-slate-400">Name / Host: <b className="text-emerald-400">@</b></div>
            <div className="text-slate-400">
              IP Tujuan VPS: <b className="text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{data.serverIp}</b>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-sans font-bold">Opsi 2: CNAME Record (Subdomain)</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                Subdomain
              </span>
            </div>
            <div className="text-slate-400">Type: <b className="text-indigo-400">CNAME</b></div>
            <div className="text-slate-400">Name / Host: <b className="text-indigo-400">www</b> atau <b className="text-indigo-400">store</b></div>
            <div className="text-slate-400">
              Target CNAME: <b className="text-indigo-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{data.cnameTarget}</b>
            </div>
          </div>
        </div>
      </div>

      {/* Domain List Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">
              Daftar Domain Toko Terdaftar ({data.registeredStores.length})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Sumber: PostgreSQL Database</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-4">Nama Toko</th>
                <th className="px-5 py-4">Custom Domain</th>
                <th className="px-5 py-4">Subdomain Asli</th>
                <th className="px-5 py-4">Tier Paket</th>
                <th className="px-5 py-4">Tipe DNS</th>
                <th className="px-5 py-4">Status Verifikasi</th>
                <th className="px-5 py-4">Terakhir Diverifikasi</th>
                <th className="px-5 py-4 text-right">Aksi DNS Lookup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {data.registeredStores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Belum ada toko yang mendaftarkan custom domain di database.
                    <br />
                    Toko paket PRO/ADVANCE dapat mengajukannya di menu Settings etalase.
                  </td>
                </tr>
              ) : (
                data.registeredStores.map((store) => {
                  const isBusy = checkingStoreId === store.id;
                  return (
                    <tr key={store.id} className="hover:bg-slate-750/50 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{store.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">WA: {store.whatsapp}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-purple-300 font-bold flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                          <a
                            href={`https://${store.customDomain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-purple-200 hover:underline flex items-center gap-1"
                          >
                            <span>{store.customDomain}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </a>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400">
                        {store.slug}.gadgetbdg.com
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            store.tier === "ADVANCE"
                              ? "bg-purple-950 text-purple-300 border-purple-800"
                              : "bg-blue-950 text-blue-300 border-blue-800"
                          }`}
                        >
                          {store.tier}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-bold text-[10px]">
                          {store.customDomainDnsType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {store.customDomainStatus === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi &amp; Aktif
                          </span>
                        ) : store.customDomainStatus === "FAILED" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                            <AlertCircle className="w-3 h-3" /> DNS Tidak Cocok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                            <Clock className="w-3 h-3" /> Menunggu Propagasi
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {formatDate(store.customDomainVerifiedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleVerifyDns(store)}
                          disabled={isBusy}
                          className="px-3.5 py-1.5 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white transition inline-flex items-center gap-1.5 text-xs shadow-sm"
                          title="Periksa Ulang DNS Domain Toko Riil"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isBusy ? "animate-spin text-purple-400" : ""}`}
                          />
                          <span>{isBusy ? "Memeriksa..." : "Periksa Ulang DNS"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stores without domain (Dynamic from PRO & ADVANCE query) */}
      {data.storesWithoutDomain.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              Toko PRO &amp; ADVANCE Belum Setup Custom Domain ({data.storesWithoutDomain.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Dinamis dari database</span>
          </div>
          <p className="text-xs text-slate-400">
            Toko-toko berikut memiliki kuota custom domain gratis sesuai paket langganan aktif mereka.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {data.storesWithoutDomain.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs"
              >
                <span className="font-bold text-white">{s.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {s.tier}
                </span>
                <span className="text-[11px] font-mono text-purple-300">
                  {s.slug}.gadgetbdg.com
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
