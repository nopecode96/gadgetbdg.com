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
  isMockup?: boolean;
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
  isMockup = false,
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

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      className={`${
        isMockup ? "w-full min-h-full h-full pb-20" : "min-h-screen pb-28"
      } flex justify-center font-sans ${colors.bgMain} ${colors.textPrimary}`}
    >
      <div
        className={`w-full ${
          isMockup ? "max-w-full min-h-full" : "max-w-lg min-h-screen shadow-2xl border-x"
        } flex flex-col relative ${colors.bgContainer} ${colors.borderContainer}`}
      >
        {/* ── 1. MODERN TOP APP BAR (Single-Row Modern Brand Header) ── */}
        <header
          className={`sticky top-0 z-40 px-4 py-2.5 border-b backdrop-blur-md transition shadow-2xs ${
            isDark
              ? "bg-slate-950/95 border-slate-800 text-white"
              : "bg-white/95 border-slate-200/90 text-slate-950"
          }`}
        >
          {/* Single Row: Avatar + Store Name + Live Dot | Search Toggle + WhatsApp */}
          <div className="flex items-center justify-between gap-3 h-10">
            {/* Left: Avatar/Logo + Store Name + Live Status */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"
              onClick={() => onTabChange("home")}
              title="Ke Halaman Utama"
            >
              {/* Store Real Logo / Initial Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-xs overflow-hidden ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white"
                    : "bg-slate-950 border-slate-850 text-white"
                }`}
              >
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

              <div className="flex items-center min-w-0 gap-1.5">
                <h1
                  className={`font-black text-sm sm:text-base tracking-tight leading-none truncate ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  {store.name}
                </h1>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 animate-pulse shrink-0 inline-block"
                  title="Toko Buka Siap COD"
                />
              </div>
            </div>

            {/* Right: Quick Action Buttons (Search Toggle & WhatsApp Hotline) */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isSearchOpen || searchQuery
                    ? isDark
                      ? "bg-white text-slate-950 shadow-xs"
                      : "bg-slate-900 text-white shadow-xs"
                    : isDark
                    ? "bg-slate-850 hover:bg-slate-800 text-slate-200"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
                title={isSearchOpen ? "Tutup Pencarian" : "Cari Produk"}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Direct WhatsApp Hotline */}
              <a
                href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                  store.name
                )},%20saya%20ingin%20tanya%20stok%20HP%20second`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition"
                title="Chat WhatsApp Toko"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Expandable Search Input Bar */}
          {isSearchOpen && (
            <div className="pt-2.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div
                className={`rounded-2xl border px-3.5 py-2 flex items-center gap-2 transition ${
                  isDark
                    ? "bg-slate-900 border-slate-800 text-slate-200 focus-within:border-slate-700"
                    : "bg-slate-100 border-slate-300/80 text-slate-950 focus-within:border-slate-900 focus-within:bg-white shadow-2xs"
                }`}
              >
                <Search
                  className={`w-4 h-4 shrink-0 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => {
                    if (onSearchChange) onSearchChange(e.target.value);
                    if (activeTab !== "list" && activeTab !== "home") {
                      onTabChange("list");
                    }
                  }}
                  placeholder="Cari iPhone, Samsung, RAM, IMEI..."
                  className={`w-full bg-transparent text-xs focus:outline-none font-semibold ${
                    isDark
                      ? "text-white placeholder:text-slate-500"
                      : "text-slate-950 placeholder:text-slate-500"
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSearchChange) onSearchChange("");
                    }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    }`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* ── 2. FLOATING DOCK BOTTOM NAV (Pilar E: 4 Tab Mengambang) ── */}
        <div
          className={`${
            isMockup
              ? "absolute bottom-3 left-3 right-3"
              : "fixed bottom-4 left-4 right-4 max-w-md mx-auto"
          } z-30 pointer-events-none flex justify-center`}
        >
          <nav
            className={`w-full max-w-sm rounded-full px-4 py-2 flex items-center justify-between border backdrop-blur-xl transition-all duration-300 pointer-events-auto ${
              isDark
                ? "bg-slate-900/95 border-slate-800 text-white shadow-2xl"
                : "bg-white/95 border-slate-200 text-slate-900 shadow-xl"
            }`}
          >
            {/* Tab 1: Home */}
            <button
              type="button"
              onClick={() => onTabChange("home")}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "home"
                  ? isDark
                    ? "text-[#00e5b3] font-bold"
                    : "text-blue-600 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white font-medium"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === "home" ? "scale-110" : ""}`} />
              <span className="text-[9px] tracking-tight leading-none font-bold">
                Home
              </span>
            </button>

            {/* Tab 2: Katalog */}
            <button
              type="button"
              onClick={() => onTabChange("list")}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "list"
                  ? isDark
                    ? "text-[#00e5b3] font-bold"
                    : "text-blue-600 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white font-medium"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <Smartphone className={`w-4 h-4 ${activeTab === "list" ? "scale-110" : ""}`} />
              <span className="text-[9px] tracking-tight leading-none font-bold">
                Katalog
              </span>
            </button>

            {/* Tab 3: Trade-In */}
            <button
              type="button"
              onClick={() => onTabChange("trade-in")}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "trade-in"
                  ? isDark
                    ? "text-[#00e5b3] font-bold"
                    : "text-blue-600 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white font-medium"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  activeTab === "trade-in" ? "scale-110 rotate-180 transition-transform duration-500" : ""
                }`}
              />
              <span className="text-[9px] tracking-tight leading-none font-bold">
                Trade-In
              </span>
            </button>

            {/* Tab 4: Toko */}
            <button
              type="button"
              onClick={() => onTabChange("about")}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                activeTab === "about"
                  ? isDark
                    ? "text-[#00e5b3] font-bold"
                    : "text-blue-600 font-bold"
                  : isDark
                  ? "text-slate-400 hover:text-white font-medium"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              }`}
            >
              <StoreIcon className={`w-4 h-4 ${activeTab === "about" ? "scale-110" : ""}`} />
              <span className="text-[9px] tracking-tight leading-none font-bold">
                Toko
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
