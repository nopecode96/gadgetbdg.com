"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Home,
  Smartphone,
  RefreshCw,
  Store,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
  getTemplateConfig,
} from "@/lib/constants/templates";
import { MinimalCleanLayout } from "@/components/templates/minimal-clean/MinimalCleanLayout";
import { DarkGamingLayout } from "@/components/templates/dark-gaming/DarkGamingLayout";
import { KeynoteObsidianLayout } from "@/components/templates/keynote-obsidian/KeynoteObsidianLayout";
import { TokyoStreetLayout } from "@/components/templates/tokyo-street/TokyoStreetLayout";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { StoreData, ProductData } from "@/components/templates/shared/types";

// ---------------------------------------------------------------------------
// Real Product Data for Live Storefront Mockup (Single Source of Truth)
// ---------------------------------------------------------------------------
const MOCK_PRODUCTS: ProductData[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    brand: "Apple",
    price: 18500000,
    ramRom: "8GB / 256GB",
    batteryHealth: 94,
    imeiStatus: "Resmi iBox Kemenperin",
    completeness: "Fullset Original Box & Cable",
    condition: "LIKE_NEW",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/iphone-15-pro.png"],
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
    brand: "Samsung",
    price: 15900000,
    ramRom: "12GB / 512GB",
    batteryHealth: null,
    imeiStatus: "Resmi SEIN Indonesia",
    completeness: "Fullset Original",
    condition: "98% Mulus",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/samsung-s24-ultra.png"],
  },
  {
    id: "prod-3",
    name: "Xiaomi 14T Pro 12/512GB Leica Camera",
    brand: "Xiaomi",
    price: 8750000,
    ramRom: "12GB / 512GB",
    batteryHealth: null,
    imeiStatus: "Resmi Kemenperin",
    completeness: "Fullset Box & Fast Charger 120W",
    condition: "99% Mulus",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/xiaomi-14t-pro.png"],
  },
  {
    id: "prod-4",
    name: "ASUS ROG Phone 8 Pro 16/256GB Phantom Black",
    brand: "ASUS ROG",
    price: 10800000,
    ramRom: "16GB / 256GB",
    batteryHealth: null,
    imeiStatus: "Resmi Indonesia",
    completeness: "Fullset Box & AeroActive Cooler",
    condition: "LIKE_NEW",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/rog-phone-8.png"],
  },
];

// Helper generator mockStore taking activeTemplate
function createMockStore(activeTemplate: TemplateThemeConfig): StoreData {
  const isGaming = activeTemplate.id === "dark-gaming";
  const isKeynote = activeTemplate.id === "keynote-obsidian";
  const isTokyo = activeTemplate.id === "tokyo-editorial" || activeTemplate.id === "tokyo-street";
  return {
    id: "mock-preview-store",
    name: isGaming
      ? "Gamers Gadget Bandung"
      : isKeynote
      ? "Obsidian Premier"
      : isTokyo
      ? "Tokyo Street Cell"
      : "Berkah Cell Gadget",
    slug: isGaming
      ? "gamersgadget"
      : isKeynote
      ? "obsidianpremier"
      : isTokyo
      ? "tokyostreet"
      : "berkahcell",
    address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-05",
    whatsapp: "628123456789",
    templateId: activeTemplate.id,
    tier: "ADVANCE",
    hasWatermark: true,
    logoUrl: null,
    bannerUrl: null,
    primaryColor: activeTemplate.colors.accent,
    mapsUrl: null,
  };
}

// ---------------------------------------------------------------------------
// Dynamic Switcher for Smartphone Mockup Screen (Single Source of Truth)
// ---------------------------------------------------------------------------
function PhoneMockupScreen({ activeTheme }: { activeTheme: TemplateThemeConfig }) {
  const currentMockStore = createMockStore(activeTheme);


  // If minimal-clean, render the dedicated MinimalCleanLayout (dock is rendered at the phone frame level)
  if (activeTheme.id === "minimal-clean") {
    return (
      <MinimalCleanLayout
        store={currentMockStore}
        products={MOCK_PRODUCTS}
        isMockup={true}
        hideDock={true}
      />
    );
  }

  // If dark-gaming, render the dedicated DarkGamingLayout (dock rendered at phone frame level)
  if (activeTheme.id === "dark-gaming") {
    return (
      <DarkGamingLayout
        store={currentMockStore}
        products={MOCK_PRODUCTS}
        isMockup={true}
        hideDock={true}
      />
    );
  }

  // If keynote-obsidian, render the dedicated KeynoteObsidianLayout (dock at phone frame level)
  if (activeTheme.id === "keynote-obsidian") {
    return (
      <KeynoteObsidianLayout
        store={currentMockStore}
        products={MOCK_PRODUCTS}
        isMockup={true}
        hideDock={true}
      />
    );
  }

  // If tokyo-editorial or tokyo-street, render the dedicated TokyoStreetLayout
  if (activeTheme.id === "tokyo-editorial" || activeTheme.id === "tokyo-street") {
    return (
      <TokyoStreetLayout
        store={currentMockStore}
        products={MOCK_PRODUCTS}
        isMockup={true}
        hideDock={true}
      />
    );
  }

  // Other archetypes (Cyber, Midnight) rendered directly
  return (
    <div className="h-full overflow-y-auto no-scrollbar pointer-events-auto text-left select-none">
      <TemplateRenderer store={currentMockStore} products={MOCK_PRODUCTS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TemplateShowcase Component
// ---------------------------------------------------------------------------
export function TemplateShowcase() {
  const [filterTier, setFilterTier] = useState<"ALL" | "STARTER" | "PRO" | "ADVANCE">("ALL");
  const [selectedId, setSelectedId] = useState<string>("minimal-clean");

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
            Setiap arketipe memiliki <b className="text-slate-900">struktur tata letak, ritme visual, dan animasi yang benar-benar berbeda</b>—dari format mobile e-commerce terang Oraimo, dark gaming Spectra, panggung Apple Keynote, hingga Tokyo streetwear pop.
          </p>

          {/* Tier Filter Tabs (Memuat 6 Arketipe Lengkap) */}
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
              Starter (2 Arketipe)
            </button>
            <button
              onClick={() => setFilterTier("PRO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "PRO"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Pro (4 Arketipe)
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
              <div className="relative w-full max-w-[350px] sm:max-w-[370px] mx-auto h-[730px] rounded-[48px] border-[10px] border-slate-900 bg-slate-50 dark:bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
                {/* Notch / Speaker Bar Speaker HP */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-40 pointer-events-none flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Screen Content Scrollable Area */}
                <div className="w-full h-full overflow-y-auto no-scrollbar pb-24 pt-2">
                  <PhoneMockupScreen key={activeTheme.id} activeTheme={activeTheme} />
                </div>

                {/* Floating Bottom Nav Dock Terkunci Permanen di Bawah */}
                <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
                  <div className="rounded-full backdrop-blur-xl bg-white/95 border border-slate-200/90 shadow-2xl px-4 py-2 flex items-center justify-between text-slate-800">
                    <div className="flex flex-col items-center gap-0.5 text-slate-950 font-black">
                      <Home className="w-4 h-4" />
                      <span className="text-[9px]">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-500 font-medium">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-[9px]">Katalog</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-500 font-medium">
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-[9px]">Trade-In</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-slate-500 font-medium">
                      <Store className="w-4 h-4" />
                      <span className="text-[9px]">Toko</span>
                    </div>
                  </div>
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
                          <span className="text-[10px] text-slate-400 font-medium">
                            {t.tagline}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
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
                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {t.description}
                      </p>
                    </div>

                    {/* Footer: Archetype Pill & Selection Indicator */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span>Layout:</span>
                        <b className={isSelected ? "text-indigo-600" : isDark ? "text-slate-200" : "text-slate-700"}>
                          {t.archetype}
                        </b>
                      </span>

                      {isSelected ? (
                        <span className="font-black text-[11px] text-indigo-600 flex items-center gap-1">
                          Aktif di HP ✓
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                          Pilih →
                        </span>
                      )}
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
