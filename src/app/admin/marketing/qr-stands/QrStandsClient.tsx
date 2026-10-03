"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Download,
  Lock,
  Sparkles,
  QrCode,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Star,
  Layers,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { TIER_LIMITS } from "@/lib/constants/pricing";

interface StoreProps {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  address: string | null;
  mapsUrl: string | null;
  tier: "STARTER" | "PRO" | "ADVANCE";
  hasQrGoogleReview?: boolean;
  primaryColor: string;
  logoUrl: string | null;
}

export function QrStandsClient({ store }: { store: StoreProps }) {
  const [activeTab, setActiveTab] = useState<"website" | "google_review">("website");
  const [paperSize, setPaperSize] = useState<"A6" | "A5">("A6");

  const tierConfig = TIER_LIMITS[store.tier] || TIER_LIMITS.STARTER;
  const isGoogleReviewAllowed = store.hasQrGoogleReview ?? tierConfig.hasQrGoogleReview;

  // URLs
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";
  const websiteUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://${store.slug}.${mainDomain}`;

  const googleReviewUrl =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.name + " " + (store.address || "Bandung")
    )}`;

  const currentQrTarget = activeTab === "website" ? websiteUrl : googleReviewUrl;

  // Vector clean QR Code from QR Server API
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
    currentQrTarget
  )}&margin=12&format=png&color=0-0-0&bgcolor=255-255-255`;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {/* ── Print Media Query CSS ── */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          nav,
          header,
          footer,
          .no-print {
            display: none !important;
          }
          .print-container {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            width: 100vw !important;
            height: 100vh !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ── TOP HEADER (NO-PRINT) ── */}
      <div className="no-print bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>DISPLAY MEJA KASIR / AKRILIK STAND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cetak QR Code Display Meja Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Tingkatkan interaksi pengunjung toko fisik di konter Anda. Siap cetak dengan proporsi standar display akrilik meja (A6 &amp; A5) untuk kunjungan katalog atau ulasan bintang 5 Google Maps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-slate-900/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Cetak Stand Meja (Print)</span>
          </button>
        </div>
      </div>

      {/* ── TAB & OPTIONS SELECTOR (NO-PRINT) ── */}
      <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Desain Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab("website")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === "website"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Desain 1: Visit Our Website</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("google_review")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 relative ${
              activeTab === "google_review"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Desain 2: Review on Google ⭐⭐⭐⭐⭐</span>
            {!isGoogleReviewAllowed && (
              <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black">
                PRO &amp; ADVANCE
              </span>
            )}
          </button>
        </div>

        {/* Paper Size Selector */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span>Ukuran Kertas Akrilik:</span>
          {(["A6", "A5"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPaperSize(s)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-black transition ${
                paperSize === s
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {s} {s === "A6" ? "(Standar Meja 10x15cm)" : "(Display Besar 15x21cm)"}
            </button>
          ))}
        </div>
      </div>

      {/* ── LOCK BANNER JIKA STARTER MEMBUKA REVIEW GOOGLE ── */}
      {activeTab === "google_review" && !isGoogleReviewAllowed && (
        <div className="no-print p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm">
                Fitur Stand Akrilik Google Review Tersedia di Paket Pro &amp; Advance
              </h4>
              <p className="text-xs text-amber-800 font-medium leading-relaxed max-w-xl">
                Toko Anda saat ini menggunakan paket <b>Starter</b>. Upgrade ke paket <b>Pro</b> atau <b>Advance</b> untuk membuka QR Stand Google Review dengan logo resmi Google Maps dan bintang 5 emas guna melesatkan reputasi toko fisik di BEC/Bandung.
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black whitespace-nowrap shadow-xs transition"
          >
            Upgrade ke Pro
          </Link>
        </div>
      )}

      {/* ── PREVIEW CARD / PRINT CANVAS ── */}
      <div className="print-container flex justify-center py-4">
        {/* DESAIN 1: VISIT OUR WEBSITE */}
        {activeTab === "website" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center transition-all ${
              paperSize === "A6"
                ? "w-[360px] min-h-[510px] p-8"
                : "w-[440px] min-h-[620px] p-10"
            }`}
          >
            {/* Header Stand */}
            <div className="w-full space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>OFFICIAL SMARTPHONE CATALOG</span>
              </div>
              <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-snug">
                {store.name}
              </h2>
              <p className="text-xs text-slate-500 font-semibold truncate max-w-xs mx-auto">
                📍 {store.address ? store.address.split(",")[0] : "BEC BANDUNG"}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="my-5 p-4 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl flex items-center justify-center p-1">
                <img
                  src={qrImageSrc}
                  alt={`QR Code ${store.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-500 font-black mt-2">
                {websiteUrl.replace(/^https?:\/\//, "")}
              </span>
            </div>

            {/* Bottom Callout */}
            <div className="w-full space-y-2">
              <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold leading-relaxed">
                📱 Scan QR menggunakan kamera HP untuk cek stok unit, persentase Battery Health, &amp; harga terkini!
              </div>
              <div className="text-[9px] text-slate-400 font-mono font-medium tracking-wider">
                POWERED BY GADGETBDG.COM
              </div>
            </div>
          </div>
        )}

        {/* DESAIN 2: REVIEW US ON GOOGLE ⭐⭐⭐⭐⭐ */}
        {activeTab === "google_review" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center relative transition-all ${
              paperSize === "A6"
                ? "w-[360px] min-h-[510px] p-8"
                : "w-[440px] min-h-[620px] p-10"
            }`}
          >
            {/* Watermark Overlay jika Starter mencoba print preview */}
            {!isGoogleReviewAllowed && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-3xl">
                <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Fitur Eksklusif Paket Pro &amp; Advance
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-xs">
                  Cetak stand QR Review Google Maps dengan bintang 5 emas otomatis aktif saat Anda mengupgrade ke paket Pro atau Advance.
                </p>
                <Link
                  href="/admin/settings"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Upgrade Sekarang
                </Link>
              </div>
            )}

            {/* Header Google Review Stand */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-base font-black tracking-tight text-blue-600">G</span>
                <span className="text-base font-black tracking-tight text-red-500">o</span>
                <span className="text-base font-black tracking-tight text-yellow-500">o</span>
                <span className="text-base font-black tracking-tight text-blue-600">g</span>
                <span className="text-base font-black tracking-tight text-green-500">l</span>
                <span className="text-base font-black tracking-tight text-red-500">e</span>
                <span className="text-xs font-black text-slate-900 uppercase ml-1">Reviews</span>
              </div>

              {/* 5 Bintang Emas */}
              <div className="flex items-center justify-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-xs" />
                ))}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase leading-snug">
                Review Us on Google
              </h2>
              <p className="text-xs text-slate-600 font-bold truncate max-w-xs mx-auto">
                {store.name}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="my-5 p-4 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 bg-white rounded-2xl flex items-center justify-center p-1">
                <img
                  src={qrImageSrc}
                  alt={`QR Google Review ${store.name}`}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Google Maps Verified Merchant</span>
              </span>
            </div>

            {/* Bottom Callout */}
            <div className="w-full space-y-2">
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold leading-relaxed">
                ⭐ Puas dengan pelayanan kami? Scan QR ini dan berikan ulasan bintang 5 Anda di Google Maps!
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
