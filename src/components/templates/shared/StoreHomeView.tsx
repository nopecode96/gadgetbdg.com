"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Flame,
  ShieldCheck,
  Zap,
  Tag,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  BatteryCharging,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { ProductCard } from "./ProductCard";
import { formatRupiah } from "@/lib/utils";

interface StoreHomeViewProps {
  store: StoreData;
  products: ProductData[];
  onNavigateTab: (tab: StoreTabType) => void;
  onSelectBrand?: (brand: string) => void;
  onSelectCategoryFilter?: (filter: { brand?: string; maxPrice?: number; category?: string }) => void;
  theme?: string;
}

export function StoreHomeView({
  store,
  products,
  onNavigateTab,
  onSelectBrand,
  onSelectCategoryFilter,
  theme,
}: StoreHomeViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const displayProducts = Array.isArray(products) ? products : [];

  // Best deal picks & flash drop highlight
  const heroHighlight = displayProducts[0];
  const bestDeals = displayProducts.slice(1, 7);

  // Visual Quick Category Icons (Pilar C)
  const visualCategories = [
    {
      id: "PHONE",
      label: "Phone",
      icon: Smartphone,
      bgColor: "bg-blue-50 dark:bg-blue-950/60",
      borderColor: "border-blue-200/80 dark:border-blue-900/60",
      iconColor: "text-blue-600 dark:text-blue-400",
      filter: { category: "phone" },
    },
    {
      id: "TABLET",
      label: "Tablet",
      icon: Tablet,
      bgColor: "bg-cyan-50 dark:bg-cyan-950/60",
      borderColor: "border-cyan-200/80 dark:border-cyan-900/60",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      filter: { category: "tablet" },
    },
    {
      id: "WATCH",
      label: "Watch",
      icon: Watch,
      bgColor: "bg-purple-50 dark:bg-purple-950/60",
      borderColor: "border-purple-200/80 dark:border-purple-900/60",
      iconColor: "text-purple-600 dark:text-purple-400",
      filter: { category: "watch" },
    },
    {
      id: "AUDIO",
      label: "Audio",
      icon: Headphones,
      bgColor: "bg-rose-50 dark:bg-rose-950/60",
      borderColor: "border-rose-200/80 dark:border-rose-900/60",
      iconColor: "text-rose-600 dark:text-rose-400",
      filter: { category: "audio" },
    },
    {
      id: "CHARGER",
      label: "Charger",
      icon: Zap,
      bgColor: "bg-amber-50 dark:bg-amber-950/60",
      borderColor: "border-amber-200/80 dark:border-amber-900/60",
      iconColor: "text-amber-600 dark:text-amber-400",
      filter: { category: "charger" },
    },
    {
      id: "TRADEIN",
      label: "Trade-In",
      icon: RefreshCw,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/60",
      borderColor: "border-emerald-200/80 dark:border-emerald-900/60",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      action: "trade-in" as const,
    },
  ];

  function handleCategoryClick(cat: (typeof visualCategories)[number]) {
    if (cat.action === "trade-in") {
      onNavigateTab("trade-in");
      return;
    }
    if (onSelectCategoryFilter && cat.filter) {
      onSelectCategoryFilter(cat.filter);
    }
    onNavigateTab("list");
  }

  return (
    <div className="space-y-6 p-4 animate-fade-in text-xs font-sans pb-10">
      {/* ── 1. HERO PROMO CARD (Pilar B: Rounded-3xl + Floating Device) ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 p-5 sm:p-6">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-2 max-w-[200px] sm:max-w-xs text-left">
            {/* Promo Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
              <span>PROMO SPESIAL GAJIAN</span>
            </div>

            {/* Main Title */}
            <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Diskon Unit Flagship Siap COD
            </h2>

            {/* Subtitle */}
            <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
              Lolos 30 titik uji kelayakan. Garansi replace 30 hari &amp; IMEI aman seumur hidup.
            </p>

            {/* CTA Button */}
            <div className="pt-1.5">
              <button
                onClick={() => onNavigateTab("list")}
                className="px-4 py-2 rounded-full font-black text-xs transition-all duration-200 flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 active:scale-95 shrink-0"
              >
                <span>Lihat Promo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Floating Physical Product Preview with Depth Shadow */}
          <div
            onClick={() => onNavigateTab("list")}
            className="relative shrink-0 cursor-pointer group select-none"
          >
            <div className="w-24 sm:w-32 aspect-square rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex flex-col items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
              {heroHighlight?.images?.[0] ? (
                <img
                  src={heroHighlight.images[0]}
                  alt={heroHighlight.name}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              ) : (
                <img
                  src="/images/items/iphone-15-pro.png"
                  alt="Flagship Phone"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              )}
              <span className="absolute -bottom-2 bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full shadow-md">
                HOT DEAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. VISUAL QUICK CATEGORY ICONS (Pilar C: Phone, Tablet, Watch, Audio, Charger) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className={`font-extrabold tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Kategori Pilihan
          </span>
          <button
            onClick={() => onNavigateTab("list")}
            className={`text-[11px] font-bold hover:underline ${colors.accentText}`}
          >
            Lihat Semua →
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
          {visualCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none min-w-[56px]"
              >
                <div
                  className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 group-active:scale-95 shadow-2xs border ${cat.bgColor} ${cat.borderColor} ${cat.iconColor}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-950 dark:group-hover:text-white transition">
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. TRUST BADGES (Jaminan Kredibilitas Toko Fisik) ── */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className={`p-3 rounded-2xl border text-center space-y-1 transition ${
            isDark
              ? "bg-slate-900/50 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs"
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-[11px] leading-tight">Garansi 30 Hari</div>
          <div className="text-[9px] text-slate-400">Ganti Unit / Servis</div>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center space-y-1 transition ${
            isDark
              ? "bg-slate-900/50 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs"
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-[11px] leading-tight">Bebas Blokir IMEI</div>
          <div className="text-[9px] text-slate-400">Jaminan Kemenperin</div>
        </div>

        <div
          className={`p-3 rounded-2xl border text-center space-y-1 transition ${
            isDark
              ? "bg-slate-900/50 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs"
          }`}
        >
          <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-[11px] leading-tight">Free Pindah Data</div>
          <div className="text-[9px] text-slate-400">Dukungan Kasir BEC</div>
        </div>
      </div>

      {/* ── 4. PRODUCT CARD GRID (Pilar D: Modern Rounded-3xl Cards) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-1.5 font-black">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className={isDark ? "text-white" : "text-slate-950"}>
              Rekomendasi Siap COD Hari Ini
            </span>
          </div>
          <button
            onClick={() => onNavigateTab("list")}
            className={`text-[11px] font-bold hover:underline ${colors.accentText}`}
          >
            Semua ({displayProducts.length}) →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(bestDeals.length > 0 ? bestDeals : displayProducts.slice(0, 4)).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              store={store}
              themeConfig={themeConfig}
            />
          ))}
        </div>
      </div>

      {/* ── 5. MINI BANNER CTA: TRADE IN ── */}
      <div
        onClick={() => onNavigateTab("trade-in")}
        className={`rounded-3xl p-4 cursor-pointer transition-all border flex items-center justify-between shadow-sm active:scale-98 ${
          isDark
            ? "bg-slate-950 border-slate-800 hover:bg-slate-900"
            : "bg-emerald-50/80 border-emerald-200/80 hover:bg-emerald-100/70"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-600 text-white shadow-sm"
            }`}
          >
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className={`font-black text-xs leading-tight ${isDark ? "text-white" : "text-emerald-950"}`}>
              Mau Ganti HP? Tukar Tambah di Sini!
            </h4>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-emerald-700"}`}>
              Ketik tipe HP lamamu, dapatkan taksiran harga tertinggi langsung via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
