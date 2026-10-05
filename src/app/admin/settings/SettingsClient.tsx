"use client";

import { useState, useRef } from "react";
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
  UploadCloud,
  Trash2,
  RefreshCw,
  Smartphone,
  Image as ImageIcon,
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

  // Logo management state
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(store?.logoUrl || null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleLogoUpload(file: File) {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Format tidak didukung. Gunakan file PNG, JPG, WebP, atau SVG.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Ukuran file logo maksimal 2 MB.");
      return;
    }

    setLogoUploading(true);
    setLogoError(null);
    setLogoSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storeId", store.id);

      const res = await fetch("/api/store/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah logo toko.");
      }

      setCurrentLogoUrl(data.logoUrl);
      setLogoSuccess("Logo toko berhasil diperbarui! Favicon dan PWA otomatis aktif.");
      setTimeout(() => setLogoSuccess(null), 4000);
    } catch (err: any) {
      setLogoError(err?.message || "Terjadi kesalahan saat mengunggah logo.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  async function handleDeleteLogo() {
    if (!confirm("Kembali menggunakan logo default brand GadgetBdg?")) return;

    setLogoUploading(true);
    setLogoError(null);
    setLogoSuccess(null);

    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("storeId", store.id);

      const res = await fetch("/api/store/upload-logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menghapus logo toko.");
      }

      setCurrentLogoUrl(null);
      setLogoSuccess("Logo toko berhasil dihapus. Toko kembali menggunakan logo default platform.");
      setTimeout(() => setLogoSuccess(null), 4000);
    } catch (err: any) {
      setLogoError(err?.message || "Terjadi kesalahan saat menghapus logo.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
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
    formData.set("logoUrl", currentLogoUrl || "");

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

        {/* Section: Branding & Logo Toko (Favicon & PWA App Icon) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
          <input type="hidden" name="logoUrl" value={currentLogoUrl || ""} />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>Branding &amp; Logo Toko</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi identitas visual toko Anda untuk etalase, Favicon browser, dan ikon aplikasi PWA.
              </p>
            </div>
            {currentLogoUrl ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Logo Kustom Aktif</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
                <span>Default Brand Platform</span>
              </span>
            )}
          </div>

          {logoSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{logoSuccess}</span>
            </div>
          )}

          {logoError && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{logoError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
            {/* Kolom Kiri: Preview Logo Rasio 1:1 */}
            <div className="sm:col-span-4 flex flex-col items-center sm:items-start space-y-3">
              <span className="text-xs font-bold text-slate-700">Preview Logo (1:1)</span>
              <div className="relative w-32 h-32 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-center p-2.5 overflow-hidden shadow-inner group">
                {currentLogoUrl ? (
                  <img
                    src={currentLogoUrl}
                    alt={store.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center space-y-1">
                    <Smartphone className="w-8 h-8 text-blue-500 mx-auto opacity-70" />
                    <span className="text-[10px] font-bold text-slate-400 block leading-tight">
                      Logo Default GadgetBdg
                    </span>
                  </div>
                )}
                {logoUploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>

              {currentLogoUrl && (
                <button
                  type="button"
                  onClick={handleDeleteLogo}
                  disabled={logoUploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Logo</span>
                </button>
              )}
            </div>

            {/* Kolom Kanan: Area Drag-and-Drop & File Picker */}
            <div className="sm:col-span-8 space-y-3">
              <span className="text-xs font-bold text-slate-700">Unggah Logo Baru</span>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
                onClick={() => {
                  if (!logoUploading) logoInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/50 scale-[0.99]"
                    : "border-slate-300 bg-slate-50/70 hover:bg-blue-50/20 hover:border-blue-400"
                } ${logoUploading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  disabled={logoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center shadow-xs">
                  {logoUploading ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-800">
                    {logoUploading ? "Sedang memproses & menyimpan logo..." : "Klik untuk pilih file atau seret ke sini"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    PNG, JPG, WebP, atau SVG (Maksimal 2 MB • Rasio 1:1)
                  </p>
                </div>
              </div>

              {/* Panduan Edukasi Sesuai Prompt */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  Logo ini akan otomatis digunakan sebagai <b>Favicon tab browser</b>, <b>logo etalase</b>, dan <b>ikon aplikasi (PWA)</b> saat pembeli menambahkan web toko Anda ke Home Screen HP.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Hero Banner Promosi Beranda */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Banner Promosi Beranda (Hero Banner)</span>
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="promoBannerActive"
                defaultChecked={store.promoBannerActive ?? true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-2 text-xs font-semibold text-slate-700">Aktifkan Banner</span>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            Banner promosi utama yang tampil di bagian atas halaman beranda (Home) storefront Anda.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Badge Promo (Label Kecil)</label>
              <input
                type="text"
                name="promoBannerBadge"
                defaultValue={store.promoBannerBadge || "PROMO SPESIAL"}
                placeholder="Contoh: FLASH SALE, PROMO GAJIAN"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Judul Banner Promosi</label>
              <input
                type="text"
                name="promoBannerTitle"
                defaultValue={store.promoBannerTitle || "Diskon Unit Pilihan Siap COD"}
                placeholder="Contoh: Diskon iPhone Flagship Siap COD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-medium text-slate-700 mb-1">Sub-judul / Rincian Promo</label>
            <textarea
              name="promoBannerSubtitle"
              rows={2}
              defaultValue={store.promoBannerSubtitle || "Garansi replace unit dan jaminan IMEI aman seumur hidup."}
              placeholder="Jelaskan keuntungan atau syarat promo secara singkat..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Upload Foto Unit Banner */}
          <div className="space-y-1 text-xs">
            <label className="block font-medium text-slate-700">
              Foto Produk / Grafis Banner Promosi
            </label>
            <ImageUpload
              name="promoBannerImage"
              value={store.promoBannerImage || null}
              aspectRatio="1:1"
              uploadType="store-profile"
              description="Foto produk unggulan berformat transparan/PNG atau foto unit promo yang akan melayang di kartu hero banner."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Teks Tombol Aksi (CTA)</label>
              <input
                type="text"
                name="promoBannerCtaText"
                defaultValue={store.promoBannerCtaText || "Lihat Promo"}
                placeholder="Contoh: Lihat Promo, Chat WhatsApp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Tautan Tujuan Tombol (CTA Link)</label>
              <input
                type="text"
                name="promoBannerCtaLink"
                defaultValue={store.promoBannerCtaLink || "/katalog"}
                placeholder="Contoh: /katalog, /trade-in, atau link WhatsApp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
