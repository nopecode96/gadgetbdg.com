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
} from "lucide-react";
import { superAdminCheckDomainDnsAction } from "@/lib/actions/domain-actions";
import type { VerifyDnsResult } from "@/lib/services/dns-service";

interface StoreDomainItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  tier: string;
  whatsapp: string;
  createdAt: string; // ISO string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DomainManagerClient({ stores }: { stores: StoreDomainItem[] }) {
  const [checkingDomain, setCheckingDomain] = useState<string | null>(null);
  const [dnsResults, setDnsResults] = useState<Record<string, VerifyDnsResult>>({});

  const storesWithDomain = stores.filter((s) => s.customDomain);
  const storesWithoutDomain = stores.filter((s) => !s.customDomain);

  async function handleVerifyDns(domain: string) {
    setCheckingDomain(domain);
    try {
      const res = await superAdminCheckDomainDnsAction(domain);
      setDnsResults((prev) => ({
        ...prev,
        [domain]: res,
      }));
    } catch (err: any) {
      setDnsResults((prev) => ({
        ...prev,
        [domain]: {
          success: false,
          cleanDomain: domain,
          resolvedIps: [],
          isMatched: false,
          message: err?.message || "Gagal memeriksa DNS domain.",
        },
      }));
    } finally {
      setCheckingDomain(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span>Custom Domain Verification Manager</span>
          <span className="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
            Tier PRO &amp; ADVANCE
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor status integrasi nama domain milik toko pribadi ke Reverse Proxy Nginx &amp; SSL Let&apos;s Encrypt.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-purple-400">{storesWithDomain.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Domain Terdaftar</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-emerald-400">
            {Object.values(dnsResults).filter((v) => v.isMatched).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">DNS Terverifikasi</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-amber-400">{storesWithoutDomain.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Belum Setup Domain</div>
        </div>
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
            <div className="text-slate-300">Target Value: <b className="text-emerald-400">72.62.75.149</b> (IP Server Nginx)</div>
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
                <th className="px-5 py-4">Tgl Pengajuan</th>
                <th className="px-5 py-4">Status DNS / SSL</th>
                <th className="px-5 py-4 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {storesWithDomain.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Belum ada toko yang mendaftarkan custom domain. Toko paket PRO/ADVANCE dapat mengajukannya di menu Settings.
                  </td>
                </tr>
              ) : (
                storesWithDomain.map((store) => {
                  return (
                    <tr key={store.id} className="hover:bg-slate-750/50 transition">
                      <td className="px-5 py-4 font-bold text-white">
                        {store.name}
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">WA: {store.whatsapp}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-mono text-sm text-purple-300 font-bold flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                          <a
                            href={`https://${store.customDomain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-purple-200 flex items-center gap-1"
                          >
                            <span>{store.customDomain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-400">
                        {store.slug}.gadgetbdg.com
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            store.tier === "ADVANCE"
                              ? "bg-purple-950 text-purple-300 border-purple-800"
                              : "bg-blue-950 text-blue-300 border-blue-800"
                          }`}
                        >
                          {store.tier}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(store.createdAt)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {dnsResults[store.customDomain!] ? (
                          dnsResults[store.customDomain!].isMatched ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Terverifikasi &amp; Aktif
                            </span>
                          ) : dnsResults[store.customDomain!].resolvedIps.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                              <Clock className="w-3 h-3" /> Propagasi ({dnsResults[store.customDomain!].resolvedIps[0]})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-400 border border-rose-800">
                              <AlertCircle className="w-3 h-3" /> DNS Tidak Cocok / Belum Terarah
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            <Clock className="w-3 h-3" /> Siap Dicek
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleVerifyDns(store.customDomain!)}
                          disabled={checkingDomain === store.customDomain}
                          className="px-3 py-1.5 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-white transition inline-flex items-center gap-1.5 disabled:opacity-50 text-xs"
                          title="Periksa Ulang DNS Domain Toko"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${
                              checkingDomain === store.customDomain ? "animate-spin text-indigo-400" : ""
                            }`}
                          />
                          <span>{checkingDomain === store.customDomain ? "Mengecek..." : "Periksa Ulang DNS"}</span>
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

      {/* Stores without domain */}
      {storesWithoutDomain.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-300">
            Toko PRO/ADVANCE Belum Setup Custom Domain ({storesWithoutDomain.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {storesWithoutDomain.map((s) => (
              <span
                key={s.id}
                className="text-[11px] font-mono px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-400"
              >
                {s.slug}.gadgetbdg.com
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
