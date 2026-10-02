"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  RefreshCw,
  Star,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
} from "@/lib/constants/templates";

// ---------------------------------------------------------------------------
// Static Smartphone Mockup — renders a faithful hero+product preview using
// the selected template's color tokens. No iframe needed.
// ---------------------------------------------------------------------------
function PhoneMockup({ t }: { t: TemplateThemeConfig }) {
  const c = t.colors;
  const isDark = c.isDark;

  // Fake product cards to populate the mockup grid
  const fakeProducts = [
    { name: "iPhone 15 Pro", price: "Rp 14.500.000", badge: "BH 92%", brand: "Apple" },
    { name: "Samsung S24 Ultra", price: "Rp 12.800.000", badge: "BH 88%", brand: "Samsung" },
    { name: "Xiaomi 14T Pro", price: "Rp 8.750.000", badge: "BH 95%", brand: "Xiaomi" },
    { name: "OPPO Find X7", price: "Rp 7.200.000", badge: "BH 90%", brand: "OPPO" },
  ];

  return (
    <div className={`w-full h-full ${c.bgMain} overflow-y-auto no-scrollbar`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 px-3 py-2 flex items-center justify-between border-b text-[9px] font-bold ${c.headerBg}`}>
        <span className="truncate max-w-[110px]">GadgetBDG Store</span>
        <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${c.badgeVerifiedBg} ${c.badgeVerifiedText} border ${c.badgeVerifiedBorder}`}>
          ✓ Verified
        </div>
      </div>

      <div className="p-2 space-y-2">
        {/* Hero Banner */}
        <div className={`rounded-2xl p-3 relative overflow-hidden border ${c.heroGradient} ${c.heroBorder}`}>
          <div className="relative z-10 space-y-1">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[7px] font-bold tracking-wider uppercase ${
                isDark ? "bg-white/20" : "bg-black/70 text-white"
              }`}
            >
              <Sparkles className="w-2 h-2 text-amber-300" />
              <span>Spesialis HP Second</span>
            </div>

            {/* Heading — inherits heroGradient text color */}
            <h2 className="text-[11px] font-black leading-tight">
              {isDark ? "Gear Flagship & High-Spec" : "Katalog iPhone & Android"}
            </h2>

            <p className="text-[8px] leading-relaxed opacity-90 max-w-[160px]">
              Lolos 30 titik uji · IMEI aman · Garansi toko terpercaya
            </p>

            <div className="pt-1 flex items-center gap-1.5">
              {/* Jelajahi Stok */}
              <button
                className={`px-2.5 py-1 rounded-lg font-bold text-[8px] shadow transition flex items-center gap-1 ${
                  isDark
                    ? `${c.accent} text-slate-950`
                    : "bg-slate-900 text-white"
                }`}
              >
                <span>Jelajahi Stok</span>
                <ArrowRight className="w-2 h-2" />
              </button>
              {/* Tukar Tambah */}
              <button
                className={`px-2 py-1 rounded-lg font-semibold text-[8px] transition ${
                  isDark
                    ? "border border-white/30 bg-black/20 text-white"
                    : "border border-slate-300 bg-white text-slate-700"
                }`}
              >
                Tukar Tambah
              </button>
            </div>
          </div>
          {/* Decorative blob */}
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Section label */}
        <div className={`flex items-center justify-between text-[8px] font-bold px-0.5 ${c.textPrimary}`}>
          <span>Stok Terbaru</span>
          <span className={c.accentText}>Lihat Semua →</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {fakeProducts.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl p-2 border space-y-1 ${c.cardBg} ${c.cardBorder}`}
            >
              {/* Placeholder image area */}
              <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                <ShoppingBag className={`w-6 h-6 ${isDark ? "text-white/20" : "text-slate-300"}`} />
              </div>
              <div className={`text-[7px] font-bold leading-tight ${c.textPrimary}`}>{p.name}</div>
              <div className={`text-[8px] font-black ${c.priceText}`}>{p.price}</div>
              <div className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[6px] font-bold ${c.badgeVerifiedBg} ${c.badgeVerifiedText}`}>
                <Star className="w-1.5 h-1.5" />
                {p.badge}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom padding for nav */}
        <div className="h-8" />
      </div>

      {/* Bottom Nav */}
      <div className={`sticky bottom-0 flex items-center justify-around border-t px-2 py-1.5 text-[7px] font-semibold ${c.bottomNavBg} ${c.bottomNavBorder}`}>
        {["Beranda", "Katalog", "Tukar", "Tentang"].map((tab, i) => (
          <button
            key={tab}
            className={`flex flex-col items-center gap-0.5 px-1 ${i === 0 ? c.bottomNavActive : c.bottomNavInactive}`}
          >
            <div className={`w-3 h-3 rounded-sm ${i === 0 ? (isDark ? "bg-current" : "bg-current") : ""} opacity-60`} />
            <span>{tab}</span>
          </button>
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("minimal-clean");

  const templatesToDisplay =
    filterTier === "ALL"
      ? TEMPLATE_LIST
      : filterTier === "STARTER"
      ? getAvailableTemplatesForTier("STARTER")
      : filterTier === "PRO"
      ? getAvailableTemplatesForTier("PRO")
      : TEMPLATE_LIST;

  const activeTemplate =
    TEMPLATE_LIST.find((t) => t.id === selectedTemplateId) || TEMPLATE_LIST[0];

  // Live demo URL for "Buka Demo" link
  const liveDemoUrl =
    activeTemplate.id === "dark-gaming" ? "/gamersgadget" : "/berkahcell";

  return (
    <section id="showcase" className="py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Katalog Koleksi 30 Template Storefront
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pilihan Desain Website Toko Anda
          </h2>
          <p className="mt-3 text-slate-600 text-sm">
            Tersedia 30 varian template mobile-first (PWA) mulai dari desain minimalis bersih, tema cyberpunk dark gaming, hingga preset promo festival musiman.
          </p>

          {/* Tier Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setFilterTier("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Semua Template (30)
            </button>
            <button
              onClick={() => setFilterTier("STARTER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "STARTER"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Paket Starter (2)
            </button>
            <button
              onClick={() => setFilterTier("PRO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "PRO"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Paket Pro (10)
            </button>
            <button
              onClick={() => setFilterTier("ADVANCE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ADVANCE"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              Paket Advance (30)
            </button>
          </div>
        </div>

        {/* 2-Column Section: Static Mockup (Left) & Template Grid (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">

          {/* ----------------------------------------------------------------
              LEFT — Smartphone Hardware Frame with Static Themed Mockup
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 relative border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] sm:w-[330px] shadow-2xl">
              {/* Notch */}
              <div className="w-[120px] h-[16px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[0.8rem] z-30 flex items-center justify-center">
                <div className="w-8 h-1 bg-gray-600 rounded-full" />
              </div>

              {/* Screen — static themed mockup, no iframe */}
              <div className="rounded-[2rem] overflow-hidden w-full h-full relative">
                <PhoneMockup key={activeTemplate.id} t={activeTemplate} />
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                Pratinjau: <b>{activeTemplate.name}</b>{" "}
                <span className="font-normal text-slate-400">({activeTemplate.category})</span>
              </span>
              {/* Open live demo for the 2 actual demo stores */}
              {(activeTemplate.id === "minimal-clean" || activeTemplate.id === "dark-gaming") ? (
                <Link
                  href={liveDemoUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
                >
                  <span>Buka Demo di Tab Baru</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] text-slate-500 bg-slate-50 border border-slate-200">
                  <RefreshCw className="w-3 h-3" />
                  Pratinjau warna dinamis aktif
                </span>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT — Template Grid Gallery (Scrollable)
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700">
                Menampilkan {templatesToDisplay.length} Varian Desain
              </span>
              <span className="text-[11px] text-slate-400">Klik kartu untuk pratinjau</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1.5">
              {templatesToDisplay.map((t) => {
                const isSelected = selectedTemplateId === t.id;
                const isDark = t.colors.isDark;

                // Category badge — always use light-on-color backgrounds for readability
                const categoryBadgeCls =
                  t.category === "Starter"
                    ? "bg-blue-100 text-blue-800"
                    : t.category === "Pro"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-amber-100 text-amber-800";

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? isDark
                          ? "border-emerald-500 bg-slate-900 shadow-md ring-1 ring-emerald-500"
                          : "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                        : isDark
                        ? "border-slate-800 hover:border-slate-600 bg-slate-950"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        {/* Template name — always explicit contrast */}
                        <h4 className={`font-bold text-sm leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                          {t.name}
                        </h4>
                        {/* Category badge — always readable (light bg / dark text) */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${categoryBadgeCls}`}>
                          {t.category}
                        </span>
                      </div>

                      {/* Description — explicit text color, not inherited */}
                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {t.description}
                      </p>
                    </div>

                    {/* Color Palette Preview + action label */}
                    <div className="flex items-center justify-between pt-1">
                      {/* Hero gradient preview swatch — uses heroGradient (includes text color) */}
                      <div
                        className={`h-7 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm border ${t.colors.heroGradient} ${t.colors.heroBorder}`}
                      >
                        {/* Badge text inherits from heroGradient text-color token */}
                        <span>{t.badge || "Preset Tema"}</span>
                      </div>

                      <span
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? isDark
                              ? "text-emerald-400"
                              : "text-blue-600"
                            : isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {isSelected ? "Sedang Aktif ✓" : "Pilih Preview →"}
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
