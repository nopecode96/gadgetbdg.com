"use client";

import React, { useState } from "react";
import {
  Home,
  Smartphone,
  RefreshCw,
  Store as StoreIcon,
  MessageCircle,
  Search,
  MapPin,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { StoreData, StoreTabType } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";

interface StoreShellProps {
  store: StoreData;
  activeTab: StoreTabType;
  onTabChange: (tab: StoreTabType) => void;
  children: React.ReactNode;
  theme?: string;
  totalProducts?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function StoreShell({
  store,
  activeTab,
  onTabChange,
  children,
  theme,
  totalProducts = 0,
  searchQuery = "",
  onSearchChange,
}: StoreShellProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  // Address label formatting (e.g. "BEC Lt. 1 Blok C-05, Bandung")
  const mainBranch = store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const locationLabel = mainBranch
    ? `${mainBranch.name}, Bandung`
    : store.address
    ? store.address.split(",").slice(0, 2).join(",")
    : "BEC Lt. 1 Blok C-05, Bandung";

  return (
    <div className={`min-h-screen flex justify-center pb-28 font-sans ${colors.bgMain} ${colors.textPrimary}`}>
      <div
        className={`w-full max-w-lg min-h-screen flex flex-col relative shadow-2xl ${colors.bgContainer} border-x ${colors.borderContainer}`}
      >
        {/* ── 1. MODERN TOP APP BAR (Pilar A) ── */}
        <header
          className={`sticky top-0 z-40 px-4 pt-3.5 pb-3 border-b backdrop-blur-xl transition space-y-2.5 ${
            isDark
              ? "bg-slate-950/95 border-slate-800 text-white"
              : "bg-white/95 border-slate-200/90 text-slate-900 shadow-xs"
          }`}
        >
          {/* Baris 1: Ikon Lokasi GPS + Teks Alamat Konter Fisik + WA Hotline */}
          <div className="flex items-center justify-between gap-2.5">
            <div
              className="flex items-center gap-1.5 min-w-0 cursor-pointer group"
              onClick={() => onTabChange("about")}
              title="Lihat peta lokasi toko"
            >
              <div className="w-7 h-7 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-900/60">
                <MapPin className="w-3.5 h-3.5 fill-rose-500 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold truncate text-slate-900 dark:text-white leading-tight">
                    {locationLabel}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate leading-tight">
                  {store.name} • Siap COD Hari Ini
                </div>
              </div>
            </div>

            {/* WA Hotline Button */}
            <a
              href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                store.name
              )},%20saya%20ingin%20tanya%20stok%20HP%20second`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition shrink-0"
              title="Hubungi WhatsApp Toko"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">Hotline</span>
            </a>
          </div>

          {/* Baris 2: Search Bar rounded-2xl dengan placeholder "Cari iPhone 15, S24 Ultra..." + Ikon Search & Filter */}
          <div
            onClick={() => {
              if (activeTab !== "list") onTabChange("list");
            }}
            className={`rounded-2xl border px-3 py-2 flex items-center gap-2 transition ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-200"
                : "bg-slate-100/90 border-slate-200 text-slate-800"
            }`}
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                if (activeTab !== "list") onTabChange("list");
              }}
              placeholder="Cari iPhone 15, S24 Ultra, RAM, IMEI..."
              className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-400 font-medium"
            />
            {searchQuery && onSearchChange && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div
              onClick={() => onTabChange("list")}
              className={`p-1 rounded-lg shrink-0 cursor-pointer ${
                isDark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-700 shadow-2xs"
              }`}
              title="Filter Spesifikasi"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </header>

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* ── 2. FLOATING DOCK BOTTOM NAV (Pilar E: 4 Tab Mengambang) ── */}
        <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none flex justify-center">
          <nav
            className={`w-full max-w-sm pointer-events-auto rounded-full backdrop-blur-2xl border shadow-2xl p-1.5 grid grid-cols-4 select-none transition-all duration-300 ${
              isDark
                ? "bg-slate-950/90 border-slate-800 shadow-black/80"
                : "bg-white/95 border-slate-200/90 shadow-slate-900/15"
            }`}
          >
            {/* Tab 1: Home */}
            <button
              onClick={() => onTabChange("home")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 ${
                activeTab === "home"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "bg-slate-950 text-white shadow-md shadow-slate-950/20 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === "home" ? "scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">Home</span>
            </button>

            {/* Tab 2: Katalog */}
            <button
              onClick={() => onTabChange("list")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 ${
                activeTab === "list"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "bg-slate-950 text-white shadow-md shadow-slate-950/20 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone className={`w-4 h-4 ${activeTab === "list" ? "scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">Katalog</span>
            </button>

            {/* Tab 3: Trade-In */}
            <button
              onClick={() => onTabChange("trade-in")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 ${
                activeTab === "trade-in"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "bg-slate-950 text-white shadow-md shadow-slate-950/20 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  activeTab === "trade-in" ? "scale-110 rotate-180 transition-transform duration-500" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">Trade-In</span>
            </button>

            {/* Tab 4: Toko */}
            <button
              onClick={() => onTabChange("about")}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 ${
                activeTab === "about"
                  ? isDark
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold"
                    : "bg-slate-950 text-white shadow-md shadow-slate-950/20 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <StoreIcon className={`w-4 h-4 ${activeTab === "about" ? "scale-110" : ""}`} />
              <span className="text-[10px] tracking-tight mt-0.5 font-bold">Toko</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
