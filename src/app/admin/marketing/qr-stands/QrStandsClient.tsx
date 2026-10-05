"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Printer,
  Sparkles,
  QrCode,
  Globe,
  MapPin,
  ExternalLink,
  Star,
  CheckCircle2,
  Save,
  Check,
  Loader2,
  Phone,
  MessageCircle,
  Store as StoreIcon,
  Download,
  Smartphone,
  Info,
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
  // Tabs: "dual" (Default), "website", "google_review"
  const [activeTab, setActiveTab] = useState<"dual" | "website" | "google_review">("dual");
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
  const websiteUrl = store.customDomain
    ? (activeBranch ? `https://${activeBranch.slug}.${store.customDomain}` : `https://${store.customDomain}`)
    : (activeBranch ? `https://${store.slug}.${mainDomain}?branch=${activeBranch.slug}` : `https://${store.slug}.${mainDomain}`);

  const reviewUrl = reviewUrlInput.trim() || defaultReviewUrl;

  // Local HD QR Code Data URLs (Generate both concurrently)
  const [catalogQrDataUrl, setCatalogQrDataUrl] = useState<string>("");
  const [reviewQrDataUrl, setReviewQrDataUrl] = useState<string>("");

  useEffect(() => {
    let isSubscribed = true;

    // 1. Generate Catalog QR
    QRCode.toDataURL(websiteUrl, {
      width: 800,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: { dark: "#09090b", light: "#ffffff" },
    })
      .then((url) => {
        if (isSubscribed) setCatalogQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Catalog QR Code Generation Error:", err);
        if (isSubscribed) {
          setCatalogQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
              websiteUrl
            )}&margin=12&format=png&color=0-0-0&bgcolor=255-255-255`
          );
        }
      });

    // 2. Generate Review QR
    QRCode.toDataURL(reviewUrl, {
      width: 800,
      margin: 1.5,
      errorCorrectionLevel: "H",
      color: { dark: "#09090b", light: "#ffffff" },
    })
      .then((url) => {
        if (isSubscribed) setReviewQrDataUrl(url);
      })
      .catch((err) => {
        console.error("Review QR Code Generation Error:", err);
        if (isSubscribed) {
          setReviewQrDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
              reviewUrl
            )}&margin=12&format=png&color=0-0-0&bgcolor=255-255-255`
          );
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [websiteUrl, reviewUrl]);

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
        setSaveError(res.error || "Gagal menyimpan link ulasan Google Maps.");
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

  const effectivePhone = activeBranch?.whatsapp || store.whatsapp;
  const effectiveAddress = activeBranch?.address || store.address;
  const displayDomain = websiteUrl.replace(/^https?:\/\//, "");

  return (
    <div className="space-y-6">
      {/* ── Print Media Query CSS ── */}
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 0;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header,
          nav,
          aside,
          footer,
          .no-print,
          [role="navigation"] {
            display: none !important;
          }
          .print-wrapper {
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
            border: 2.5px solid #09090b !important;
            page-break-inside: avoid !important;
            margin: auto !important;
          }
        }
      `}</style>

      {/* ── 1. HEADER HALAMAN (NO-PRINT) ── */}
      <div className="no-print bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>MARKETING KIT DISPLAY MEJA KASIR</span>
            <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
              STARTER &amp; PRO UNLOCKED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cetak QR Code Display Meja Kasir
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Pajang kartu akrilik resmi di meja kasir dan etalase konter Anda. Pembeli langsung scan untuk cek seluruh stok katalog dan beri review bintang 5 di Google!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>🖨️ Cetak Lembar Meja Kasir (A5 / A6)</span>
          </button>
        </div>
      </div>

      {/* ── 2. LAYOUT TABS & UKURAN KERTAS (NO-PRINT) ── */}
      <div className="no-print flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Layout Mode Selector (3 Tabs) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveTab("dual")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeTab === "dual"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Dual QR (Katalog + Review)</span>
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">
              STANDAR
            </span>
          </button>

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
            <span>QR Katalog Saja</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("google_review")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeTab === "google_review"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>QR Google Review Saja</span>
          </button>
        </div>

        {/* Paper Size Selector (A6 vs A5) */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-slate-500 pl-1">Ukuran Akrilik:</span>
          {(["A6", "A5"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPaperSize(s)}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                paperSize === s
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {s} {s === "A6" ? "(10 x 15 cm / Meja Kasir)" : "(15 x 21 cm / Etalase Besar)"}
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
                Cetak QR khusus per konter agar pembeli langsung membuka katalog cabang &amp; ulasan cabang tersebut.
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
              className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

      {/* ── 3. INPUT FIELD GOOGLE MAPS REVIEW URL (SELALU TERSEDIA & DAPAT DISIMPAN) ── */}
      <div className="no-print bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              Link Ulasan Google Maps Toko {activeBranch ? `(${activeBranch.name})` : ""}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Tautan langsung ulasan Google Bisnisku toko Anda. Bila belum punya link pendek ulasan, sistem otomatis memakai pencarian Maps toko Anda.
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
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
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

      {/* ── 4. PREVIEW DISPLAY CARD / PRINT CANVAS ── */}
      <div className="print-wrapper flex justify-center py-4">
        {/* ========================================================
            LAYOUT 1: DUAL QR MEJA KASIR (KATALOG + GOOGLE REVIEW)
            ======================================================== */}
        {activeTab === "dual" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col justify-between text-center transition-all ${
              paperSize === "A6"
                ? "w-[380px] min-h-[550px] p-6"
                : "w-[480px] min-h-[660px] p-8"
            }`}
          >
            {/* Bagian Atas: Logo, Nama Toko, Tagline, URL */}
            <div className="w-full flex flex-col items-center space-y-1.5">
              {/* Logo Toko */}
              {store.logoUrl ? (
                <div className="h-12 flex items-center justify-center mb-1">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="max-h-12 max-w-[150px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-1 shadow-xs">
                  <StoreIcon className="w-6 h-6" />
                </div>
              )}

              {/* Nama Toko */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase leading-snug">
                {store.name}
              </h2>

              {/* Sub-judul Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <span>OFFICIAL STORE CATALOG &amp; REVIEW</span>
              </div>

              {/* URL Toko */}
              <p className="text-xs text-blue-600 font-mono font-black tracking-tight">
                {displayDomain}
              </p>
            </div>

            {/* Bagian Tengah: Dua QR Code Sejajar (Dual Column) */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* QR 1: Web Katalog Instan */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border-2 border-slate-800 shadow-2xs">
                <div className="w-full py-1 px-1.5 bg-blue-600 text-white rounded-lg mb-2 text-center">
                  <h3 className="text-[10px] sm:text-[11px] font-black tracking-tight uppercase leading-none">
                    SCAN KATALOG &amp; CEK STOK
                  </h3>
                </div>

                <div className="w-full aspect-square bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center shadow-inner">
                  {catalogQrDataUrl ? (
                    <img
                      src={catalogQrDataUrl}
                      alt={`Katalog ${store.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  )}
                </div>

                <p className="text-[9px] text-slate-600 font-semibold leading-tight mt-2 text-center">
                  Lihat seluruh etalase unit ready, foto asli, dan cek harga harian.
                </p>
              </div>

              {/* QR 2: Google Review Bintang 5 */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-amber-50/70 border-2 border-slate-800 shadow-2xs">
                <div className="w-full py-1 px-1.5 bg-amber-500 text-slate-950 rounded-lg mb-2 text-center flex flex-col items-center justify-center">
                  <h3 className="text-[10px] sm:text-[11px] font-black tracking-tight uppercase leading-none">
                    ULAS KAMI DI GOOGLE
                  </h3>
                  <div className="flex items-center justify-center gap-0.5 text-slate-950 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                    ))}
                  </div>
                </div>

                <div className="w-full aspect-square bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center shadow-inner">
                  {reviewQrDataUrl ? (
                    <img
                      src={reviewQrDataUrl}
                      alt={`Google Review ${store.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                  )}
                </div>

                <p className="text-[9px] text-slate-700 font-semibold leading-tight mt-2 text-center">
                  Puas belanja di toko kami? Scan untuk berikan rating &amp; review bintang 5.
                </p>
              </div>
            </div>

            {/* Bagian Bawah: WhatsApp, Alamat Singkat, Watermark */}
            <div className="w-full space-y-1.5 pt-2 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-800">
                {effectivePhone && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                    <span>WA: {effectivePhone}</span>
                  </span>
                )}
                {effectiveAddress && (
                  <span className="flex items-center gap-1 text-slate-500 font-medium truncate max-w-[280px]">
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>{effectiveAddress.split(",")[0]}</span>
                  </span>
                )}
              </div>

              <div className="text-[9px] text-slate-400 font-mono font-bold tracking-wider pt-1 uppercase">
                Powered by GadgetBdg
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            LAYOUT 2: QR KATALOG TOKO SAJA
            ======================================================== */}
        {activeTab === "website" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center transition-all ${
              paperSize === "A6"
                ? "w-[380px] min-h-[550px] p-8"
                : "w-[480px] min-h-[660px] p-10"
            }`}
          >
            {/* Header: Logo, Nama Toko & Subdomain / Custom Domain */}
            <div className="w-full space-y-1.5">
              {store.logoUrl ? (
                <div className="h-12 flex items-center justify-center mb-1">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="max-h-12 max-w-[160px] object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-1">
                  <StoreIcon className="w-6 h-6" />
                </div>
              )}

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-black uppercase tracking-wider text-slate-700">
                <Globe className="w-3 h-3 text-blue-600" />
                <span>{activeBranch ? `CABANG: ${activeBranch.name.toUpperCase()}` : "OFFICIAL STOREFRONT"}</span>
              </div>

              <h2 className="text-2xl font-black text-slate-950 tracking-tight uppercase leading-snug">
                {store.name}
              </h2>

              <p className="text-xs text-blue-600 font-mono font-black tracking-tight">
                {displayDomain}
              </p>
            </div>

            {/* Headline Badge */}
            <div className="w-full my-2">
              <div className="py-1.5 px-5 bg-slate-900 text-white rounded-xl inline-block shadow-xs">
                <h3 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                  SCAN KATALOG &amp; CEK STOK
                </h3>
              </div>
            </div>

            {/* Large QR Code Container */}
            <div className="p-3.5 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-2xl flex items-center justify-center p-1">
                {catalogQrDataUrl ? (
                  <img
                    src={catalogQrDataUrl}
                    alt={`QR Code ${store.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                )}
              </div>
            </div>

            {/* Teks Ajakan & Footer */}
            <div className="w-full space-y-2 mt-3">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs font-extrabold leading-relaxed">
                Lihat seluruh etalase unit ready, foto asli, dan cek harga harian.
              </div>

              {effectivePhone && (
                <p className="text-[11px] font-bold text-slate-700">
                  💬 WhatsApp Toko: {effectivePhone}
                </p>
              )}

              <div className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                Powered by GadgetBdg
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            LAYOUT 3: QR GOOGLE REVIEW SAJA
            ======================================================== */}
        {activeTab === "google_review" && (
          <div
            className={`print-card bg-white rounded-3xl border-2 border-slate-900 text-slate-900 shadow-2xl flex flex-col items-center justify-between text-center transition-all ${
              paperSize === "A6"
                ? "w-[380px] min-h-[550px] p-8"
                : "w-[480px] min-h-[660px] p-10"
            }`}
          >
            {/* Header: Logo Google Berwarna & 5 Bintang */}
            <div className="w-full space-y-1.5">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-black tracking-tight text-[#4285F4]">G</span>
                <span className="text-2xl font-black tracking-tight text-[#EA4335]">o</span>
                <span className="text-2xl font-black tracking-tight text-[#FBBC05]">o</span>
                <span className="text-2xl font-black tracking-tight text-[#4285F4]">g</span>
                <span className="text-2xl font-black tracking-tight text-[#34A853]">l</span>
                <span className="text-2xl font-black tracking-tight text-[#EA4335]">e</span>
              </div>

              <p className="text-xs font-black uppercase tracking-wider text-slate-800">
                ULAS KAMI DI GOOGLE
              </p>

              {/* 5 Bintang Emas */}
              <div className="flex items-center justify-center gap-1 text-amber-400 pt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-amber-400 text-amber-400 drop-shadow-xs" />
                ))}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight uppercase leading-snug pt-1">
                {store.name}
              </h2>
            </div>

            {/* QR Code Container */}
            <div className="p-3.5 rounded-3xl bg-white border-2 border-slate-900 shadow-inner flex flex-col items-center my-2">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-white rounded-2xl flex items-center justify-center p-1">
                {reviewQrDataUrl ? (
                  <img
                    src={reviewQrDataUrl}
                    alt={`QR Google Review ${store.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                )}
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Google Maps Verified Merchant</span>
              </span>
            </div>

            {/* Teks Ajakan & Footer */}
            <div className="w-full space-y-2 mt-2">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-extrabold leading-relaxed">
                Puas belanja di toko kami? Scan untuk berikan rating &amp; review bintang 5.
              </div>

              {effectivePhone && (
                <p className="text-[11px] font-bold text-slate-700">
                  💬 WhatsApp Toko: {effectivePhone}
                </p>
              )}

              <div className="text-[9px] text-slate-400 font-mono font-bold tracking-wider uppercase">
                Powered by GadgetBdg
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
