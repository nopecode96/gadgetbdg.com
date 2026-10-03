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

  // Smart Preset Filters (Opsi 1): ALL | IPHONE | ANDROID | GAMING | BUDGET | LIKENEW
  const [activeFilter, setActiveFilter] = React.useState<
    "ALL" | "IPHONE" | "ANDROID" | "GAMING" | "BUDGET" | "LIKENEW"
  >("ALL");

  const smartFilteredProducts = React.useMemo(() => {
    return displayProducts.filter((p) => {
      if (activeFilter === "ALL") return true;
      const brandLower = (p.brand || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();

      if (activeFilter === "IPHONE") {
        return brandLower === "apple" || nameLower.includes("iphone");
      }
      if (activeFilter === "ANDROID") {
        return brandLower !== "apple" && !nameLower.includes("iphone");
      }
      if (activeFilter === "GAMING") {
        return (
          brandLower.includes("rog") ||
          brandLower.includes("iqoo") ||
          brandLower.includes("poco") ||
          nameLower.includes("rog") ||
          nameLower.includes("iqoo") ||
          nameLower.includes("poco") ||
          nameLower.includes("gaming")
        );
      }
      if (activeFilter === "BUDGET") {
        return Number(p.price || 0) <= 3000000;
      }
      if (activeFilter === "LIKENEW") {
        const cond = (p.condition || "").toUpperCase();
        return (
          cond === "LIKE_NEW" ||
          cond.includes("MULUS") ||
          cond.includes("99%") ||
          cond.includes("98%") ||
          cond.includes("LIKE NEW")
        );
      }
      return true;
    });
  }, [displayProducts, activeFilter]);

  const smartPills = [
    { id: "ALL" as const, label: "Semua Unit", icon: "📱", desc: "Semua Stok" },
    { id: "IPHONE" as const, label: "iPhone", icon: "🍎", desc: "Apple iBox" },
    { id: "ANDROID" as const, label: "Android", icon: "🤖", desc: "Samsung & More" },
    { id: "GAMING" as const, label: "Gaming / FPS", icon: "🎮", desc: "ROG • iQOO • POCO" },
    { id: "BUDGET" as const, label: "Budget < 3 Jt", icon: "🏷️", desc: "Hemat Berkualitas" },
    { id: "LIKENEW" as const, label: "Mulus 99%", icon: "✨", desc: "Grade A+ Like New" },
  ];

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

      {/* ── 2. SMART PRESET FILTERS (Filter Cepat Katalog Real-Time) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-1.5 font-black">
            <span className="text-sm">🎯</span>
            <span className={isDark ? "text-slate-100" : "text-slate-900"}>
              Smart Filter Koleksi
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            {smartFilteredProducts.length} Unit Sesuai
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {smartPills.map((pill) => {
            const isSelected = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => {
                  setActiveFilter(pill.id);
                  const categoryName =
                    pill.id === "IPHONE"
                      ? "iPhone"
                      : pill.id === "ANDROID"
                      ? "Android"
                      : pill.id === "GAMING"
                      ? "Gaming / Flagship"
                      : pill.id === "BUDGET"
                      ? "Budget < 3 Jt"
                      : pill.id === "LIKENEW"
                      ? "Mulus 99%"
                      : "Semua Unit";

                  if (onSelectCategoryFilter) {
                    onSelectCategoryFilter({ category: categoryName });
                  } else if (onSelectBrand) {
                    if (pill.id === "IPHONE") onSelectBrand("Apple");
                    else if (pill.id === "ALL") onSelectBrand("ALL");
                  }
                  onNavigateTab("list");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 transition-all duration-200 select-none ${
                  isSelected
                    ? isDark
                      ? "bg-[#00e5b3] text-slate-950 font-black border-2 border-[#00e5b3] shadow-md shadow-emerald-500/20 scale-105"
                      : "bg-slate-950 text-white font-black border-2 border-slate-950 shadow-md scale-105"
                    : isDark
                    ? "bg-slate-900/90 text-slate-300 border-2 border-slate-800 hover:border-slate-700"
                    : "bg-white text-slate-700 border-2 border-slate-200/90 hover:border-slate-300 shadow-2xs"
                }`}
              >
                <span className="text-sm">{pill.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-black leading-tight whitespace-nowrap">
                    {pill.label}
                  </div>
                </div>
              </button>
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

      {/* ── 3.5. UNIT PILIHAN MINGGU INI (Horizontal Snap Slider dengan Foto Luas & Badge BH) ── */}
      {displayProducts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs px-0.5">
            <div className="flex items-center gap-1.5 font-black">
              <span className="text-amber-500">⚡</span>
              <span className={isDark ? "text-white" : "text-slate-950"}>
                Unit Pilihan Minggu Ini
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">
              Geser ke samping →
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1">
            {displayProducts.slice(0, 5).map((item) => {
              let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
              if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
              const waHref = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                store.name
              )},%20saya%20tertarik%20dengan%20unit%20pilihan%20*${encodeURIComponent(
                item.name
              )}*%20(${encodeURIComponent(formatRupiah(item.price))}).%20Bisa%20cek%20kondisinya?`;

              return (
                <div
                  key={`spotlight-${item.id}`}
                  className="w-[240px] sm:w-[260px] shrink-0 snap-start bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group"
                >
                  <a href={`/${store.slug}/product/${item.id}`} className="block">
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/60 flex items-center justify-center">
                      <img
                        src={item.images?.[0] || "/images/items/iphone-15-pro.png"}
                        alt={item.name}
                        className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white font-black text-[9px] uppercase tracking-wider backdrop-blur-xs">
                          {item.brand}
                        </span>
                        {item.batteryHealth !== null && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-sm">
                            <BatteryCharging className="w-2.5 h-2.5" />
                            <span>BH {item.batteryHealth}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </a>

                  <div className="mt-2.5">
                    <a href={`/${store.slug}/product/${item.id}`} className="block">
                      <h4 className="font-bold text-sm text-slate-950 dark:text-white line-clamp-1 hover:underline">
                        {item.name}
                      </h4>
                    </a>
                    <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-3 mt-0.5">
                      {item.ramRom || "Fullset"} • {item.condition || "98% Mulus"}
                    </div>
                  </div>

                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Harga Spesial
                      </span>
                      <div className="text-sm font-black text-blue-700 dark:text-blue-400">
                        {formatRupiah(item.price)}
                      </div>
                    </div>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                    >
                      Beli Unit
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. PRODUCT CARD GRID (Pilar D: Modern Rounded-3xl Cards) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-1.5 font-black">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className={isDark ? "text-white" : "text-slate-950"}>
              {activeFilter === "ALL"
                ? "Rekomendasi Siap COD Hari Ini"
                : `Hasil Filter: ${smartPills.find((p) => p.id === activeFilter)?.label}`}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab("list")}
            className={`text-[11px] font-bold hover:underline ${colors.accentText}`}
          >
            Semua ({displayProducts.length}) →
          </button>
        </div>

        {smartFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {smartFilteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                store={store}
                themeConfig={themeConfig}
              />
            ))}
          </div>
        ) : (
          <div className={`p-8 text-center rounded-3xl border ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            <p className="font-bold text-xs">Belum ada unit yang cocok dengan filter ini.</p>
            <button
              onClick={() => setActiveFilter("ALL")}
              className="mt-2 text-xs font-black text-indigo-600 hover:underline"
            >
              Reset ke Semua Unit
            </button>
          </div>
        )}
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
