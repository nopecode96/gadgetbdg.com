"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ExternalLink,
  Sparkles,
  Zap,
  Filter,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
} from "@/lib/constants/templates";

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

  // Target demo URL: jika minimal-clean -> /berkahcell, jika dark-gaming -> /gamersgadget, lainnya -> /berkahcell
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

        {/* 2-Column Section: Live Smartphone Mockup & Template Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Smartphone Hardware Frame (Left Sticky) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 relative border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] sm:w-[330px] shadow-2xl">
              {/* Notch */}
              <div className="w-[120px] h-[16px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[0.8rem] z-30 flex items-center justify-center">
                <div className="w-8 h-1 bg-gray-600 rounded-full" />
              </div>

              {/* Screen Content Iframe Container */}
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
                <iframe
                  key={activeTemplate.id}
                  src={liveDemoUrl}
                  title="Live Storefront Preview"
                  className="w-full h-full border-none no-scrollbar"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-4 text-center space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">
                Sedang dipratinjau: <b>{activeTemplate.name}</b> ({activeTemplate.category})
              </span>
              <Link
                href={liveDemoUrl}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              >
                <span>Buka Demo di Tab Baru</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Template Grid Gallery (Right Scrollable) */}
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

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? isDark
                          ? "border-emerald-500 bg-slate-900 text-white shadow-md ring-1 ring-emerald-500"
                          : "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 text-slate-900"
                        : isDark
                        ? "border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-100"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-900"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm leading-tight">{t.name}</h4>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            t.category === "Starter"
                              ? "bg-blue-100 text-blue-800"
                              : t.category === "Pro"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>

                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {t.description}
                      </p>
                    </div>

                    {/* Color Palette Preview Bar */}
                    <div className="flex items-center justify-between pt-1">
                      <div
                        className={`h-7 px-2.5 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-xs ${t.colors.heroGradient} ${t.colors.heroBorder} border`}
                      >
                        {t.badge || "Preset Tema"}
                      </div>

                      <span
                        className={`text-[11px] font-bold ${
                          isSelected
                            ? isDark
                              ? "text-emerald-400"
                              : "text-blue-600"
                            : "text-slate-400"
                        }`}
                      >
                        {isSelected ? "Sedang Aktif" : "Pilih Preview →"}
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
