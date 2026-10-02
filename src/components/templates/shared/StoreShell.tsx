"use client";

import React, { useState } from "react";
import {
  Home,
  Smartphone,
  RefreshCw,
  Store as StoreIcon,
  ShieldCheck,
  MessageCircle,
  Search,
  MapPin,
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

  const [showSearchInput, setShowSearchInput] = useState(false);

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  // Address label formatting (e.g. "BEC Lt. 1 Blok C-05" or first segment)
  const mainBranch = store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const locationLabel = mainBranch
    ? mainBranch.name
    : store.address
    ? store.address.split(",")[0]
    : "Bandung";

  return (
    <div className={`min-h-screen flex justify-center pb-28 font-sans ${colors.bgMain} ${colors.textPrimary}`}>
      <div
        className={`w-full max-w-lg min-h-screen flex flex-col relative shadow-2xl ${colors.bgContainer} border-x ${colors.borderContainer}`}
      >
        {/* 1. STICKY TOP STORE HEADER (Pilar 1) */}
        <header
          className={`sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-xl transition ${
            isDark
              ? "bg-slate-950/90 border-slate-800 text-white"
              : "bg-white/95 border-slate-200 text-slate-900 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Store Avatar & Operational Badge */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              onClick={() => onTabChange("about")}
              title="Lihat profil & lokasi toko"
            >
              <div className="relative shrink-0">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${
                      isDark ? "bg-indigo-600 text-white" : "bg-blue-600 text-white"
                    }`}
                  >
                    {store.name.charAt(0)}
                  </div>
                )}
                {/* Live pulsing online dot */}
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm leading-tight truncate">{store.name}</h1>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${colors.badgeVerifiedBg} ${colors.badgeVerifiedText} ${colors.badgeVerifiedBorder}`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>VERIFIED</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Buka • {locationLabel}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Search Toggle + WhatsApp Hotline Pill */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setShowSearchInput(!showSearchInput);
                  if (activeTab !== "list" && !showSearchInput) {
                    onTabChange("list");
                  }
                }}
                className={`p-2 rounded-full transition ${
                  isDark
                    ? "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
                title="Cari unit HP"
              >
                {showSearchInput ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>

              <a
                href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                  store.name
                )},%20saya%20ingin%20tanya%20stok%20HP%20second`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition shrink-0"
                title="Hubungi WhatsApp Toko"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span className="hidden xs:inline">WhatsApp</span>
                {totalProducts > 0 && (
                  <span className="bg-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {totalProducts}
                  </span>
                )}
              </a>
            </div>
          </div>

          {/* Collapsible Quick Search Input in Header */}
          {showSearchInput && onSearchChange && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Ketik iPhone, Samsung, RAM, IMEI..."
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border focus:outline-none transition ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* 2. FLOATING BOTTOM DOCK NAVIGATION (Pilar 5: 4 Tab Mengambang) */}
        <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none flex justify-center">
          <nav
            className={`w-full max-w-sm pointer-events-auto rounded-full backdrop-blur-2xl border shadow-2xl p-1.5 grid grid-cols-4 select-none transition-all duration-300 ${
              isDark
                ? "bg-slate-950/85 border-slate-800/90 shadow-black/80"
                : "bg-white/90 border-slate-200/90 shadow-slate-900/15"
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
              <span className="text-[10px] tracking-tight mt-0.5">Home</span>
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
              <span className="text-[10px] tracking-tight mt-0.5">Katalog</span>
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
              <span className="text-[10px] tracking-tight mt-0.5">Trade-In</span>
            </button>

            {/* Tab 4: Profil Toko */}
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
              <span className="text-[10px] tracking-tight mt-0.5">Profil</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

