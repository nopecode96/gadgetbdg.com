"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  Lock,
  Sparkles,
  QrCode,
  Globe,
  MapPin,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import QRCode from "qrcode";
import { updateGoogleReviewUrlAction } from "@/lib/actions";

interface StoreProps {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  address: string | null;
  mapsUrl: string | null;
  googleReviewUrl?: string | null;
  tier: "STARTER" | "PRO" | "ADVANCE";
  planName?: string;
  hasQrGoogleReview: boolean;
  primaryColor: string;
  logoUrl: string | null;
}

interface BranchOption {
  id: string;
  name: string;
  slug: string;
  address?: string | null;
  whatsapp?: string | null;
  mapsUrl?: string | null;
  isMain?: boolean;
}

interface QrStandsClientProps {
  store: StoreProps;
  branches?: BranchOption[];
}

export function QrStandsClient({ store, branches = [] }: QrStandsClientProps) {
  const [activeTab, setActiveTab] = useState<"website" | "google_review">("website");
  const [paperSize, setPaperSize] = useState<"A6" | "A5">("A6");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");

  const activeBranch = branches.find((b) => b.id === selectedBranchId) || null;

  // Google Maps Review URL state & saving
  const defaultReviewUrl =
    activeBranch?.mapsUrl ||
    store.googleReviewUrl ||
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.name + " " + (activeBranch?.address || store.address || "Bandung")
    )}`;

  const [reviewUrlInput, setReviewUrlInput] = useState(defaultReviewUrl);
  const [isSavingReviewUrl, setIsSavingReviewUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // URLs
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";
  
  // Hitung website URL (jika cabang dipilih, arahkan ke subdomain cabang atau query cabang)
  let websiteUrl = store.customDomain
    ? (activeBranch ? `https://${activeBranch.slug}.${store.customDomain}` : `https://${store.customDomain}`)
    : (activeBranch ? `https://${store.slug}.${mainDomain}?branch=${activeBranch.slug}` : `https://${store.slug}.${mainDomain}`);

  const currentQrTarget = activeTab === "website" ? websiteUrl : reviewUrlInput;

  // Local HD QR Code Data URL Generator
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let isSubscribed = true;
    QRCode.toDataURL(currentQrTarget, {
      width: 600,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: {
        dark: "#09090b",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isSubscribed) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error("QR Code Generation Error:", err);
        // Fallback to external reliable QR Server API
        if (isSubscribed) {
          setQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
              currentQrTarget
            )}&margin=12&format=png&color=0-0-0&bgcolor=255-255-255`
          );
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [currentQrTarget]);

  async function handleSaveReviewUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewUrlInput.trim()) return;

    setIsSavingReviewUrl(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updateGoogleReviewUrlAction(store.id, reviewUrlInput.trim());
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(res.error || "Gagal menyimpan link review ulasan Google Maps.");
      }
    } catch (err: any) {
      setSaveError(err?.message || "Terjadi kesalahan saat menyimpan link ulasan.");
    } finally {
      setIsSavingReviewUrl(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* ── Print Media Query CSS ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          nav,
          footer,
          .no-print {
            display: none !important;
          }
          .print-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100vw !important;
            min-height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 2px solid #09090b !important;
            page-break-inside: avoid !important;
            margin: auto !important;
          }
        }
      `}</style>

      {/* ── 1. HEADER HALAMAN (NO-PRINT) ── */}
      <div className="no-print bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>MARKETING KIT DISPLAY MEJA</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Marketing Kit: Cetak QR Stand Meja Kasir
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Cetak kartu display akrilik untuk dipajang di etalase toko dan meja kasir konter Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            disabled={activeTab === "google_review" && !store.hasQrGoogleReview}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer ${
              activeTab === "google_review" && !store.hasQrGoogleReview
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20"
            }`}
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>🖨️ Cetak Kartu / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* ── 2. DUA TAB SWITCHER & UKURAN KERTAS (NO-PRINT) ── */}
      <div className="no-print flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Dua Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab("website")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeTab === "website"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Katalog Toko (Visit Website)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("google_review")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 relative ${
              activeTab === "google_review"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Google Maps Review ⭐⭐⭐⭐⭐</span>
            {!store.hasQrGoogleReview && (
              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                <Lock className="w-3 h-3" /> PRO &amp; ADVANCE
              </span>
            )}
          </button>
        </div>

        {/* Paper Size Selector */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 pl-1">Ukuran Akrilik:</span>
          {(["A6", "A5"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPaperSize(s)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition ${
                paperSize === s
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {s} {s === "A6" ? "(10 x 15 cm / Meja)" : "(15 x 21 cm / Etalase)"}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2.5 SELECTOR CABANG LOKASI (JIKA ADA CABANG TERDAFTAR) ── */}
      {branches.length > 0 && (
        <div className="no-print bg-white rounded-3xl p-4 sm:p-5 border border-indigo-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
              📍
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Pilih Cabang untuk QR Meja &amp; Standee
              </h3>
              <p className="text-[11px] text-slate-500">
                Cetak QR khusus per konter agar pembeli langsung membuka katalog cabang &amp; hotline WA cabang tersebut.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedBranchId}
              onChange={(e) => {
                const bId = e.target.value;
                setSelectedBranchId(bId);
                const chosen = branches.find((b) => b.id === bId);
                if (chosen?.mapsUrl) {
                  setReviewUrlInput(chosen.mapsUrl);
                } else {
                  setReviewUrlInput(
                    store.googleReviewUrl ||
                      store.mapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        store.name + " " + (chosen?.address || store.address || "Bandung")
                      )}`
                  );
                }
              }}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Cabang / Toko Pusat (Default)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {b.isMain ? "(Pusat)" : ""} — /{b.slug}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── 3. INPUT FIELD GOOGLE MAPS REVIEW URL (JIKA TAB REVIEW AKTIF & PRO/ADVANCE) ── */}
      {activeTab === "google_review" && store.hasQrGoogleReview && (
        <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Link Profil Google Maps Toko {activeBranch ? `(${activeBranch.name})` : ""}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan tautan langsung ulasan Google Bisnisku toko Anda agar pelanggan langsung diarahkan ke form bintang 5.
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                <Check className="w-3.5 h-3.5" /> Link berhasil disimpan!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReviewUrl} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={reviewUrlInput}
              onChange={(e) => setReviewUrlInput(e.target.value)}
              placeholder="https://g.page/r/.../review atau link Google Maps toko"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-mono"
              required
            />
            <button
              type="submit"
              disabled={isSavingReviewUrl}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shrink-0"
            >
              {isSavingReviewUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Link Review</span>
                </>
              )}
            </button>
          </form>
          {saveError && (
            <p className="text-xs text-rose-600 font-semibold">{saveError}</p>
          )}
        </div>
      )}

      {/* ── 4. PREVIEW DISPLAY CARD / PRINT CANVAS ── */}
      <div className="print-container flex justify-center py-4">
        {/* ========================================================
            TAB 1: STAND "SCAN TO VISIT OUR WEBSITE"
            ======================================================== */}
        {activeTab === "website" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center transition-all ${
              paperSize === "A6"
                ? "w-[360px] min-h-[510px] p-8"
                : "w-[440px] min-h-[620px] p-10"
            }`}
          >
            {/* Header: Nama Toko & Subdomain / Custom Domain */}
            <div className="w-full space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>{activeBranch ? `CABANG: ${activeBranch.name.toUpperCase()}` : "OFFICIAL STOREFRONT"}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-snug">
                {store.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono font-bold tracking-tight">
                {websiteUrl.replace(/^https?:\/\//, "")}
              </p>
              {(activeBranch?.address || store.address) && (
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs mx-auto">
                  📍 {(activeBranch?.address || store.address || "").split(",")[0]}
                </p>
              )}
            </div>

            {/* Headline */}
            <div className="w-full my-3">
              <div className="py-1 px-4 bg-slate-900 text-white rounded-xl inline-block">
                <h3 className="text-sm font-black tracking-wider uppercase">
                  SCAN TO VISIT OUR WEBSITE
                </h3>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-3.5 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl flex items-center justify-center p-1">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code ${store.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Teks Ajakan */}
            <div className="w-full space-y-2 mt-4">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-extrabold leading-relaxed">
                Buka kamera HP Anda untuk melihat katalog lengkap, cek Battery Health, dan unit ready hari ini.
              </div>
              <div className="text-[9px] text-slate-400 font-mono font-medium tracking-wider">
                POWERED BY GADGETBDG.COM
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: STAND "REVIEW US ON GOOGLE ⭐⭐⭐⭐⭐"
            ======================================================== */}
        {activeTab === "google_review" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center relative transition-all ${
              paperSize === "A6"
                ? "w-[360px] min-h-[510px] p-8"
                : "w-[440px] min-h-[620px] p-10"
            }`}
          >
            {/* OVERLAY TERKUNCI JIKA AKUN STARTER */}
            {!store.hasQrGoogleReview && (
              <div className="no-print absolute inset-0 bg-white/95 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-3xl border-2 border-amber-300">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Tingkatkan Peringkat Toko Anda di Google Maps
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs mx-auto">
                    Fitur Cetak Display Akrilik Google Review ⭐⭐⭐⭐⭐ tersedia mulai paket <b>PRO • BISNIS MANDIRI</b>.
                  </p>
                </div>
                <Link
                  href="/admin/settings"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
                >
                  <span>Upgrade ke Paket Pro Sekarang →</span>
                </Link>
              </div>
            )}

            {/* Header: Logo Google Berwarna Resmi di Bagian Atas */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black tracking-tight text-[#4285F4]">G</span>
                <span className="text-2xl font-black tracking-tight text-[#EA4335]">o</span>
                <span className="text-2xl font-black tracking-tight text-[#FBBC05]">o</span>
                <span className="text-2xl font-black tracking-tight text-[#4285F4]">g</span>
                <span className="text-2xl font-black tracking-tight text-[#34A853]">l</span>
                <span className="text-2xl font-black tracking-tight text-[#EA4335]">e</span>
              </div>

              {/* Teks: "review us on Google" */}
              <p className="text-xs font-black uppercase tracking-wider text-slate-800">
                review us on Google
              </p>

              {/* Deretan 5 Bintang Emas */}
              <div className="flex items-center justify-center gap-1 text-amber-400 pt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-xs" />
                ))}
              </div>

              <h2 className="text-lg font-black text-slate-950 tracking-tight uppercase leading-snug pt-1">
                {store.name}
              </h2>
            </div>

            {/* QR Code Container */}
            <div className="p-3.5 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center my-2">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl flex items-center justify-center p-1">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Google Review ${store.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Google Maps Verified Merchant</span>
              </span>
            </div>

            {/* Teks Ajakan */}
            <div className="w-full space-y-2 mt-2">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold leading-relaxed">
                Bantu toko kami berkembang dengan memberikan ulasan bintang 5!
              </div>
              <div className="text-[9px] text-slate-400 font-mono font-medium tracking-wider">
                POWERED BY GADGETBDG.COM
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
