"use client";

import React from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { BatteryCharging, ShieldCheck, MessageCircle } from "lucide-react";
import { StoreData, ProductData } from "./types";
import { TemplateThemeConfig } from "@/lib/constants/templates";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ProductCardProps {
  product: ProductData;
  store: StoreData;
  themeConfig: TemplateThemeConfig;
}

export function ProductCard({ product, store, themeConfig }: ProductCardProps) {
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  // Watermark flag: aktif untuk paket PRO & ADVANCE atau jika store.hasWatermark bernilai true
  const showWatermark = Boolean(store.hasWatermark || store.tier !== "STARTER");

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://gadgetbdg.com";
  const productUrl = `${currentOrigin}/${store.slug}/product/${product.id}`;
  const waMessage = encodeURIComponent(
    `Halo ${store.name}, saya berminat dengan unit ini:\n\n` +
      `*${product.name}*\n` +
      `• Spek: ${product.ramRom}\n` +
      `• Harga: ${formatRupiah(product.price)}\n` +
      `• Kondisi: ${product.condition}\n` +
      `• Status IMEI: ${product.imeiStatus}\n` +
      (product.batteryHealth ? `• Battery Health: ${product.batteryHealth}%\n` : "") +
      (product.minusNotes ? `• Catatan: ${product.minusNotes}\n` : "") +
      `\nLink: ${productUrl}\n\nApakah unit ini masih ready kak?`
  );

  function handleOrderClick() {
    // Non-blocking telemetry tracking
    try {
      trackWhatsAppClickAction(product.id, store.id);
    } catch (e) {
      console.error(e);
    }
  }

  const detailUrl = `/${store.slug}/product/${product.id}`;

  return (
    <div
      id={product.id}
      className={`group rounded-3xl p-3 sm:p-3.5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between ${colors.cardBg} ${colors.cardBorder} ${colors.cardHoverBorder} shadow-sm`}
    >
      <div>
        {/* Thumbnail Image with Automatic Watermark Protection (Clickable to Detail) */}
        <Link href={detailUrl} className="block">
          <div className="aspect-square rounded-2xl bg-neutral-100 dark:bg-slate-900/80 overflow-hidden relative border border-neutral-200/60 dark:border-slate-800/80 mb-2.5 select-none flex items-center justify-center p-2">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                No Pic
              </div>
            )}

            {/* Condition badge */}
            <span
              className="absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md backdrop-blur-md bg-black/75 text-white border border-white/20 uppercase tracking-wider"
            >
              {product.condition.slice(0, 10)}
            </span>

            {/* WATERMARK: Diagonal Overlay Protection for PRO & ADVANCE tiers */}
            {showWatermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <div className="transform -rotate-[15deg] opacity-35 bg-black/40 px-3 py-1.5 rounded-lg border border-white/20 backdrop-blur-[1px] shadow-lg">
                  <span className="text-white font-black text-xs sm:text-sm tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                    {store.name}
                  </span>
                </div>
              </div>
            )}

            {/* Corner badge identifier */}
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[8px] font-mono px-1.5 py-0.5 rounded-md opacity-80 pointer-events-none select-none">
              @{store.slug}
            </div>
          </div>
        </Link>

        {/* Brand & Name (Clickable to Detail) */}
        <span className={`text-[10px] font-black uppercase tracking-wider ${colors.accentText}`}>
          {product.brand}
        </span>
        <Link href={detailUrl} className="block">
          <h3 className={`font-extrabold text-xs sm:text-[13px] line-clamp-2 leading-snug group-hover:underline ${isDark ? "text-white" : "text-slate-900"}`}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className={`font-black text-sm sm:text-base mt-1 tracking-tight ${isDark ? colors.priceText : "text-blue-700 font-extrabold"}`}>
          {formatRupiah(product.price)}
        </div>
        <div className={`text-[10px] ${colors.textSecondary} font-mono mt-0.5`}>
          {product.ramRom}
        </div>

        {/* Badges: BH & IMEI & Branch in Modern Rounded Pills */}
        <div className="flex flex-wrap gap-1 mt-2">
          {product.branch && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <span>📍 {product.branch.name}</span>
            </span>
          )}
          {product.batteryHealth !== null && (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <BatteryCharging className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
              <span>BH {product.batteryHealth}%</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300 border border-neutral-200/60 dark:border-slate-700/60">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span className="truncate max-w-[85px]">{product.imeiStatus}</span>
          </span>
        </div>
      </div>

      {/* Direct WA Order Floating CTA Button with Intent Tracking */}
      <a
        href={`https://wa.me/${cleanWa}?text=${waMessage}`}
        onClick={handleOrderClick}
        target="_blank"
        rel="noreferrer"
        className={`w-full mt-3 py-2 px-3 rounded-2xl text-center text-[11px] font-black flex items-center justify-center gap-1.5 shadow-md transition-all duration-200 active:scale-95 ${
          isDark
            ? `${colors.accent} ${colors.accentHover} text-slate-950 shadow-indigo-500/20`
            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
        }`}
      >
        <MessageCircle className="w-3.5 h-3.5 fill-current" />
        <span>Beli via WhatsApp</span>
      </a>
    </div>
  );
}
