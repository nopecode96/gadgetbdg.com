"use client";

import React from "react";
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
  const productUrl = `${currentOrigin}/${store.slug}#${product.id}`;
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

  return (
    <div
      id={product.id}
      className={`rounded-2xl p-3 border transition flex flex-col justify-between space-y-2.5 ${colors.cardBg} ${colors.cardBorder} ${colors.cardHoverBorder} shadow-sm`}
    >
      <div>
        {/* Thumbnail Image with Automatic Watermark Protection */}
        <div className="aspect-square rounded-xl bg-neutral-100 dark:bg-slate-900 overflow-hidden relative border border-neutral-200/50 dark:border-slate-800 mb-2 select-none">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
              No Pic
            </div>
          )}

          {/* Condition badge */}
          <span
            className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${
              isDark ? `${colors.accent} text-slate-950` : "bg-neutral-900 text-white"
            }`}
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
          <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono px-1 py-0.5 rounded opacity-80 pointer-events-none select-none">
            @{store.slug}
          </div>
        </div>

        {/* Brand & Name */}
        <span className={`text-[9px] font-bold uppercase tracking-wider ${colors.accentText}`}>
          {product.brand}
        </span>
        <h3 className={`font-bold text-xs line-clamp-1 leading-snug ${colors.textPrimary}`}>
          {product.name}
        </h3>

        {/* Price */}
        <div className={`font-black text-sm mt-0.5 ${colors.priceText}`}>
          {formatRupiah(product.price)}
        </div>
        <div className={`text-[10px] ${colors.textSecondary} font-mono`}>
          {product.ramRom}
        </div>

        {/* Badges: BH & IMEI */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {product.batteryHealth !== null && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              <BatteryCharging className="w-2.5 h-2.5 text-amber-600" />
              <span>BH {product.batteryHealth}%</span>
            </span>
          )}
          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span className="truncate max-w-[85px]">{product.imeiStatus}</span>
          </span>
        </div>
      </div>

      {/* Direct WA Order Button with Intent Tracking */}
      <a
        href={`https://wa.me/${cleanWa}?text=${waMessage}`}
        onClick={handleOrderClick}
        target="_blank"
        rel="noreferrer"
        className={`w-full py-1.5 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition ${
          isDark
            ? `${colors.accent} ${colors.accentHover} text-slate-950`
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        <MessageCircle className="w-3 h-3 fill-current" />
        <span>Beli via WhatsApp</span>
      </a>
    </div>
  );
}
