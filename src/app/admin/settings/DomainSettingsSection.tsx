"use client";

import React, { useState } from "react";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ExternalLink,
  ShieldCheck,
  Server,
  Save,
  Loader2,
} from "lucide-react";
import { checkDomainDnsAction, saveCustomDomainAction } from "@/lib/actions/domain-actions";
import type { VerifyDnsResult } from "@/lib/services/dns-service";

interface DomainSettingsSectionProps {
  store: {
    id: string;
    tier: string;
    slug: string;
    customDomain: string | null;
  };
}

export function DomainSettingsSection({ store }: DomainSettingsSectionProps) {
  const isProOrAdvance = store.tier === "PRO" || store.tier === "ADVANCE";
  const [domainInput, setDomainInput] = useState(store.customDomain || "");
  const [checking, setChecking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dnsResult, setDnsResult] = useState<VerifyDnsResult | null>(null);

  const targetIp = "72.62.75.149";

  const handleCheckDns = async () => {
    if (!domainInput.trim()) {
      setDnsResult({
        success: false,
        cleanDomain: "",
        resolvedIps: [],
        isMatched: false,
        message: "Ketikkan nama domain terlebih dahulu sebelum memeriksa DNS.",
      });
      return;
    }

    setChecking(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await checkDomainDnsAction(domainInput);
      setDnsResult(res);
    } catch (err: any) {
      setDnsResult({
        success: false,
        cleanDomain: domainInput,
        resolvedIps: [],
        isMatched: false,
        message: err?.message || "Gagal menghubungi DNS server.",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleSaveDomain = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const res = await saveCustomDomainAction(domainInput);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setSaveError(res.error || "Gagal menyimpan domain.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "Terjadi kesalahan saat menyimpan domain.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-600" />
          <span>Pengaturan &amp; Verifikasi Custom Domain Mandiri</span>
        </h2>
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            isProOrAdvance
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {isProOrAdvance ? `Tier ${store.tier} (Aktif)` : "Terkunci (Paket Starter)"}
        </span>
      </div>

      {isProOrAdvance ? (
        <div className="space-y-4 text-xs">
          {/* Input & Action */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nama Domain Pribadi Anda (Tanpa https://)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="customDomain"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="Contoh: berkahcell.id atau tokoberkah.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900 text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleCheckDns}
                disabled={checking}
                className="px-4 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengecek DNS...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>🔍 Cek Koneksi DNS Sekarang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveDomain}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Domain</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Domain akan menggantikan URL toko default Anda (<b>{store.slug}.gadgetbdg.com</b>) secara otomatis begitu DNS terhubung.
            </p>
          </div>

          {/* Feedback alerts */}
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Nama custom domain berhasil disimpan ke database platform!</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Visual Status Card Hasil Pengecekan DNS Real-Time */}
          {dnsResult && (
            <div
              className={`p-4 rounded-2xl border transition ${
                dnsResult.isMatched
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                  : dnsResult.resolvedIps.length > 0
                  ? "bg-amber-50/70 border-amber-300 text-amber-900"
                  : "bg-red-50/70 border-red-300 text-red-900"
              }`}
            >
              <div className="flex items-start gap-3">
                {dnsResult.isMatched ? (
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : dnsResult.resolvedIps.length > 0 ? (
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">
                      {dnsResult.isMatched
                        ? "🟢 Terverifikasi & Aktif"
                        : dnsResult.resolvedIps.length > 0
                        ? "🟡 Dalam Proses Propagasi DNS"
                        : "🔴 Belum Terhubung"}
                    </h4>
                    {dnsResult.cleanDomain && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/10">
                        {dnsResult.cleanDomain}
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed">{dnsResult.message}</p>

                  {dnsResult.resolvedIps.length > 0 && (
                    <div className="pt-2 font-mono text-[11px] text-slate-700 flex flex-wrap gap-2">
                      <span>IP Terbaca Saat Ini:</span>
                      {dnsResult.resolvedIps.map((ip) => (
                        <span
                          key={ip}
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            ip === targetIp ? "bg-emerald-200 text-emerald-900" : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {ip} {ip === targetIp ? "(Cocok)" : "(Bukan IP Server)"}
                        </span>
                      ))}
                    </div>
                  )}

                  {dnsResult.isMatched && (
                    <div className="pt-2">
                      <a
                        href={`https://${dnsResult.cleanDomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        <span>Buka Toko di Domain Pribadi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Kartu Instruksi DNS yang Jelas */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Instruksi Pengaturan DNS (Cloudflare / Niagahoster / Rumahweb / Domainesia):
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Target IP: {targetIp}</span>
            </div>

            <p className="text-slate-600 leading-relaxed text-[11px]">
              Buka menu DNS Management di registrar tempat Anda membeli domain, lalu buat 2 record berikut:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
              {/* Record A */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-700 font-sans font-bold text-xs pb-1 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3" /> Record 1 (Root Domain)
                  </span>
                  <span className="bg-indigo-50 px-1.5 rounded text-[10px]">Wajib</span>
                </div>
                <div className="text-slate-600">Type: <b className="text-slate-900">A Record</b></div>
                <div className="text-slate-600">Host / Name: <b className="text-slate-900">@</b></div>
                <div className="text-slate-600">Points to (Value): <b className="text-emerald-600">{targetIp}</b></div>
                <div className="text-slate-400 text-[10px]">TTL: Auto / 3600</div>
              </div>

              {/* Record CNAME */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-purple-700 font-sans font-bold text-xs pb-1 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Record 2 (Subdomain www)
                  </span>
                  <span className="bg-purple-50 px-1.5 rounded text-[10px]">Opsional</span>
                </div>
                <div className="text-slate-600">Type: <b className="text-slate-900">CNAME</b></div>
                <div className="text-slate-600">Host / Name: <b className="text-slate-900">www</b></div>
                <div className="text-slate-600">Points to (Value): <b className="text-purple-600">gadgetbdg.com</b></div>
                <div className="text-slate-400 text-[10px]">TTL: Auto / 3600</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Locked Banner untuk STARTER */
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-900 space-y-3">
          <div className="font-bold flex items-center gap-2 text-sm text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>Gunakan Domain Brand Anda Sendiri di Paket Pro &amp; Advance</span>
          </div>
          <p className="leading-relaxed text-slate-700">
            Saat ini tokomu aktif di subdomain platform: <b>{store.slug}.gadgetbdg.com</b>. Hubungkan domain mandiri
            eksklusif (seperti <b>namatoko.com</b> atau <b>tokocel.id</b>) tanpa embel-embel platform dengan meng-upgrade ke paket <b>PRO</b> atau <b>ADVANCE</b>.
          </p>
          <div>
            <a
              href="https://wa.me/628123456789?text=Halo%20Admin%2C%20saya%20ingin%20upgrade%20ke%20paket%20Pro%20agar%20bisa%20pakai%20custom%20domain"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-bold px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition"
            >
              <span>Upgrade ke Paket PRO</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
