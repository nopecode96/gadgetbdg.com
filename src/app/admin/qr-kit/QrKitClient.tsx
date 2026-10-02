"use client";

import React, { useState, useRef, useEffect } from "react";
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
  googleReviewUrl: string | null;
  tier: "STARTER" | "PRO" | "ADVANCE";
  primaryColor: string;
  logoUrl: string | null;
}

export function QrKitClient({ store }: { store: StoreProps }) {
  const [activeTab, setActiveTab] = useState<"catalog" | "review">("catalog");
  const [selectedFormat, setSelectedFormat] = useState<string>("compact-mono");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const tierConfig = TIER_LIMITS[store.tier] || TIER_LIMITS.STARTER;
  const qrRules = tierConfig.qrKit;

  // URLs
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com";
  const catalogUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://${store.slug}.${mainDomain}`;

  const reviewUrl =
    store.googleReviewUrl ||
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.name + " " + (store.address || "Bandung")
    )}`;

  const currentQrTarget = activeTab === "catalog" ? catalogUrl : reviewUrl;

  // QR Code generation via Google Charts QR API (Fast, pure SVG/PNG vector friendly without heavy node packages)
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
    currentQrTarget
  )}&margin=12&format=png&color=0-0-0&bgcolor=255-255-255`;

  // Printing trigger
  function handlePrint() {
    window.print();
  }

  // HD Download trigger
  async function handleDownloadHd() {
    if (!qrRules.allowHdDownload) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const response = await fetch(qrImageSrc);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-${activeTab === "catalog" ? "Katalog" : "Review"}-${store.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(qrImageSrc, "_blank");
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Print Styles CSS Injection ── */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header,
          nav,
          .no-print {
            display: none !important;
          }
          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
        }
      `}</style>

      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <QrCode className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              QR Code Kit Meja Kasir
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                store.tier === "ADVANCE"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : store.tier === "PRO"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              Paket {store.tier}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cetak standee akrilik kasir untuk memudahkan calon pembeli mengecek stok unit atau memberi ulasan Google Bintang 5.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Standee (A5 / Akrilik)</span>
          </button>

          <button
            onClick={handleDownloadHd}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-sm ${
              qrRules.allowHdDownload
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200"
            }`}
          >
            {qrRules.allowHdDownload ? (
              <>
                <Download className="w-4 h-4" />
                <span>Unduh Gambar PNG (HD)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Unduh HD (Pro/Advance)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Tab Navigation ── */}
      <div className="flex border-b border-slate-200 no-print gap-3">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === "catalog"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Tab 1: QR Katalog Web PWA</span>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
            Semua Paket
          </span>
        </button>

        <button
          onClick={() => {
            if (!qrRules.allowGoogleReview) {
              setShowUpgradeModal(true);
            } else {
              setActiveTab("review");
            }
          }}
          className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === "review"
              ? "border-amber-600 text-amber-600"
              : qrRules.allowGoogleReview
              ? "border-transparent text-slate-500 hover:text-slate-900"
              : "border-transparent text-slate-400 opacity-70"
          }`}
        >
          <Star className="w-4 h-4 text-amber-500" />
          <span>Tab 2: QR Ulasan Google Maps ⭐</span>
          {!qrRules.allowGoogleReview && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
              <Lock className="w-3 h-3" /> Pro &amp; Advance
            </span>
          )}
        </button>
      </div>

      {/* ── Locked Banner for Starter when Review tab clicked ── */}
      {!qrRules.allowGoogleReview && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 no-print">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-xs text-amber-900">
              Fitur QR Google Review Tersedia di Paket Pro &amp; Advance
            </h3>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Tingkatkan reputasi toko konter Anda di Google Maps secara organik dengan meminta pembeli yang puas melakukan scan QR ulasan bintang 5 langsung dari meja kasir.
            </p>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 transition"
          >
            Upgrade Paket Sekarang
          </button>
        </div>
      )}

      {/* ── Main Layout: Controls & Live Standee Preview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Customization Controls (No-Print) */}
        <div className="lg:col-span-5 space-y-6 no-print">
          {/* Format Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Format Standee Cetak Meja</span>
            </h3>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              {/* Option 1: Compact Mono (All tiers) */}
              <label
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedFormat === "compact-mono"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === "compact-mono"}
                    onChange={() => setSelectedFormat("compact-mono")}
                    className="text-blue-600"
                  />
                  <div>
                    <div>Compact Monokrom (Kasir Standard)</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Format hemat tinta, kontras maksimal untuk scanner HP
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-600">Semua Tier</span>
              </label>

              {/* Option 2: Acrylic Stand (Pro & Advance) */}
              <label
                onClick={() => {
                  if (!qrRules.allowedFormats.includes("acrylic-stand" as any)) {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedFormat === "acrylic-stand"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                    : !qrRules.allowedFormats.includes("acrylic-stand" as any)
                    ? "opacity-60 bg-slate-50 border-slate-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === "acrylic-stand"}
                    onChange={() => {
                      if (qrRules.allowedFormats.includes("acrylic-stand" as any)) {
                        setSelectedFormat("acrylic-stand");
                      }
                    }}
                    disabled={!qrRules.allowedFormats.includes("acrylic-stand" as any)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>Akrilik Vertikal A5</span>
                      {!qrRules.allowedFormats.includes("acrylic-stand" as any) && (
                        <Lock className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Frame display akrilik meja kasir dengan header warna tema toko
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold">Pro / Advance</span>
              </label>

              {/* Option 3: Tent Card (Pro & Advance) */}
              <label
                onClick={() => {
                  if (!qrRules.allowedFormats.includes("tent-card" as any)) {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedFormat === "tent-card"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900 font-bold"
                    : !qrRules.allowedFormats.includes("tent-card" as any)
                    ? "opacity-60 bg-slate-50 border-slate-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === "tent-card"}
                    onChange={() => {
                      if (qrRules.allowedFormats.includes("tent-card" as any)) {
                        setSelectedFormat("tent-card");
                      }
                    }}
                    disabled={!qrRules.allowedFormats.includes("tent-card" as any)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>Tent Card Segitiga (Double Sided)</span>
                      {!qrRules.allowedFormats.includes("tent-card" as any) && (
                        <Lock className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      Dua sisi kartu lipat meja kasir
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 font-bold">Pro / Advance</span>
              </label>

              {/* Option 4: Gold Luxury (Advance only) */}
              <label
                onClick={() => {
                  if (!qrRules.allowedFormats.includes("gold-luxury" as any)) {
                    setShowUpgradeModal(true);
                  }
                }}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  selectedFormat === "gold-luxury"
                    ? "border-amber-600 bg-amber-50/50 text-amber-900 font-bold"
                    : !qrRules.allowedFormats.includes("gold-luxury" as any)
                    ? "opacity-60 bg-slate-50 border-slate-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="radio"
                    name="format"
                    checked={selectedFormat === "gold-luxury"}
                    onChange={() => {
                      if (qrRules.allowedFormats.includes("gold-luxury" as any)) {
                        setSelectedFormat("gold-luxury");
                      }
                    }}
                    disabled={!qrRules.allowedFormats.includes("gold-luxury" as any)}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Edisi Eksklusif Gold Luxury</span>
                      {!qrRules.allowedFormats.includes("gold-luxury" as any) && (
                        <Lock className="w-3 h-3 text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-amber-700 font-normal">
                      Aksen warna emas mewah untuk konter flagship premium
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-700 font-bold">Khusus Advance</span>
              </label>
            </div>
          </div>

          {/* Target Link Info Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Target URL yang Dihubungkan</span>
            </h3>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs break-all font-mono text-slate-700">
              {currentQrTarget}
            </div>

            {activeTab === "review" && !store.googleReviewUrl && (
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  Link ulasan Google Bisnis spesifik belum diisi. Anda dapat memasukkannya di{" "}
                  <Link href="/admin/settings" className="font-bold underline text-amber-900">
                    Pengaturan Toko
                  </Link>{" "}
                  agar pembeli langsung diarahkan ke form bintang 5 Google.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Printable Standee Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="text-center mb-3 no-print">
            <span className="text-xs text-slate-400 font-mono">
              [Preview Cetak Standee Meja Kasir A5]
            </span>
          </div>

          {/* Standee Container (This element is strictly preserved when printing) */}
          <div
            className={`print-container w-full max-w-[420px] rounded-3xl border-2 p-6 sm:p-8 flex flex-col items-center justify-between text-center transition-all shadow-xl relative overflow-hidden ${
              selectedFormat === "gold-luxury"
                ? "bg-gradient-to-b from-slate-900 via-amber-950 to-slate-950 text-white border-amber-500 shadow-amber-500/10"
                : selectedFormat === "acrylic-stand"
                ? "bg-white text-slate-900 border-slate-300 shadow-slate-200"
                : "bg-white text-slate-900 border-slate-900 shadow-slate-200"
            }`}
            style={{
              minHeight: "560px",
            }}
          >
            {/* Top Store Identity */}
            <div className="w-full space-y-2 pt-2">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-md border"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl mx-auto shadow-md"
                  style={{
                    backgroundColor:
                      selectedFormat === "gold-luxury" ? "#d97706" : store.primaryColor || "#2563eb",
                  }}
                >
                  {store.name.charAt(0)}
                </div>
              )}

              <div>
                <h2
                  className={`text-xl font-black tracking-tight ${
                    selectedFormat === "gold-luxury" ? "text-amber-200" : "text-slate-950"
                  }`}
                >
                  {store.name}
                </h2>
                {store.address && (
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      selectedFormat === "gold-luxury" ? "text-amber-400/80" : "text-slate-500"
                    }`}
                  >
                    {store.address}
                  </p>
                )}
              </div>
            </div>

            {/* Middle: Prominent QR Code */}
            <div className="my-5 w-full flex flex-col items-center">
              <div
                className={`p-4 rounded-3xl border-2 bg-white shadow-md inline-block select-none ${
                  selectedFormat === "gold-luxury" ? "border-amber-400" : "border-slate-900"
                }`}
              >
                <img
                  src={qrImageSrc}
                  alt="QR Code Kasir"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>

              {/* Call-To-Action Phrase */}
              <div className="mt-4 px-3 space-y-1">
                {activeTab === "catalog" ? (
                  <>
                    <div
                      className={`text-sm sm:text-base font-black tracking-tight ${
                        selectedFormat === "gold-luxury" ? "text-amber-300" : "text-slate-900"
                      }`}
                    >
                      SCAN UNTUK CEK STOK &amp; HARGA HP HARI INI
                    </div>
                    <p
                      className={`text-xs ${
                        selectedFormat === "gold-luxury" ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Buka kamera HP Anda untuk melihat katalog lengkap, garansi &amp; spesifikasi unit.
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className={`text-sm sm:text-base font-black tracking-tight flex items-center justify-center gap-1 ${
                        selectedFormat === "gold-luxury" ? "text-amber-300" : "text-slate-900"
                      }`}
                    >
                      <span>PUAS DENGAN LAYANAN KAMI? ⭐</span>
                    </div>
                    <p
                      className={`text-xs ${
                        selectedFormat === "gold-luxury" ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Bantu kami dengan memberikan Ulasan Bintang 5 di Google Maps. Terima kasih!
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Bottom Footer: Platform Watermark vs Custom Brand */}
            <div className="w-full pt-3 border-t border-slate-200/50">
              {qrRules.showWatermarkPlatform ? (
                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Powered by gadgetbdg.com
                </div>
              ) : (
                <div
                  className={`text-[10px] font-mono tracking-wider ${
                    selectedFormat === "gold-luxury" ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  Official Merchant • {store.slug}.gadgetbdg.com
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Upgrade Plan Modal (Triggered on Starter limit violation) ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Fitur Eksklusif Paket Pro &amp; Advance
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Toko Anda saat ini menggunakan paket <b>{store.tier}</b>. Fitur unduh gambar kualitas HD, standee akrilik A5, dan QR Ulasan Google Bintang 5 membutuhkan paket Pro atau Advance.
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>QR Google Review langsung ke Google Bisnis</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Unduh file PNG resolusi tinggi siap cetak percetakan</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bebas watermark branding platform &quot;gadgetbdg.com&quot;</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                  `Halo Admin GadgetBdg, saya ingin upgrade paket toko ${store.name} (${store.slug}) untuk mengaktifkan fitur QR Code Kit Akrilik & Review!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md text-center transition flex items-center justify-center gap-1.5"
              >
                <span>Upgrade via WA</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
