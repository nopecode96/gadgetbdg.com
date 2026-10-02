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
          className={`sticky top-0 z-40 px-4 pt-3.5 pb-3 border-b backdrop-blur-md transition space-y-2.5 ${
            isDark
              ? "bg-slate-950/95 border-slate-800 text-white"
              : "bg-white/95 border-slate-200 text-slate-950 shadow-xs"
          }`}
        >
          {/* Baris 1: Logo Toko Asli + Nama Toko + Ikon Lokasi GPS Konter Fisik + WA Hotline */}
          <div className="flex items-center justify-between gap-2.5">
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
              onClick={() => onTabChange("about")}
              title="Lihat profil dan peta lokasi toko"
            >
              {/* Store Real Logo / Initial Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shrink-0 border-2 border-indigo-500/40 shadow-sm overflow-hidden">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-black text-xs uppercase tracking-tighter">
                    {store.name.slice(0, 2)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center">
                  <h1 className="font-black text-base tracking-tight text-slate-950 dark:text-white leading-tight truncate">
                    {store.name}
                  </h1>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200 animate-pulse shrink-0 inline-block ml-1.5"
                    title="Toko Buka Siap COD"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 fill-rose-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs leading-tight">
                    {locationLabel}
                  </span>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition shrink-0"
              title="Hubungi WhatsApp Toko"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          </div>

          {/* Baris 2: Search Bar rounded-2xl dengan placeholder "Cari iPhone 15, S24 Ultra..." + Ikon Search & Filter */}
          <div
            onClick={() => {
              if (activeTab !== "list") onTabChange("list");
            }}
            className={`rounded-2xl border transition-all ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-200 focus-within:border-slate-700"
                : "bg-slate-100 border border-slate-300/80 focus-within:border-slate-800 text-slate-950 shadow-2xs"
            } px-3.5 py-2.5 flex items-center gap-2`}
          >
            <Search className={`w-4 h-4 shrink-0 ${isDark ? "text-slate-400" : "text-slate-700"}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                if (onSearchChange) onSearchChange(e.target.value);
                if (activeTab !== "list") onTabChange("list");
              }}
              placeholder="Cari iPhone 15, S24 Ultra, RAM, IMEI..."
              className={`w-full bg-transparent text-xs focus:outline-none font-semibold ${
                isDark
                  ? "text-white placeholder:text-slate-500"
                  : "text-slate-950 placeholder:text-slate-600"
              }`}
            />
            {searchQuery && onSearchChange && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSearchChange("");
                }}
                className="text-slate-500 hover:text-slate-800 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <div
              onClick={() => onTabChange("list")}
              className={`p-1 rounded-lg shrink-0 cursor-pointer transition ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:text-white"
                  : "bg-white text-slate-700 hover:text-slate-950 shadow-2xs border border-slate-200/80"
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
