"use client";

import React from "react";
import { Home, Smartphone, RefreshCw, Info, ShieldCheck, MessageCircle } from "lucide-react";
import { StoreData, StoreTabType } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";

interface StoreShellProps {
  store: StoreData;
  activeTab: StoreTabType;
  onTabChange: (tab: StoreTabType) => void;
  children: React.ReactNode;
  theme?: string;
}

export function StoreShell({
  store,
  activeTab,
  onTabChange,
  children,
  theme,
}: StoreShellProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  return (
    <div className={`min-h-screen flex justify-center pb-24 font-sans ${colors.bgMain} ${colors.textPrimary}`}>
      <div
        className={`w-full max-w-lg min-h-screen flex flex-col relative shadow-2xl ${colors.bgContainer} border-x ${colors.borderContainer}`}
      >
        {/* Sticky Top Header Bar */}
        <header className={`sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-md transition ${colors.headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className={`w-10 h-10 rounded-full object-cover shrink-0 border ${colors.borderContainer} shadow-sm`}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-base shadow-sm ${colors.accent} ${colors.isDark ? "text-slate-950" : "text-white"}`}
                >
                  {store.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-sm leading-tight truncate">{store.name}</h1>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${colors.badgeVerifiedBg} ${colors.badgeVerifiedText} ${colors.badgeVerifiedBorder}`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>VERIFIED</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Buka Toko • Stok Realtime</span>
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                store.name
              )},%20apakah%20bisa%20tanya%20stok%20HP?`}
              target="_blank"
              rel="noreferrer"
              className={`p-2 rounded-full transition shadow-sm shrink-0 ${
                colors.isDark
                  ? `${colors.accent} text-slate-950 ${colors.accentHover}`
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              title="Hubungi WhatsApp"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
            </a>
          </div>
        </header>

        {/* Dynamic Screen View Content */}
        <main className="flex-1 flex flex-col">{children}</main>

        {/* Fixed Bottom Navigation Bar (4 Mobile-First Tabs) */}
        <nav
          className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center border-t backdrop-blur-md ${colors.bottomNavBg} ${colors.bottomNavBorder}`}
        >
          <div className="w-full max-w-lg grid grid-cols-4 px-2 py-2 text-center select-none">
            {/* Tab 1: Home */}
            <button
              onClick={() => onTabChange("home")}
              className={`flex flex-col items-center justify-center py-1 transition rounded-xl ${
                activeTab === "home" ? colors.bottomNavActive : colors.bottomNavInactive
              }`}
            >
              <Home className={`w-5 h-5 mb-0.5 ${activeTab === "home" ? "scale-110" : ""}`} />
              <span className="text-[10px]">Home</span>
            </button>

            {/* Tab 2: Katalog List */}
            <button
              onClick={() => onTabChange("list")}
              className={`flex flex-col items-center justify-center py-1 transition rounded-xl ${
                activeTab === "list" ? colors.bottomNavActive : colors.bottomNavInactive
              }`}
            >
              <Smartphone className={`w-5 h-5 mb-0.5 ${activeTab === "list" ? "scale-110" : ""}`} />
              <span className="text-[10px]">Katalog HP</span>
            </button>

            {/* Tab 3: Trade-In */}
            <button
              onClick={() => onTabChange("trade-in")}
              className={`flex flex-col items-center justify-center py-1 transition rounded-xl relative ${
                activeTab === "trade-in" ? colors.bottomNavActive : colors.bottomNavInactive
              }`}
            >
              <RefreshCw
                className={`w-5 h-5 mb-0.5 ${
                  activeTab === "trade-in" ? "scale-110 rotate-180 transition-transform duration-500" : ""
                }`}
              />
              <span className="text-[10px]">Trade-In</span>
            </button>

            {/* Tab 4: About */}
            <button
              onClick={() => onTabChange("about")}
              className={`flex flex-col items-center justify-center py-1 transition rounded-xl ${
                activeTab === "about" ? colors.bottomNavActive : colors.bottomNavInactive
              }`}
            >
              <Info className={`w-5 h-5 mb-0.5 ${activeTab === "about" ? "scale-110" : ""}`} />
              <span className="text-[10px]">Tentang</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
