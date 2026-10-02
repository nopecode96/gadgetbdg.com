"use client";

import { useState } from "react";
import {
  Store,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { updateStoreSettingsAction } from "@/lib/actions";
import { getAvailableTemplatesForTier, TEMPLATE_REGISTRY } from "@/lib/constants/templates";

interface SettingsClientProps {
  store?: any;
}

export function SettingsClient({ store }: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(store?.templateId || "minimal-clean");
  const availableTemplates = getAvailableTemplatesForTier(store?.tier);

  if (!store) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
        Data toko tidak ditemukan.
      </div>
    );
  }

  const isProOrAdvance = store.tier === "PRO" || store.tier === "ADVANCE";

  // Hitung status cooldown 30 hari untuk paket PRO
  let isCooldownActive = false;
  let cooldownDaysRemaining = 0;

  if (store.tier === "PRO" && store.lastTemplateChangeAt) {
    const lastChange = new Date(store.lastTemplateChangeAt).getTime();
    const now = Date.now();
    const diffDays = (now - lastChange) / (1000 * 3600 * 24);
    if (diffDays < 30) {
      isCooldownActive = true;
      cooldownDaysRemaining = Math.max(1, Math.ceil(30 - diffDays));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("storeId", store.id);
    formData.append("templateId", selectedTemplate);

    const res = await updateStoreSettingsAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || "Gagal menyimpan perubahan pengaturan.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Toko & Custom Domain</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kustomisasi identitas toko, nomor kontak WhatsApp, tema storefront, dan konfigurasi domain pribadi.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan toko berhasil disimpan dan langsung diterapkan ke storefront!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Profil Toko */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Identitas & Kontak Toko</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Toko *</label>
              <input
                type="text"
                name="name"
                defaultValue={store.name}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor WhatsApp Admin (Closing & Order) *</label>
              <input
                type="tel"
                name="whatsapp"
                defaultValue={store.whatsapp}
                required
                placeholder="6281234567890"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Toko Fisik (BEC / Mall / Ruko)</label>
              <input
                type="text"
                name="address"
                defaultValue={store.address || ""}
                placeholder="Bandung Electronic Center (BEC) Lantai 1 Blok C-05"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Link Google Maps Toko</label>
              <input
                type="url"
                name="mapsUrl"
                defaultValue={store.mapsUrl || ""}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-700">
                  Link Ulasan Google Maps (Google Review Link)
                </label>
                <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Digunakan untuk QR Code Kit Meja Kasir ⭐
                </span>
              </div>
              <input
                type="url"
                name="googleReviewUrl"
                defaultValue={store.googleReviewUrl || ""}
                placeholder="https://g.page/r/.../review atau https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-start gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  <b>Cara salin link ulasan Google Bisnis:</b> Buka profil Google Bisnis Toko Anda di Google Maps ➔ Klik tombol <b>&quot;Minta Ulasan&quot; (Ask for reviews)</b> ➔ Salin tautan pendek (contoh: <code>https://g.page/r/.../review</code>) lalu tempel di sini.
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Pemilihan Template Storefront */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Pilihan Desain Template Storefront</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-500">
              {availableTemplates.length} Template ({store.tier})
            </span>
          </div>

          {/* Cooldown Guard Alert untuk Paket PRO */}
          {isCooldownActive && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cooldown Pergantian Tema Sedang Berjalan</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Tema dapat diganti lagi dalam <b>{cooldownDaysRemaining} hari</b> (Cooldown 30 hari paket Pro). Upgrade ke <b>Advance</b> untuk bebas ganti tema kapan saja.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {availableTemplates.map((t) => {
              const isSelected = selectedTemplate === t.id;
              const isDark = t.colors.isDark;
              const isDisabled = isCooldownActive && t.id !== store.templateId;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (isDisabled) {
                      alert(`Tema dapat diganti lagi dalam ${cooldownDaysRemaining} hari (Cooldown 30 hari paket Pro). Upgrade ke Advance untuk bebas ganti tema kapan saja.`);
                      return;
                    }
                    setSelectedTemplate(t.id);
                  }}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between space-y-3 ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-200"
                      : "cursor-pointer"
                  } ${
                    isSelected
                      ? isDark
                        ? "border-emerald-500 bg-slate-900 text-white shadow-md ring-1 ring-emerald-500"
                        : "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 text-slate-900"
                      : isDark
                      ? "border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-100"
                      : "border-slate-200 hover:border-slate-300 bg-white text-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm">{t.name}</h3>
                        {t.badge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            {t.badge}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isDark ? "bg-emerald-500 text-slate-950" : "bg-blue-600 text-white"
                          }`}
                        >
                          Dipilih
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {t.description}
                    </p>
                  </div>

                  <div
                    className={`h-12 rounded-xl border p-2 flex items-center justify-center text-xs font-semibold ${t.colors.heroGradient} ${t.colors.heroBorder}`}
                  >
                    Preview: {t.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Custom Domain Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Pengaturan Custom Domain Sendiri</span>
            </h2>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isProOrAdvance ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isProOrAdvance ? `Tier ${store.tier} (Aktif)` : "Terkunci (Perlu Tier PRO / ADVANCE)"}
            </span>
          </div>

          {isProOrAdvance ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Domain Pribadi (contoh: tokoberkahbandung.com)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="customDomain"
                    defaultValue={store.customDomain || ""}
                    placeholder="tokoberkah.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gunakan domain sendiri tanpa embel-embel .gadgetbdg.com untuk branding eksklusif.
                </p>
              </div>

              {/* DNS Instruction Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Instruksi Pengaturan DNS Ramah Pemula:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Buka panel tempat Anda membeli domain (misal: Rumahweb, Niagahoster, Domainesia, atau Cloudflare),
                  lalu tambahkan DNS Record berikut:
                </p>

                <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-[11px] space-y-1">
                  <div><b>Type:</b> A</div>
                  <div><b>Name / Host:</b> @</div>
                  <div><b>Target IP:</b> 103.189.xxx.xxx (IP Server GadgetBdg Bandung)</div>
                  <div className="pt-1 border-t border-slate-100 text-slate-400">Atau gunakan CNAME: cname.gadgetbdg.com</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Fitur Custom Domain Terkunci pada Paket STARTER</span>
              </div>
              <p>
                Saat ini tokomu aktif di subdomain resmi: <b>{store.slug}.gadgetbdg.com</b>. Untuk menghubungkan nama
                domain .com / .id pribadi, silakan upgrade ke paket PRO (Rp 500rb/bln) via Super-Admin atau hubungi CS.
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Menyimpan Perubahan..." : "Simpan Pengaturan Toko"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
