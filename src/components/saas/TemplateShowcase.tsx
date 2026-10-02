"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
} from "@/lib/constants/templates";

// ---------------------------------------------------------------------------
// Dynamic Smartphone Mockup Screen
// ---------------------------------------------------------------------------
function PhoneMockupScreen({ t }: { t: TemplateThemeConfig }) {
  const c = t.colors;
  const isDark = c.isDark;

  const demoProducts = [
    {
      name: "iPhone 15 Pro Max 256GB",
      price: "Rp 18.500.000",
      spec: "BH 94% · Like New",
      badge: "iBox Resmi",
      brand: "Apple",
    },
    {
      name: "Samsung S24 Ultra 12/512GB",
      price: "Rp 15.900.000",
      spec: "SEIN · Fullset Box",
      badge: "Garansi On",
      brand: "Samsung",
    },
    {
      name: "Xiaomi 14T Pro 12/512GB",
      price: "Rp 8.750.000",
      spec: "Leica Optic · 99% Mulus",
      badge: "Best Deal",
      brand: "Xiaomi",
    },
    {
      name: "ASUS ROG Phone 8 16/256GB",
      price: "Rp 10.800.000",
      spec: "Snapdragon 8 Gen 3",
      badge: "High FPS",
      brand: "ASUS ROG",
    },
  ];

  return (
    <div className={`w-full h-full ${c.bgMain} flex flex-col overflow-hidden text-left transition-colors duration-300 font-sans`}>
      {/* 1. Header Toko */}
      <div className={`sticky top-0 z-20 px-3.5 py-2.5 flex items-center justify-between border-b backdrop-blur-md transition-colors duration-300 ${c.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`w-6 h-6 rounded-lg ${c.accent} text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-sm`}>
            G
          </div>
          <div className="truncate">
            <div className="font-extrabold text-[11px] leading-tight truncate">GadgetBDG Bandung</div>
            <div className="text-[8px] opacity-70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online Siap COD
            </div>
          </div>
        </div>

        <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold shrink-0 border ${c.badgeVerifiedBg} ${c.badgeVerifiedText} ${c.badgeVerifiedBorder} flex items-center gap-0.5`}>
          <ShieldCheck className="w-2.5 h-2.5" />
          <span>Verified</span>
        </div>
      </div>

      {/* 2. Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* Banner Hero Dinamis */}
        <div className={`rounded-2xl p-3.5 relative overflow-hidden shadow-md border transition-all duration-300 ${c.heroGradient} ${c.heroBorder}`}>
          <div className="relative z-10 space-y-1.5">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-wider uppercase bg-black/30 text-white backdrop-blur-md border border-white/20">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{t.badge || "Katalog Spesial"}</span>
            </div>

            {/* Judul Hero */}
            <h2 className="text-xs sm:text-[13px] font-black leading-tight tracking-tight drop-shadow-sm">
              {isDark ? "Gear Flagship & HP High-Spec Murah" : "Katalog iPhone & Android Istimewa"}
            </h2>

            {/* Deskripsi */}
            <p className="text-[8.5px] leading-relaxed opacity-90 max-w-[200px]">
              Semua unit lolos 30 titik uji fungsi, IMEI permanen & garansi toko resmi.
            </p>

            {/* Tombol CTA */}
            <div className="pt-1 flex items-center gap-1.5">
              <button
                type="button"
                className={`px-2.5 py-1 rounded-lg font-bold text-[8.5px] shadow-sm flex items-center gap-1 transition ${
                  isDark ? `${c.accent} text-slate-950 font-black` : "bg-slate-900 text-white"
                }`}
              >
                <span>Lihat Stok</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>

              <button
                type="button"
                className={`px-2 py-1 rounded-lg font-semibold text-[8px] border transition ${
                  isDark
                    ? "border-white/30 bg-black/40 text-white"
                    : "border-slate-300 bg-white/90 text-slate-800"
                }`}
              >
                Tukar Tambah
              </button>
            </div>
          </div>

          {/* Decorative glow ornament */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`font-black text-[10px] tracking-tight ${c.textPrimary}`}>Unit Pilihan Hari Ini</span>
            <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold ${c.badgeVerifiedBg} ${c.badgeVerifiedText}`}>
              4 Ready
            </span>
          </div>
          <span className={`text-[8.5px] font-bold ${c.accentText}`}>Semua →</span>
        </div>

        {/* Grid Produk */}
        <div className="grid grid-cols-2 gap-2">
          {demoProducts.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-2.5 border transition-all duration-300 flex flex-col justify-between space-y-2 shadow-xs ${c.cardBg} ${c.cardBorder}`}
            >
              <div className="space-y-1.5">
                {/* Visual Phone Box Art / Placeholder */}
                <div className={`w-full aspect-[4/3] rounded-lg flex flex-col items-center justify-center relative overflow-hidden ${
                  isDark ? "bg-white/5 border border-white/5" : "bg-slate-100 border border-slate-200/60"
                }`}>
                  <ShoppingBag className={`w-6 h-6 ${isDark ? "text-white/20" : "text-slate-300"}`} />
                  <span className={`text-[7px] font-mono uppercase tracking-wider mt-1 opacity-60 ${c.textSecondary}`}>
                    {p.brand}
                  </span>
                  <span className={`absolute top-1 right-1 text-[6.5px] font-bold px-1.5 py-0.2 rounded ${c.badgeVerifiedBg} ${c.badgeVerifiedText}`}>
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h4 className={`text-[8.5px] font-bold leading-tight line-clamp-1 ${c.textPrimary}`}>
                    {p.name}
                  </h4>
                  <p className={`text-[7px] ${c.textSecondary}`}>
                    {p.spec}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-dashed border-slate-700/20">
                <div className={`text-[9.5px] font-black leading-none ${c.priceText}`}>
                  {p.price}
                </div>

                {/* Tombol Beli WA */}
                <button
                  type="button"
                  className={`w-full py-1 rounded-md text-[8px] font-bold flex items-center justify-center gap-1 transition shadow-xs text-white ${c.accent} ${c.accentHover}`}
                >
                  <MessageCircle className="w-2.5 h-2.5" />
                  <span>Order via WA</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Spacer */}
        <div className="h-2" />
      </div>

      {/* 3. Bottom Nav Bar */}
      <div className={`sticky bottom-0 z-20 border-t px-2 py-1.5 flex items-center justify-around text-[7.5px] font-bold backdrop-blur-md transition-colors duration-300 ${c.bottomNavBg} ${c.bottomNavBorder}`}>
        {[
          { label: "Beranda", active: true },
          { label: "Katalog", active: false },
          { label: "Trade-In", active: false },
          { label: "Tentang", active: false },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center gap-0.5 px-2 py-0.5 rounded cursor-pointer ${
              item.active ? c.bottomNavActive : c.bottomNavInactive
            }`}
          >
            <div className={`w-3.5 h-1 rounded-full ${item.active ? (isDark ? "bg-white" : "bg-slate-900") : "bg-transparent"}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TemplateShowcase Component
// ---------------------------------------------------------------------------
export function TemplateShowcase() {
  const [filterTier, setFilterTier] = useState<"ALL" | "STARTER" | "PRO" | "ADVANCE">("ALL");
  const [activeTemplate, setActiveTemplate] = useState<TemplateThemeConfig>(TEMPLATE_LIST[0]);

  const templatesToDisplay =
    filterTier === "ALL"
      ? TEMPLATE_LIST
      : filterTier === "STARTER"
      ? getAvailableTemplatesForTier("STARTER")
      : filterTier === "PRO"
      ? getAvailableTemplatesForTier("PRO")
      : TEMPLATE_LIST;

  // URL Demo tab baru
  const liveDemoUrl =
    activeTemplate.id === "dark-gaming" ? "/gamersgadget" : "/berkahcell";

  return (
    <section id="showcase" className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-3 border border-indigo-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Katalog 30 Template Storefront Interaktif
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pilih Desain &amp; Lihat Langsung di HP
          </h2>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed">
            Klik kartu desain di sebelah kanan. Layar smartphone di sebelah kiri akan <b className="text-slate-900">seketika bertransformasi</b> menyesuaikan palet warna, tipografi, banner hero, hingga tombol aksi tema pilihan Anda.
          </p>

          {/* Tier Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setFilterTier("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Semua Koleksi (30)
            </button>
            <button
              onClick={() => setFilterTier("STARTER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "STARTER"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Paket Starter (2)
            </button>
            <button
              onClick={() => setFilterTier("PRO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "PRO"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Paket Pro (10)
            </button>
            <button
              onClick={() => setFilterTier("ADVANCE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ADVANCE"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Paket Advance (30)
            </button>
          </div>
        </div>

        {/* 2-Column: Live Interactive Smartphone (Left) & Template Gallery (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-6xl mx-auto">

          {/* ----------------------------------------------------------------
              LEFT COLUMN — Smartphone Hardware Mockup Frame
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 flex flex-col items-center">
              {/* Smartphone Frame Outer Bezel */}
              <div className="relative border-slate-900 bg-slate-950 border-[12px] rounded-[3rem] h-[610px] w-[310px] sm:w-[330px] shadow-2xl ring-1 ring-slate-800">
                {/* Speaker & Camera Notch */}
                <div className="w-[120px] h-[18px] bg-slate-950 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-30 flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="rounded-[2.2rem] overflow-hidden w-full h-full relative">
                  <PhoneMockupScreen key={activeTemplate.id} t={activeTemplate} />
                </div>
              </div>

              {/* Status bar info di bawah HP */}
              <div className="mt-4 text-center space-y-2 w-full max-w-[310px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="text-left min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aktif di HP:</div>
                    <div className="font-black text-slate-900 truncate">{activeTemplate.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                    activeTemplate.category === "Starter"
                      ? "bg-blue-100 text-blue-800"
                      : activeTemplate.category === "Pro"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {activeTemplate.category}
                  </span>
                </div>

                <Link
                  href={liveDemoUrl}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                >
                  <span>Buka Full Storefront Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT COLUMN — 30 Template Interactive Cards Grid
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-800 text-sm">
                Koleksi Template ({templatesToDisplay.length})
              </span>
              <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                👆 Klik kartu untuk ganti tema HP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-2 pb-4">
              {templatesToDisplay.map((t) => {
                const isSelected = activeTemplate.id === t.id;
                const isDark = t.colors.isDark;

                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveTemplate(t)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "ring-2 ring-indigo-600 border-transparent shadow-xl scale-[1.01] bg-white"
                        : isDark
                        ? "border-2 border-slate-800 hover:border-indigo-400/60 bg-slate-950 text-slate-100 hover:shadow-md"
                        : "border-2 border-slate-200 hover:border-indigo-300 bg-white text-slate-900 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Card Header: Name & Tier Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-black text-sm leading-snug ${
                          isSelected ? "text-indigo-600" : isDark ? "text-white" : "text-slate-900"
                        }`}>
                          {t.name}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            t.category === "Starter"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : t.category === "Pro"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium ${
                        isSelected ? "text-slate-600" : isDark ? "text-slate-400" : "text-slate-600"
                      }`}>
                        {t.description}
                      </p>
                    </div>

                    {/* Card Footer: Palette preview & Selection button */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                      {/* Swatch Pill */}
                      <div
                        className={`h-7 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-black shadow-xs border ${t.colors.heroGradient} ${t.colors.heroBorder}`}
                      >
                        <span>{t.badge || "Preset"}</span>
                      </div>

                      {/* Status indicator */}
                      <span
                        className={`text-xs font-black flex items-center gap-1 transition ${
                          isSelected
                            ? "text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200"
                            : isDark
                            ? "text-slate-400 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>✓ Tampil di HP</span>
                          </>
                        ) : (
                          <span>Pilih Preview →</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
