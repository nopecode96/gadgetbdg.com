"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
  Zap,
  Activity,
  Flame,
  Crown,
  Table,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
  getTemplateConfig,
} from "@/lib/constants/templates";

// ---------------------------------------------------------------------------
// Mock Phone Products with Real Physical Device Imagery
// ---------------------------------------------------------------------------
interface MockProduct {
  name: string;
  price: string;
  spec: string;
  badge: string;
  brand: string;
  image: string;
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    name: "iPhone 15 Pro Max 256GB",
    price: "Rp 18.500.000",
    spec: "BH 94% · Like New",
    badge: "iBox Resmi",
    brand: "Apple",
    image: "/images/items/iphone-15-pro.png",
  },
  {
    name: "Samsung S24 Ultra 12/512GB",
    price: "Rp 15.900.000",
    spec: "SEIN · Fullset Box",
    badge: "Garansi On",
    brand: "Samsung",
    image: "/images/items/samsung-s24-ultra.png",
  },
  {
    name: "Xiaomi 14T Pro 12/512GB",
    price: "Rp 8.750.000",
    spec: "Leica Optic · 99% Mulus",
    badge: "Best Deal",
    brand: "Xiaomi",
    image: "/images/items/xiaomi-14t-pro.png",
  },
  {
    name: "ASUS ROG Phone 8 16/256GB",
    price: "Rp 10.800.000",
    spec: "Snapdragon 8 Gen 3",
    badge: "High FPS",
    brand: "ASUS ROG",
    image: "/images/items/rog-phone-8.png",
  },
];

// ---------------------------------------------------------------------------
// Dynamic Smartphone Mockup Screen (Adapts to Archetype Layout)
// ---------------------------------------------------------------------------
function PhoneMockupScreen({ activeTheme }: { activeTheme: TemplateThemeConfig }) {
  const c = activeTheme.colors;
  const isDark = c.isDark;
  const archetype = activeTheme.archetype;

  return (
    <div
      className={`w-full h-full ${c.bgMain} flex flex-col overflow-hidden text-left transition-colors duration-300 font-sans`}
    >
      {/* ── 1. Archetype-Specific Top Header ── */}
      {archetype === "keynote-obsidian" ? (
        <div className="pt-2 px-3 pb-1">
          <div className="bg-black/90 border border-zinc-800 rounded-full px-3 py-1 flex items-center justify-between shadow-lg">
            <span className="text-[9px] font-black text-white flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              GadgetBdg Keynote
            </span>
            <span className="text-[8px] text-zinc-400 font-mono">REVEAL 2026</span>
          </div>
        </div>
      ) : archetype === "cyber-hud" ? (
        <div className="bg-cyan-950 border-b border-cyan-800 px-3 py-1 text-[8px] text-cyan-300 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1 font-bold">
            <Activity className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> HUD_TELEMETRY: OK
          </span>
          <span className="text-[7.5px] text-cyan-400">FPS: 144</span>
        </div>
      ) : archetype === "tokyo-editorial" ? (
        <div className="bg-[#1c1a17] text-[#f4f1ea] px-3 py-1 text-[8px] font-black uppercase tracking-widest flex justify-between">
          <span>// TOKYO ISSUE 024</span>
          <span>CURATED MOBILE</span>
        </div>
      ) : archetype === "live-drop" ? (
        <div className="bg-black/90 border-b border-neutral-800 px-3 py-2 flex items-center justify-between">
          <span className="text-[9px] font-black text-white flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#fe2c55] animate-ping" /> LIVE DROPS
          </span>
          <span className="text-[8px] bg-[#fe2c55] text-white px-1.5 py-0.2 rounded font-bold">
            4 READY
          </span>
        </div>
      ) : archetype === "midnight-gold" ? (
        <div className="bg-[#080705] border-b border-amber-900/60 px-3 py-2 flex items-center justify-between font-serif">
          <span className="text-[10px] font-bold text-amber-200 flex items-center gap-1">
            <Crown className="w-2.5 h-2.5 text-amber-400" /> GadgetBdg Haute
          </span>
          <span className="text-[7px] text-amber-400/70 uppercase tracking-widest font-mono">
            VIP SALON
          </span>
        </div>
      ) : (
        /* Clean-ledger header */
        <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between">
          <div className="font-extrabold text-[10px] text-slate-900 flex items-center gap-1">
            <Table className="w-3 h-3 text-slate-800" />
            <span>LEDGER STOK TOKO</span>
          </div>
          <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
            VERIFIED
          </span>
        </div>
      )}

      {/* ── 2. Scrollable Body Content ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* Banner Hero Mini */}
        <div
          className={`rounded-2xl p-3 relative overflow-hidden shadow-sm border ${c.heroGradient} ${c.heroBorder}`}
        >
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[7px] font-bold uppercase tracking-wider bg-white/10 backdrop-blur-xs">
              <Sparkles className="w-2 h-2" />
              <span>{activeTheme.tagline}</span>
            </div>
            <h2 className="text-xs font-black leading-tight drop-shadow-sm">
              {activeTheme.name}
            </h2>
            <p className="text-[7.5px] opacity-80 line-clamp-2 leading-relaxed">
              {activeTheme.description}
            </p>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-0.5 text-[8.5px]">
          <span className={`font-black tracking-tight ${isDark ? "text-white" : "text-slate-950"}`}>
            {archetype === "clean-ledger" ? "Data Baris Unit" : "Koleksi Unit Siap COD"}
          </span>
          <span className={`font-bold ${c.accentText}`}>Lihat Semua →</span>
        </div>

        {/* ── 3. Archetype-Specific Layout Structure ── */}
        {archetype === "clean-ledger" ? (
          /* Dense horizontal row items */
          <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-xs">
            {MOCK_PRODUCTS.slice(0, 3).map((p) => (
              <div key={p.name} className="p-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[7px] font-mono text-slate-400 uppercase font-bold">{p.brand}</div>
                  <div className="text-[8.5px] font-bold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[7px] text-slate-500">{p.spec}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[8.5px] font-black font-mono text-slate-950">{p.price}</div>
                  <span className="text-[7px] bg-slate-900 text-white px-1.5 py-0.5 rounded font-bold">
                    Detail
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : archetype === "live-drop" ? (
          /* Vertical 9:16 Video Vibes Card */
          <div className="space-y-2.5">
            {MOCK_PRODUCTS.slice(0, 2).map((p, idx) => (
              <div
                key={p.name}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2.5 space-y-2 relative overflow-hidden"
              >
                <div className="w-full h-32 bg-black rounded-xl p-2 flex items-center justify-center relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  <span className="absolute top-1.5 left-1.5 bg-[#fe2c55] text-white text-[7px] font-black px-1.5 py-0.2 rounded-full">
                    DROP #{idx + 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[8.5px] font-black text-white truncate">{p.name}</div>
                    <div className="text-[7px] text-neutral-400">{p.spec}</div>
                  </div>
                  <div className="text-[9.5px] font-black text-[#fe2c55]">{p.price}</div>
                </div>
                <button className="w-full py-1 rounded-lg bg-[#fe2c55] text-white font-black text-[7.5px] uppercase">
                  Ambil via WhatsApp
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* 2-Column Cards for Keynote, Cyber-HUD, Tokyo-Editorial, Midnight-Gold */
          <div className="grid grid-cols-2 gap-2">
            {MOCK_PRODUCTS.map((p) => (
              <div
                key={p.name}
                className={`rounded-xl p-2 border transition flex flex-col justify-between space-y-1.5 ${c.bgContainer} ${c.cardBorder}`}
              >
                <div className="w-full h-20 rounded-lg flex items-center justify-center p-1 bg-black/5 dark:bg-black/40 overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  <span
                    className={`absolute top-1 right-1 text-[6.5px] font-bold px-1 py-0.2 rounded ${c.badgeVerifiedBg} ${c.badgeVerifiedText}`}
                  >
                    {p.badge}
                  </span>
                </div>

                <div>
                  <h4
                    className={`text-[8px] font-bold line-clamp-1 ${
                      isDark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {p.name}
                  </h4>
                  <p className={`text-[6.5px] ${c.textSecondary}`}>{p.spec}</p>
                </div>

                <div className="pt-1 border-t border-slate-700/10 flex items-center justify-between">
                  <span className={`text-[8.5px] font-black ${isDark ? c.priceText : "text-slate-900"}`}>
                    {p.price}
                  </span>
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded ${c.accent} text-white`}>
                    WA
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Bottom Navigation Bar ── */}
      <div
        className={`sticky bottom-0 z-20 border-t px-2 py-1.5 flex items-center justify-around text-[7.5px] font-bold backdrop-blur-md ${c.bottomNavBg} ${c.bottomNavBorder}`}
      >
        {["Home", "Katalog", "Trade-In"].map((label, idx) => (
          <div
            key={label}
            className={`flex flex-col items-center gap-0.5 ${
              idx === 0 ? c.bottomNavActive : c.bottomNavInactive
            }`}
          >
            <span>{label}</span>
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
  const [selectedId, setSelectedId] = useState<string>("clean-ledger");

  const templatesToDisplay =
    filterTier === "ALL"
      ? TEMPLATE_LIST
      : filterTier === "STARTER"
      ? getAvailableTemplatesForTier("STARTER")
      : filterTier === "PRO"
      ? getAvailableTemplatesForTier("PRO")
      : TEMPLATE_LIST;

  const activeTheme = getTemplateConfig(selectedId);

  return (
    <section
      id="showcase"
      className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-3 border border-indigo-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>6 Arketipe Desain Storefront Sinematik 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bukan Katalog Kaku. Pilih Karakter Toko Anda.
          </h2>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed">
            Setiap arketipe memiliki <b className="text-slate-900">struktur tata letak, ritme visual, dan animasi yang benar-benar berbeda</b>—dari format terminal data ringkas, panggung Apple Keynote, hingga feed vertikal Reels 9:16.
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
              Semua Arketipe (6)
            </button>
            <button
              onClick={() => setFilterTier("STARTER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "STARTER"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Starter (Clean Ledger)
            </button>
            <button
              onClick={() => setFilterTier("PRO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "PRO"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Pro (+Keynote &amp; Tokyo)
            </button>
            <button
              onClick={() => setFilterTier("ADVANCE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ADVANCE"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Advance (Semua 6 Arketipe)
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
                {/* Dynamic Island / Notch */}
                <div className="w-[120px] h-[18px] bg-slate-950 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-30 flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="rounded-[2.2rem] overflow-hidden w-full h-full relative">
                  <PhoneMockupScreen key={activeTheme.id} activeTheme={activeTheme} />
                </div>
              </div>

              {/* Status bar info di bawah HP */}
              <div className="mt-4 text-center space-y-2 w-full max-w-[310px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="text-left min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Arketipe Aktif:
                    </div>
                    <div className="font-black text-slate-900 truncate">{activeTheme.name}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      activeTheme.category === "Starter"
                        ? "bg-blue-100 text-blue-800"
                        : activeTheme.category === "Pro"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {activeTheme.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT COLUMN — 6 Archetype Interactive Cards Grid
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-800 text-sm">
                Pilihan Arketipe Layout ({templatesToDisplay.length})
              </span>
              <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                👆 Klik untuk ganti layout di layar HP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {templatesToDisplay.map((t) => {
                const isSelected = selectedId === t.id;
                const isDark = t.colors.isDark;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md scale-[1.01] bg-white text-slate-900"
                        : isDark
                        ? "border-2 border-slate-800 hover:border-indigo-400/60 bg-slate-950 text-slate-100 hover:shadow-md"
                        : "border-2 border-slate-200 hover:border-indigo-300 bg-white text-slate-900 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Card Header: Name & Tier Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`font-black text-sm leading-snug ${
                              isSelected ? "text-indigo-600" : isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {t.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">{t.tagline}</span>
                        </div>
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
                      <p
                        className={`text-xs mt-2 line-clamp-3 leading-relaxed font-medium ${
                          isSelected ? "text-slate-600" : isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        {t.description}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t.badge}
                      </span>

                      <span
                        className={`text-xs font-black flex items-center gap-1 transition ${
                          isSelected
                            ? "text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
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
