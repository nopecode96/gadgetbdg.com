"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Upload,
  User,
  Phone,
  DollarSign,
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
  MessageCircle,
} from "lucide-react";
import { StoreData } from "./types";
import { submitTradeInOfferAction } from "@/lib/actions/tradein-actions";
import { getTemplateConfig } from "@/lib/constants/templates";
import { formatRupiah } from "@/lib/utils";

interface StoreTradeInViewProps {
  store: StoreData;
  theme?: string;
  isMockup?: boolean;
}

export function StoreTradeInView({ store, theme, isMockup = false }: StoreTradeInViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [phoneModel, setPhoneModel] = useState("");
  const [ramStorage, setRamStorage] = useState("");
  const [condition, setCondition] = useState("98% Mulus Like New");
  const [batteryHealth, setBatteryHealth] = useState("88");
  const [imeiStatus, setImeiStatus] = useState("Resmi iBox / Kemenperin");
  const [completeness, setCompleteness] = useState("Fullset Box Original");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [minusNotes, setMinusNotes] = useState("");

  // Upload Photo State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState<string | null>(null);

  // Handle Photo Upload via /api/upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isMockup) {
      setUploadedPhotos((prev) => [...prev, "/images/items/iphone-15-pro.png"]);
      return;
    }

    setIsUploading(true);
    try {
      const file = files[0];
      const formData = new FormData();
      formData.append("type", "trade-in");
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setUploadedPhotos((prev) => [...prev, data.url]);
      } else {
        alert(data.error || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat upload foto.");
    } finally {
      setIsUploading(false);
    }
  }

  function removePhoto(index: number) {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isMockup) {
      setTimeout(() => {
        setLoading(false);
        setSuccess(true);
      }, 600);
      return;
    }

    const formData = new FormData();
    formData.append("storeId", store.id);
    formData.append("customerName", customerName);
    formData.append("customerWa", customerWa);
    formData.append("phoneModel", phoneModel);
    formData.append("ramStorage", ramStorage);
    formData.append("condition", condition);
    formData.append("batteryHealth", batteryHealth);
    formData.append("imeiStatus", imeiStatus);
    formData.append("completeness", completeness);
    formData.append("expectedPrice", expectedPrice);
    formData.append("minusNotes", minusNotes);
    formData.append("photoUrls", JSON.stringify(uploadedPhotos));

    const res = await submitTradeInOfferAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      if (res.whatsappUrl) {
        setWhatsappRedirectUrl(res.whatsappUrl);
        setTimeout(() => {
          window.open(res.whatsappUrl, "_blank");
        }, 1200);
      }
    } else {
      setError(res.error || "Gagal memproses formulir penaksiran tukar tambah.");
    }
  }

  const conditionPills = [
    "99% Like New / Mulus Total",
    "98% Mulus Pemakaian Wajar",
    "95% Lecet Halus / Dent Tipis",
    "Ada Jamur / Lecet Bezel",
  ];

  const completenessPills = [
    "Fullset Box Original",
    "Fullset Dus OEM",
    "Unit Only (Batangan)",
    "Kabel Charger Saja",
  ];

  const imeiPills = [
    "Resmi iBox / Kemenperin",
    "Resmi SEIN Indonesia",
    "Bea Cukai Terdaftar",
    "WiFi Only / Smartfren",
  ];

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs font-sans pb-12">
      {/* ── HEADER BANNER ── */}
      <div
        className={`rounded-3xl p-5 border text-center space-y-1.5 shadow-md ${colors.heroGradient} ${colors.heroBorder}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto backdrop-blur-xs shadow-inner">
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
        </div>
        <h2 className="font-black text-base text-white tracking-tight">
          Formulir Taksiran Tukar Tambah / Jual HP
        </h2>
        <p className="text-xs text-white/90 max-w-sm mx-auto leading-relaxed">
          Taksir HP bekasmu ke harga tertinggi se-Bandung. Siap COD di markas toko atau kurir jemput unit.
        </p>
      </div>

      {success ? (
        <div
          className={`rounded-3xl p-8 text-center space-y-3.5 border ${colors.cardBg} ${colors.cardBorder} shadow-lg`}
        >
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="font-black text-base text-emerald-600">
            Penawaran Berhasil Dicatat ke Sistem!
          </h3>
          <p className={`text-xs ${colors.textSecondary} max-w-xs mx-auto leading-relaxed`}>
            Data spesifikasi HP lama Anda sudah tersimpan di database kasir {store.name}. WhatsApp toko akan otomatis dibuka dengan draf pesan rapi...
          </p>

          {whatsappRedirectUrl && (
            <a
              href={whatsappRedirectUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Buka Chat WhatsApp Sekarang</span>
            </a>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setSuccess(false);
                setCustomerName("");
                setCustomerWa("");
                setPhoneModel("");
                setRamStorage("");
                setExpectedPrice("");
                setMinusNotes("");
                setUploadedPhotos([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "bg-slate-800 text-slate-200" : "bg-neutral-100 text-neutral-800"
              }`}
            >
              Ajukan Penawaran Unit Lain
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`rounded-3xl p-5 border space-y-4 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
        >
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 1: INFORMASI KONTAK ── */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Informasi Pemilik / Pelanggan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  value={customerWa}
                  onChange={(e) => setCustomerWa(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── STEP 2: IDENTITAS HP LAMA ── */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>2. Identitas HP Lama yang Mau Dijual / Ditukar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Merk & Tipe HP *
                </label>
                <input
                  type="text"
                  required
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  placeholder="Contoh: iPhone 13 128GB / S22 Ultra"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  RAM & Kapasitas Memori (Opsional)
                </label>
                <input
                  type="text"
                  value={ramStorage}
                  onChange={(e) => setRamStorage(e.target.value)}
                  placeholder="Contoh: 8GB / 256GB"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── STEP 3: KONDISI & KELENGKAPAN (SMART PILLS) ── */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3. Kondisi Fisik, Kelengkapan & Legalitas</span>
            </div>

            {/* Pilihan Kondisi Fisik */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Kondisi Fisik Unit
              </label>
              <div className="flex flex-wrap gap-1.5">
                {conditionPills.map((pill) => (
                  <button
                    type="button"
                    key={pill}
                    onClick={() => setCondition(pill)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                      condition === pill
                        ? "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Health & Legalitas IMEI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Battery Health (% jika iPhone)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={batteryHealth}
                    onChange={(e) => setBatteryHealth(e.target.value)}
                    placeholder="Contoh: 88"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                    %
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Status Legalitas IMEI
                </label>
                <select
                  value={imeiStatus}
                  onChange={(e) => setImeiStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {imeiPills.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kelengkapan Dus & Aksesoris */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Kelengkapan Bawaan
              </label>
              <div className="flex flex-wrap gap-1.5">
                {completenessPills.map((pill) => (
                  <button
                    type="button"
                    key={pill}
                    onClick={() => setCompleteness(pill)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                      completeness === pill
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── STEP 4: CATATAN MINUS & EKSPEKTASI HARGA ── */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>4. Catatan Minus &amp; Ekspektasi Harga</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Catatan Kejujuran Minus (Jika Ada)
              </label>
              <textarea
                rows={2}
                value={minusNotes}
                onChange={(e) => setMinusNotes(e.target.value)}
                placeholder="Contoh: TrueTone off, pernah ganti baterai, atau ada goresan halus di layar..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                Ekspektasi Taksiran Harga Pelanggan (Rp)
              </label>
              <input
                type="number"
                value={expectedPrice}
                onChange={(e) => setExpectedPrice(e.target.value)}
                placeholder="Contoh: 4500000"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {expectedPrice && !isNaN(Number(expectedPrice)) && (
                <p className="text-[10px] text-blue-600 font-bold mt-1">
                  Ekspektasi: {formatRupiah(Number(expectedPrice))}
                </p>
              )}
            </div>
          </div>

          {/* ── STEP 5: UPLOAD FOTO FISIK UNIT HP ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-xs text-slate-900 dark:text-white">
                <Upload className="w-4 h-4 text-rose-500" />
                <span>5. Foto Fisik Unit HP (Opsional tapi Direkomendasikan)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {uploadedPhotos.length} Foto
              </span>
            </div>

            {/* List Foto Terupload */}
            {uploadedPhotos.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 group"
                  >
                    <img src={url} alt={`Unit HP ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-rose-600 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                {isUploading ? "Mengunggah foto..." : "+ Unggah Foto Fisik HP (Layar / Belakang / 3uTools)"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          {/* ── TOMBOL SUBMIT PRIMER ── */}
          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>{loading ? "Menyimpan & Menyiapkan WA..." : "Ajukan Estimasi & Konsultasi via WhatsApp"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
