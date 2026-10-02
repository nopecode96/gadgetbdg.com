"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
} from "lucide-react";
import { StoreData } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";

interface StoreAboutViewProps {
  store: StoreData;
  theme?: string;
}

export function StoreAboutView({ store, theme }: StoreAboutViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const mapsLink =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address || `${store.name} Bandung`
    )}`;

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs">
      {/* 1. Storefront Photo / Banner */}
      <div className={`rounded-3xl overflow-hidden relative border ${colors.borderContainer} shadow-md`}>
        <div className="aspect-[16/9] w-full bg-slate-800 relative">
          <img
            src={
              store.bannerUrl ||
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"
            }
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 text-white">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${colors.accentText}`}>
              OFFLINE STORE RESMI
            </span>
            <h2 className="text-lg font-black leading-tight">{store.name}</h2>
            <p className="text-[11px] text-slate-300">Bandung Gadget Ecosystem Partner</p>
          </div>
        </div>
      </div>

      {/* 2. Operational Hours & Info Card */}
      <div
        className={`rounded-2xl p-4 border space-y-3 ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className={`flex items-center justify-between border-b pb-2.5 ${colors.cardBorder}`}>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Clock className={`w-4 h-4 ${colors.accentText}`} />
            <span>Jam Operasional Toko</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Buka Setiap Hari
          </span>
        </div>

        <div className={`space-y-1.5 text-xs ${colors.textSecondary}`}>
          <div className="flex items-center justify-between">
            <span>Senin - Sabtu:</span>
            <b className={colors.textPrimary}>10:00 - 20:30 WIB</b>
          </div>
          <div className="flex items-center justify-between">
            <span>Minggu & Hari Libur:</span>
            <b className={colors.textPrimary}>11:00 - 19:30 WIB</b>
          </div>
        </div>
      </div>

      {/* 3. Offline Address & Google Maps Navigation */}
      <div
        className={`rounded-2xl p-4 border space-y-3 ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className={`flex items-center gap-2 font-bold text-sm border-b pb-2.5 ${colors.cardBorder}`}>
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Alamat Fisik Markas Toko</span>
        </div>

        <p className={`text-xs leading-relaxed ${colors.textSecondary}`}>
          {store.address || "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung"}
        </p>

        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
              : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka Petunjuk Arah Google Maps</span>
        </a>
      </div>

      {/* 4. Customer Trust & Reviews Widget */}
      <div
        className={`rounded-2xl p-4 border space-y-3 ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Reputasi & Ulasan Pembeli</span>
          </div>
          <span className="text-[11px] font-bold text-amber-500">4.9 / 5.0</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className={`p-2.5 rounded-xl border ${colors.cardBorder} ${isDark ? "bg-slate-900/60" : "bg-neutral-50"}`}>
            <div className="flex items-center gap-1 text-amber-400 mb-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <p className={`text-[11px] italic ${colors.textSecondary}`}>
              "Beli iPhone di sini kondisi mulus 99% persis foto. IMEI iBox dicek kemenperin aktif, baterai awet. Pelayanan ramah banget di BEC!"
            </p>
            <span className="text-[10px] text-neutral-400 block mt-1">— Dimas R., Dago Bandung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
