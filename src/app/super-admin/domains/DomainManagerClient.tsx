"use client";

import { useState } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
} from "lucide-react";

interface StoreDomainItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  tier: string;
  whatsapp: string;
}

export function DomainManagerClient({ stores }: { stores: StoreDomainItem[] }) {
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);
  const [resolvedStatus, setResolvedStatus] = useState<Record<string, "RESOLVED" | "PENDING">>({});

  const storesWithDomain = stores.filter((s) => s.customDomain);

  function simulateVerifyDns(domain: string) {
    setCheckingDomain(domain);
    setTimeout(() => {
      setResolvedStatus((prev) => ({
        ...prev,
        [domain]: "RESOLVED",
      }));
      setCheckingDomain(null);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Custom Domain Verification Manager</span>
          <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
            Tier PRO & ADVANCE
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor status integrasi nama domain milik toko pribadi ke Reverse Proxy Nginx & SSL Let's Encrypt.
        </p>
      </div>

      {/* DNS Configuration Guide Box */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="font-bold text-sm text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Panduan Konfigurasi DNS Server (Letakkan di Cloudflare / Registrar Toko)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] block font-sans font-bold">Opsi 1: A Record (Root Domain)</span>
            <div className="text-slate-300">Type: <b className="text-emerald-400">A</b></div>
            <div className="text-slate-300">Name: <b className="text-emerald-400">@</b></div>
            <div className="text-slate-300">Target Value: <b className="text-emerald-400">103.189.xxx.xxx</b> (IP Server Nginx)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1">
            <span className="text-slate-400 text-[11px] block font-sans font-bold">Opsi 2: CNAME Record (Subdomain)</span>
            <div className="text-slate-300">Type: <b className="text-indigo-400">CNAME</b></div>
            <div className="text-slate-300">Name: <b className="text-indigo-400">www / store</b></div>
            <div className="text-slate-300">Target Value: <b className="text-indigo-400">cname.gadgetbdg.com</b></div>
          </div>
        </div>
      </div>

      {/* Domain List Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-4">Nama Toko</th>
                <th className="px-5 py-4">Custom Domain</th>
                <th className="px-5 py-4">Subdomain Asli</th>
                <th className="px-5 py-4">Tier</th>
                <th className="px-5 py-4">Status DNS / SSL</th>
                <th className="px-5 py-4 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {storesWithDomain.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Belum ada toko yang mendaftarkan custom domain. Toko paket PRO/ADVANCE dapat mengajukannya di menu Settings.
                  </td>
                </tr>
              ) : (
                storesWithDomain.map((store) => {
                  const status = resolvedStatus[store.customDomain!] || "RESOLVED";

                  return (
                    <tr key={store.id} className="hover:bg-slate-750/50 transition">
                      <td className="px-5 py-4 font-bold text-white">
                        {store.name}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-purple-300 font-bold flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-purple-400" />
                          <span>{store.customDomain}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400">
                        {store.slug}.gadgetbdg.com
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300 border border-blue-800">
                          {store.tier}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            status === "RESOLVED"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-amber-950 text-amber-400 border border-amber-800"
                          }`}
                        >
                          {status === "RESOLVED" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> CNAME Resolved & Active
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" /> Pending DNS Propagation
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => simulateVerifyDns(store.customDomain!)}
                          disabled={checkingDomain === store.customDomain}
                          className="px-3 py-1.5 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              checkingDomain === store.customDomain ? "animate-spin text-indigo-400" : ""
                            }`}
                          />
                          <span>{checkingDomain === store.customDomain ? "Checking..." : "Cek DNS"}</span>
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
    </div>
  );
}
