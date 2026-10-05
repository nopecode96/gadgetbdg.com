"use client";

import { useState, useRef } from "react";
import {
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Megaphone,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { updateStoreBannerAction } from "@/lib/actions/store-actions";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface BannerPromoManagerProps {
  store: any;
}

export function BannerPromoManager({ store }: BannerPromoManagerProps) {
  // Form fields state
  const [bannerActive, setBannerActive] = useState<boolean>(store?.promoBannerActive ?? true);
  const [badge, setBadge] = useState(store?.promoBannerBadge || "PROMO SPESIAL");
  const [title, setTitle] = useState(store?.promoBannerTitle || "Diskon Unit Pilihan Siap COD");
  const [subtitle, setSubtitle] = useState(
    store?.promoBannerSubtitle || "Garansi replace unit dan jaminan IMEI aman seumur hidup."
  );
  const [bannerImage, setBannerImage] = useState<string | null>(store?.promoBannerImage || null);
  const [ctaText, setCtaText] = useState(store?.promoBannerCtaText || "Lihat Promo");
  const [ctaLink, setCtaLink] = useState(store?.promoBannerCtaLink || "/katalog");

  // Upload state for banner image
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }

  async function handleBannerImageUpload(file: File) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Format tidak didukung. Gunakan PNG, JPG, atau WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "Ukuran file banner maksimal 5 MB.");
      return;
    }

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "store-profile");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Gagal mengunggah gambar banner.");

      setBannerImage(data.url);
      showToast("success", "Gambar banner berhasil diunggah. Klik 'Simpan Banner' untuk menyimpan.");
    } catch (err: any) {
      showToast("error", err?.message || "Terjadi kesalahan saat mengunggah banner.");
    } finally {
      setImageUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateStoreBannerAction(store.id, {
        promoBannerActive: bannerActive,
        promoBannerBadge: badge.trim() || null,
        promoBannerTitle: title.trim() || null,
        promoBannerSubtitle: subtitle.trim() || null,
        promoBannerImage: bannerImage || null,
        promoBannerCtaText: ctaText.trim() || null,
        promoBannerCtaLink: ctaLink.trim() || null,
      });

      if (!res.success) throw new Error(res.error);
      showToast("success", "Banner promosi berhasil disimpan dan langsung tayang di beranda toko!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan banner promosi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            Banner Promosi Beranda
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur banner hero yang tampil di bagian atas halaman beranda (Home) storefront toko Anda.
          </p>
        </div>

        {/* Active toggle */}
        <label className="flex items-center gap-2 cursor-pointer shrink-0 self-start sm:self-auto">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={bannerActive}
              onChange={(e) => setBannerActive(e.target.checked)}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            {bannerActive ? (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-blue-700">Banner Aktif</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Banner Nonaktif</span>
              </>
            )}
          </span>
        </label>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 font-bold px-1">
            ✕
          </button>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            Live Preview Banner
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              bannerActive ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500 border border-slate-200"
            }`}
          >
            {bannerActive ? "● Aktif" : "○ Nonaktif"}
          </span>
        </div>

        {/* Banner Preview */}
        <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 flex items-center gap-6 min-h-[120px]">
          <div className="flex-1 space-y-1.5">
            {badge && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                {badge}
              </span>
            )}
            <h3 className="text-white font-black text-base sm:text-lg leading-tight">
              {title || "Judul Banner Promosi"}
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              {subtitle || "Sub-judul promo toko Anda."}
            </p>
            {ctaText && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold">
                  {ctaText}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
          {bannerImage && (
            <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-white/10 shadow-lg">
              <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
            </div>
          )}
          {!bannerActive && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Banner Nonaktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          Konten Banner
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Badge Promo <span className="text-slate-400">(Label Kecil)</span>
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="Contoh: FLASH SALE, PROMO GAJIAN"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Judul Banner Promosi</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Diskon iPhone Flagship Siap COD"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block font-medium text-slate-700 mb-1">Sub-judul / Rincian Promo</label>
          <textarea
            rows={2}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Jelaskan keuntungan atau syarat promo secara singkat..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        {/* Banner Image Upload */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <label className="block font-medium text-slate-700">
              Foto Produk / Grafis Banner Promosi
            </label>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              PNG, JPG, WebP — Maks 5 MB
            </span>
          </div>

          {/* Hidden file input */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            disabled={imageUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBannerImageUpload(file);
            }}
          />

          {bannerImage ? (
            <div className="space-y-2">
              <div className="relative w-full max-w-xs rounded-2xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                <img src={bannerImage} alt="Banner" className="w-full object-cover aspect-square" />
                {imageUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${imageUploading ? "animate-spin" : ""}`} />
                  Ganti Gambar
                </button>
                <button
                  type="button"
                  onClick={() => setBannerImage(null)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus Gambar
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !imageUploading && imageInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/20 transition flex flex-col items-center gap-2"
            >
              {imageUploading ? (
                <div className="flex flex-col items-center gap-2 text-blue-600">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="font-bold">Mengunggah gambar...</span>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800">Klik untuk unggah foto banner</p>
                  <p className="text-[11px] text-slate-500">
                    Foto produk unggulan PNG/transparan atau grafis promo (Maks 5 MB)
                  </p>
                </>
              )}
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2 leading-relaxed">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Foto berformat transparan (PNG) paling cocok untuk tampil melayang di atas latar gradien banner. Rasio ideal <b>1:1</b> atau <b>portrait 3:4</b>.
            </span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Teks Tombol Aksi (CTA)</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="Contoh: Lihat Promo, Chat WhatsApp"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Tautan Tujuan Tombol (CTA Link)</label>
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="Contoh: /katalog, /trade-in, atau link WA"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 flex items-center gap-2 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan Banner..." : "Simpan Banner Promosi"}
        </button>
      </div>
    </div>
  );
}
