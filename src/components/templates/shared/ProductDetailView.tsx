"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  BatteryCharging,
  ShieldCheck,
  HardDrive,
  Cpu,
  Package,
  Sparkles,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Share2,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { StoreData, ProductData } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { formatRupiah } from "@/lib/utils";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ProductDetailViewProps {
  store: StoreData;
  product: ProductData;
  backUrl?: string;
}

export function ProductDetailView({
  store,
  product,
  backUrl,
}: ProductDetailViewProps) {
  const theme = getTemplateConfig(store.templateId);
  const { colors } = theme;
  const isDark = colors.isDark;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ["/images/items/iphone-15-pro.png"];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const showWatermark = Boolean(store.hasWatermark || store.tier !== "STARTER");

  // Phone clean
  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const waMessage = encodeURIComponent(
    `Halo ${store.name}, saya tertarik dengan unit *${product.name}* (${formatRupiah(
      product.price
    )}) yang ada di link:\n${currentUrl}\n\nApakah unit masih ada dan bisa dicek/COD?`
  );

  const shareWaUrl = `https://wa.me/?text=${encodeURIComponent(
    `Cek unit HP second berkualitas ini di ${store.name}: *${product.name}* (${formatRupiah(
      product.price
    )}) - ${currentUrl}`
  )}`;

  const shareFbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    currentUrl
  )}`;

  const shareXUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Cek unit HP *${product.name}* (${formatRupiah(product.price)}) di ${store.name}: ${currentUrl}`
  )}`;

  function handleCopyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  function handleOrderClick() {
    try {
      trackWhatsAppClickAction(product.id, store.id);
    } catch (e) {
      console.error(e);
    }
  }

  const returnLink = backUrl || `/${store.slug}`;

  return (
    <div className={`min-h-screen ${colors.bgMain} flex flex-col font-sans transition-colors duration-300`}>
      {/* 1. TOP NAVIGATION BAR */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-300 px-4 py-3 flex items-center justify-between ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white/90 border-slate-200 text-slate-900 shadow-xs"
        }`}
      >
        <Link
          href={returnLink}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl transition ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </Link>

        {/* Store Name & Physical Location */}
        <div className="text-right min-w-0">
          <div className="text-xs font-extrabold truncate max-w-[170px] sm:max-w-xs">
            {store.name}
          </div>
          {store.address && (
            <div className="text-[10px] opacity-70 flex items-center justify-end gap-1 truncate max-w-[170px] sm:max-w-xs">
              <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-500" />
              <span className="truncate">{store.address.split(",")[0]}</span>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN DETAIL CONTENT */}
      <main className="max-w-2xl mx-auto w-full px-4 py-5 space-y-5 pb-28">
        {/* Foto Utama & Watermark */}
        <div
          className={`rounded-3xl p-3 sm:p-4 border overflow-hidden relative shadow-sm ${
            isDark
              ? "bg-slate-900 border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="aspect-[4/3] sm:aspect-video w-full rounded-2xl bg-neutral-100 dark:bg-slate-950/80 relative overflow-hidden flex items-center justify-center p-2 select-none border border-neutral-200/50 dark:border-slate-800">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-contain p-2 transition-transform duration-300"
            />

            {/* WATERMARK OVERLAY: PRO & ADVANCE */}
            {showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <div className="transform -rotate-[15deg] opacity-35 bg-black/45 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-[1px] shadow-xl">
                  <span className="text-white font-black text-sm sm:text-base tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                    {store.name}
                  </span>
                </div>
              </div>
            )}

            {/* Corner ID */}
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-2 py-0.5 rounded-md opacity-80 pointer-events-none">
              @{store.slug}
            </div>
          </div>

          {/* Thumbnail Slider if > 1 images */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 p-0.5 shrink-0 transition ${
                    activeImageIdx === idx
                      ? "border-indigo-600 ring-2 ring-indigo-500/30"
                      : "border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Utama: Status, Judul, & Harga */}
        <div
          className={`rounded-3xl p-5 sm:p-6 border space-y-4 shadow-sm ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-950"
          }`}
        >
          {/* Badge Ketersediaan Stok */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              {product.status === "AVAILABLE" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Stok Tersedia (Siap COD / Kirim)
                </span>
              ) : product.status === "BOOKED" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Sedang Di-Booked Pembeli
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/30">
                  Unit Ini Sudah Terjual (Sold Out)
                </span>
              )}
            </div>

            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-black">
              {product.brand}
            </span>
          </div>

          {/* Judul & Harga */}
          <div className="space-y-1.5">
            <h1
              className={`text-xl sm:text-2xl font-black leading-snug tracking-tight ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              {product.name}
            </h1>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isDark ? colors.priceText : "text-blue-700 font-black"
              }`}
            >
              {formatRupiah(product.price)}
            </div>
          </div>

          {/* Social Media Share Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className={`font-black ${isDark ? "text-slate-300" : "text-slate-800"}`}>
              Bagikan Unit Ini:
            </span>

            <div className="flex items-center gap-1.5">
              {/* WA Share */}
              <a
                href={shareWaUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              {/* FB Share */}
              <a
                href={shareFbUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs"
                title="Bagikan ke Facebook"
              >
                <span className="font-black text-xs px-1">f</span>
              </a>

              {/* X Share */}
              <a
                href={shareXUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-black hover:bg-slate-800 text-white border border-slate-700 transition shadow-xs"
                title="Bagikan ke X"
              >
                <span className="font-black text-xs px-0.5">𝕏</span>
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 3. GRID SPESIFIKASI TRANSPARAN */}
        <div
          className={`rounded-3xl p-5 sm:p-6 border space-y-4 shadow-sm ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-950"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2
              className={`text-sm sm:text-base font-black tracking-tight ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              Spesifikasi Detail Unit HP
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
            {/* Battery Health (khusus iPhone / jika ada) */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-extrabold text-[11px]">
                <BatteryCharging className="w-3.5 h-3.5" />
                <span>Battery Health</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.batteryHealth ? `${product.batteryHealth}% Normal` : "Original Bawaan"}
              </div>
            </div>

            {/* Legalitas IMEI */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Status IMEI</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.imeiStatus || "Resmi Terdaftar"}
              </div>
            </div>

            {/* RAM & Storage */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-extrabold text-[11px]">
                <HardDrive className="w-3.5 h-3.5" />
                <span>RAM &amp; Storage</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.ramRom || "-"}
              </div>
            </div>

            {/* Kelengkapan Unit */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-extrabold text-[11px]">
                <Package className="w-3.5 h-3.5" />
                <span>Kelengkapan</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.completeness || "Fullset"}
              </div>
            </div>

            {/* Kondisi Fisik */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 font-extrabold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kondisi Fisik</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.condition || "98% Mulus"}
              </div>
            </div>

            {/* Brand */}
            <div className={`p-3.5 rounded-2xl border space-y-1 ${
              isDark
                ? "bg-slate-950/70 border-slate-800"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-400 font-extrabold text-[11px]">
                <Tag className="w-3.5 h-3.5" />
                <span>Merk / Brand</span>
              </div>
              <div className={`font-black text-xs sm:text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                {product.brand}
              </div>
            </div>
          </div>
        </div>

        {/* 4. CATATAN MINUS & RIWAYAT PEMAKAIAN (KUNCI KEJUJURAN TOKO) */}
        <div className="rounded-3xl p-5 border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/60 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Catatan Minus &amp; Hasil Uji Fungsi Toko:</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-900 dark:text-slate-200 font-semibold pl-6">
            {product.minusNotes && product.minusNotes.trim().length > 0
              ? product.minusNotes
              : "Unit mulus normal tanpa minus fungsional. Lolos 30 titik uji kelayakan toko."}
          </p>
        </div>

        {/* 4.5. LOKASI FISIK CABANG & READY STOCK */}
        {product.branch ? (
          <div
            className={`rounded-3xl p-5 border space-y-3 shadow-xs ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-950"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Lokasi Unit Fisik / Titik COD
                  </div>
                  <div className={`font-black text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
                    📍 Ready Stock di: {product.branch.name} {product.branch.isMain && "(Pusat)"}
                  </div>
                </div>
              </div>
            </div>

            <p className={`text-xs leading-relaxed pl-10 font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              {product.branch.address}
            </p>

            {product.branch.mapsUrl && (
              <div className="pl-10 pt-1">
                <a
                  href={product.branch.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-black transition border border-blue-200 dark:border-blue-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Petunjuk Arah (Google Maps)</span>
                </a>
              </div>
            )}
          </div>
        ) : store.address ? (
          <div
            className={`rounded-3xl p-4 border space-y-2 shadow-xs ${
              isDark
                ? "bg-slate-900 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-950"
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className={`font-black text-xs ${isDark ? "text-white" : "text-slate-950"}`}>
                Lokasi Toko: {store.address}
              </div>
            </div>
            {store.mapsUrl && (
              <div className="pl-6">
                <a
                  href={store.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Buka Peta Google Maps</span>
                </a>
              </div>
            )}
          </div>
        ) : null}

        {/* Jaminan & Keamanan Transaksi Toko */}
        <div
          className={`rounded-2xl p-4 border text-xs space-y-1.5 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-white"
              : "bg-white border-slate-200 text-slate-950"
          }`}
        >
          <div className="font-black flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Jaminan Belanja Aman GadgetBDG</span>
          </div>
          <p className={`text-[11px] leading-relaxed font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Bisa COD dan cek fisik langsung sepuasnya di konter kami ({product.branch?.name || store.address || "Bandung"}). Garansi personal toko penggantian unit atau servis jika ada kendala non-human error.
          </p>
        </div>
      </main>

      {/* 5. FLOATING / STICKY BOTTOM BAR ACTION */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md px-4 py-3 shadow-2xl transition-colors duration-300 ${
          isDark
            ? "bg-slate-950/95 border-slate-800"
            : "bg-white/95 border-slate-200"
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Harga Pas / Nego:
            </div>
            <div
              className={`text-lg sm:text-xl font-black truncate leading-tight ${
                isDark ? colors.priceText : "text-blue-700 font-extrabold"
              }`}
            >
              {formatRupiah(product.price)}
            </div>
          </div>

          <a
            href={`https://wa.me/${cleanWa}?text=${waMessage}`}
            onClick={handleOrderClick}
            target="_blank"
            rel="noreferrer"
            className="flex-1 max-w-xs py-3 px-4 rounded-2xl text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg flex items-center justify-center gap-2 tracking-wide"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>Beli / Nego via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
