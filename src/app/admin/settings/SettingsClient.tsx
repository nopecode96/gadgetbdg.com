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
  Lock,
  Building2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { updateStoreSettingsAction } from "@/lib/actions";
import { getAvailableTemplatesForTier, TEMPLATE_REGISTRY } from "@/lib/constants/templates";
import { DomainSettingsSection } from "./DomainSettingsSection";
import { ImageUpload } from "@/components/admin/ImageUpload";

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

  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pengaturan Toko & Custom Domain</h1>
        <p className="text-xs text-slate-500 mt-1">
          Kustomisasi identitas toko, nomor kontak WhatsApp, tema storefront, dan konfigurasi domain pribadi.
        </p>
      </div>

      {/* ── Banner Edukasi Multi-Cabang & Subdomain ── */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>💡 Fitur Multi-Cabang &amp; Subdomain Tersendiri</span>
              <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full uppercase">
                Advance
              </span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Setiap cabang memiliki tautan katalog mandiri. Pada domain sendiri (misal:{" "}
              <code className="text-blue-700 bg-blue-100/60 px-1 py-0.5 rounded font-mono font-bold">
                {store.customDomain || `${store.slug}.com`}
              </code>
              ), cabang dapat diakses via subdomain seperti{" "}
              <code className="text-purple-700 bg-purple-100/60 px-1 py-0.5 rounded font-mono font-bold">
                bec.{store.customDomain || `${store.slug}.com`}
              </code>
              . Pembeli yang masuk melalui link cabang otomatis hanya melihat stok unit cabang tersebut dan langsung terhubung ke WhatsApp kasir konter terkait.
            </p>
          </div>
        </div>

        <Link
          href="/admin/branches"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shrink-0 self-start sm:self-auto shadow-sm"
        >
          <span>Kelola Cabang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
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

            {/* Foto Toko Fisik Konter (Terkunci untuk STARTER) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-medium text-slate-700">
                  Foto Fisik Konter / Storefront Gerai (Rasio 16:9)
                </label>
                {!isProOrAdvance && (
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Fitur Paket Pro / Advance</span>
                  </span>
                )}
              </div>
              {isProOrAdvance ? (
                <ImageUpload
                  name="storeImage"
                  value={store.storeImage || null}
                  aspectRatio="16:9"
                  uploadType="store-profile"
                  description="Foto fisik etalase atau tampak depan konter di BEC/ITC/Mall. Ditampilkan sebagai header profil gerai di website."
                />
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs text-center space-y-1">
                  <p className="font-bold text-slate-600">Upload Foto Toko Terkunci</p>
                  <p className="text-[11px] text-amber-700">
                    Upgrade ke paket Pro atau Advance untuk upload foto fisik toko dan mengaktifkan ulasan pembeli.
                  </p>
                </div>
              )}
            </div>

            {/* Logo Toko */}
            <div className="space-y-1 pt-1">
              <label className="block font-medium text-slate-700">
                Logo Toko (Rasio 1:1)
              </label>
              <ImageUpload
                name="logoUrl"
                value={store.logoUrl || null}
                aspectRatio="1:1"
                uploadType="store-logo"
                description="Logo ikon toko untuk avatar, favicon, dan identitas header storefront."
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Link Google Maps Petunjuk Arah</label>
              <input
                type="url"
                name="mapsUrl"
                defaultValue={store.mapsUrl || ""}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Jam Operasional Toko</label>
                <input
                  type="text"
                  name="operationalHours"
                  defaultValue={store.operationalHours || "Setiap Hari: 10:00 - 20:30 WIB"}
                  placeholder="Setiap Hari: 10:00 - 20:30 WIB"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Ketentuan & Garansi Toko</label>
                <input
                  type="text"
                  name="warrantyPolicy"
                  defaultValue={store.warrantyPolicy || "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup."}
                  placeholder="Garansi Toko 30 Hari Replace Unit..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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

        {/* Section 3: Custom Domain Settings & Real-Time DNS Verifier */}
        <DomainSettingsSection store={store} />

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
