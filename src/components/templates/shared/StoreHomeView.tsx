"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Flame,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { ProductCard } from "./ProductCard";

interface StoreHomeViewProps {
  store: StoreData;
  products: ProductData[];
  onNavigateTab: (tab: StoreTabType) => void;
  onSelectBrand?: (brand: string) => void;
  theme?: string;
}

export function StoreHomeView({
  store,
  products,
  onNavigateTab,
  onSelectBrand,
  theme,
}: StoreHomeViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const displayProducts = Array.isArray(products) ? products : [];

  // Best deal picks: first 2-4 products
  const bestDeals = displayProducts.slice(0, 4);

  // Quick brand chips
  const popularBrands = Array.from(new Set(displayProducts.map((p) => p.brand).filter(Boolean))).slice(0, 6);

  return (
    <div className="space-y-5 p-4 animate-fade-in text-xs">
      {/* 1. Hero Promo Banner Card */}
      <div
        className={`rounded-3xl p-5 relative overflow-hidden shadow-lg border ${colors.heroGradient} ${colors.heroBorder}`}
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Spesialis HP Second Terpercaya</span>
          </div>

          <h2 className="text-xl font-black tracking-tight leading-snug">
            {isDark ? "Gear Flagship & HP High-Spec Murah" : "Katalog iPhone & Android Istimewa"}
          </h2>

          <p className="text-xs leading-relaxed max-w-[280px] opacity-90">
            Semua unit telah lolos 30 titik uji fungsi, IMEI aman seumur hidup & garansi toko terpercaya.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab("list")}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
                isDark ? `${colors.accent} text-slate-950 ${colors.accentHover}` : "bg-white text-slate-900 hover:bg-neutral-100"
              }`}
            >
              <span>Jelajahi Stok</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("trade-in")}
              className="px-3.5 py-2 rounded-xl font-semibold text-xs transition border border-white/30 bg-black/20 hover:bg-black/30 text-white"
            >
              Tukar Tambah HP
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Quick Brand Chips */}
      {popularBrands.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${colors.textPrimary}`}>Pilih Merk HP</span>
            <button
              onClick={() => onNavigateTab("list")}
              className={`text-[11px] font-semibold ${colors.accentText}`}
            >
              Lihat Semua →
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {popularBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  if (onSelectBrand) onSelectBrand(brand);
                  onNavigateTab("list");
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold tracking-wide shrink-0 transition border ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                    : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300 shadow-sm"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Featured / Best Deals Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className={colors.textPrimary}>Rekomendasi Terbaik Minggu Ini</span>
          </div>
          <button
            onClick={() => onNavigateTab("list")}
            className={`text-[11px] font-semibold hover:underline ${colors.accentText}`}
          >
            Semua Unit ({displayProducts.length})
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

      {/* 4. Mini Banner CTA: Trade In */}
      <div
        onClick={() => onNavigateTab("trade-in")}
        className={`rounded-2xl p-4 cursor-pointer transition border flex items-center justify-between shadow-sm ${
          isDark
            ? "bg-slate-950 border-slate-800 hover:bg-slate-900"
            : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-600 text-white shadow-sm"
            }`}
          >
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className={`font-bold text-xs leading-tight ${isDark ? "text-white" : "text-emerald-950"}`}>
              Mau Ganti HP Baru? Tukar Tambah di Sini!
            </h4>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-emerald-700"}`}>
              Input tipe HP lamamu, dapatkan penawaran harga tertinggi langsung via WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
