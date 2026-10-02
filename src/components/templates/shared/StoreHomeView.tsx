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
  CheckCircle2,
  Smartphone,
  PhoneCall,
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
  const bestDeals = displayProducts.slice(1, 5);

  const quickCategories = [
    { id: "ALL", label: "⚡ Semua Unit", filter: {} },
    { id: "APPLE", label: "🍎 iPhone", filter: { brand: "Apple" } },
    { id: "SAMSUNG", label: "📱 Samsung", filter: { brand: "Samsung" } },
    { id: "GAMING", label: "🎮 Gaming / ROG", filter: { brand: "ASUS" } },
    { id: "BUDGET", label: "💰 < 3 Jt", filter: { maxPrice: 3000000 } },
    { id: "TRADEIN", label: "🔄 Tukar Tambah", action: "trade-in" as const },
  ];

  function handleCategoryClick(cat: (typeof quickCategories)[number]) {
    if (cat.action === "trade-in") {
      onNavigateTab("trade-in");
      return;
    }
    if (cat.filter.brand && onSelectBrand) {
      onSelectBrand(cat.filter.brand);
    }
    if (onSelectCategoryFilter) {
      onSelectCategoryFilter(cat.filter);
    }
    onNavigateTab("list");
  }

  return (
    <div className="space-y-6 p-4 animate-fade-in text-xs">
      {/* 1. GUARANTEED HIGH-CONTRAST HERO BANNER (Pilar 2) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 p-5 sm:p-6">
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2.5 max-w-xs text-left">
            {/* Promo Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
              <span>SPESIALIS HP SECOND BERGARANSI</span>
            </div>

            {/* Main Title */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
              Katalog Flagship &amp; Android Istimewa
            </h2>

            {/* Subtitle */}
            <p className="text-xs leading-relaxed text-slate-300 font-medium">
              Stok siap COD di markas toko &amp; kirim se-Indonesia. Lolos 30 titik uji kelayakan, IMEI aman seumur hidup.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigateTab("list")}
                className="px-4 py-2.5 rounded-full font-black text-xs transition-all duration-200 flex items-center gap-2 bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 active:scale-95 shrink-0"
              >
                <span>Jelajahi Stok</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab("trade-in")}
                className="px-3.5 py-2.5 rounded-full font-bold text-xs transition border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs active:scale-95 shrink-0"
              >
                Tukar Tambah
              </button>
            </div>
          </div>

          {/* Floating Phone Artwork Preview with Depth Shadow */}
          {heroHighlight && (
            <div
              onClick={() => onNavigateTab("list")}
              className="relative shrink-0 cursor-pointer group select-none hidden xs:block"
            >
              <div className="w-28 sm:w-36 aspect-square rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex flex-col items-center justify-center relative shadow-2xl transition duration-300 group-hover:scale-105">
                {heroHighlight.images?.[0] ? (
                  <img
                    src={heroHighlight.images[0]}
                    alt={heroHighlight.name}
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                ) : (
                  <Smartphone className="w-12 h-12 text-slate-400" />
                )}
                <span className="absolute -bottom-2 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full shadow-md">
                  HOT PICK
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. QUICK CATEGORY HORIZONTAL PILLS (Pilar 3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <span className={`font-bold tracking-tight ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            Kategori Cepat
          </span>
          <button
            onClick={() => onNavigateTab("list")}
            className={`text-[11px] font-semibold hover:underline ${colors.accentText}`}
          >
            Lihat Semua →
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          {quickCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-2 rounded-2xl font-bold tracking-tight shrink-0 transition-all duration-200 border flex items-center gap-1.5 shadow-xs active:scale-95 ${
                isDark
                  ? "bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. TRUST BADGES (Jaminan Kredibilitas Toko Fisik) */}
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

      {/* 4. FLASH DROP / BEST DEAL SHOWCASE */}
      {heroHighlight && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-1.5 font-black">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
              <span className={isDark ? "text-white" : "text-slate-950"}>
                Flash Drop Hari Ini
              </span>
            </div>
            <span className="text-[10px] font-mono text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
              SIAP COD
            </span>
          </div>

          <div
            className={`rounded-3xl p-4 border transition-all shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center gap-4 ${
              isDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white border-slate-200/90 hover:border-slate-300"
            }`}
          >
            <div className="w-full sm:w-32 h-32 rounded-2xl bg-neutral-100 dark:bg-slate-950 shrink-0 p-2 flex items-center justify-center overflow-hidden relative">
              {heroHighlight.images?.[0] ? (
                <img
                  src={heroHighlight.images[0]}
                  alt={heroHighlight.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Smartphone className="w-10 h-10 text-slate-400" />
              )}
              <span className="absolute top-1.5 left-1.5 bg-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow">
                FLASH DEAL
              </span>
            </div>

            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                  {heroHighlight.brand}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ● Lolos Uji Fungsi
                </span>
              </div>
              <h3 className={`font-black text-sm sm:text-base leading-snug truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                {heroHighlight.name}
              </h3>
              <p className="text-xs text-slate-500">
                {heroHighlight.ramRom} • {heroHighlight.condition} • {heroHighlight.imeiStatus}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="font-black text-base sm:text-lg text-blue-600 dark:text-blue-400">
                  {formatRupiah(heroHighlight.price)}
                </div>
                <button
                  onClick={() => onNavigateTab("list")}
                  className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 transition"
                >
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. RECOMMENDATIONS GRID */}
      {bestDeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span className={isDark ? "text-slate-200" : "text-slate-800"}>
                Rekomendasi Unit Pilihan
              </span>
            </div>
            <button
              onClick={() => onNavigateTab("list")}
              className={`text-[11px] font-semibold hover:underline ${colors.accentText}`}
            >
              Semua ({displayProducts.length})
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {bestDeals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                themeConfig={themeConfig}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. MINI BANNER CTA: TRADE IN */}
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

