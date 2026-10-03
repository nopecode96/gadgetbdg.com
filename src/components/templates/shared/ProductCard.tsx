"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Heart,
  ShieldCheck,
  BatteryCharging,
  MessageCircle,
  Plus,
  Star,
} from "lucide-react";
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
  const [isLiked, setIsLiked] = useState(false);

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

  function handleOrderClick(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      trackWhatsAppClickAction(product.id, store.id);
    } catch (err) {
      console.error(err);
    }
  }

  const isCustomDomain =
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith(`/${store.slug}`) &&
    !window.location.hostname.includes("localhost") &&
    !window.location.hostname.includes("gadgetbdg.com");

  const detailUrl = isCustomDomain ? `/product/${product.id}` : `/${store.slug}/product/${product.id}`;

  return (
    <div
      id={product.id}
      className={`group rounded-3xl p-3.5 border transition-all duration-300 hover:shadow-md relative flex flex-col justify-between ${
        isDark
          ? "bg-slate-900/90 border-slate-800 shadow-md text-white"
          : "bg-white border-slate-200/90 shadow-xs text-slate-900"
      }`}
    >
      <Link href={detailUrl} className="block cursor-pointer">
        {/* Top Header: Badge Status Legalitas IMEI + Tombol Love (Wishlist) */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-800 dark:text-emerald-400 border border-slate-700/40">
            <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
            <span className="truncate max-w-[85px]">{product.imeiStatus || "iBox Resmi"}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition shadow-2xs ${
              isLiked
                ? "bg-rose-50 text-rose-500 border border-rose-200"
                : isDark
                ? "bg-slate-800/80 text-slate-400 hover:text-rose-400"
                : "bg-slate-100/80 text-slate-400 hover:text-rose-500"
            }`}
            title="Tambah ke Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Gambar Unit HP */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-50 dark:bg-slate-950/70 p-2 flex items-center justify-center border border-neutral-100 dark:border-slate-800/60 select-none">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
              No Pic
            </div>
          )}

          {/* WATERMARK: Protection for PRO & ADVANCE tiers */}
          {showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
              <div className="transform -rotate-[15deg] opacity-35 bg-black/40 px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-[1px] shadow-lg">
                <span className="text-white font-black text-[10px] tracking-widest uppercase drop-shadow-md whitespace-nowrap">
                  {store.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Brand & Nama Unit */}
        <span className="mt-2.5 inline-block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {product.brand}
        </span>
        <h3
          className={`line-clamp-1 text-sm font-bold transition-colors ${
            isDark ? "text-white group-hover:text-emerald-400" : "text-slate-950 group-hover:text-blue-700"
          }`}
        >
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
          <span>{product.ramRom || "Fullset"}</span>
          <span>•</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {product.grade || product.condition || "98% Mulus"}
          </span>
          {product.batteryHealth && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-1 rounded">
              BH {product.batteryHealth}
            </span>
          )}
        </p>

        {product.branch && (
          <div className="mt-1 text-[9px] text-slate-400 font-mono truncate">
            📍 {product.branch.name}
          </div>
        )}
      </Link>

      {/* Baris Bawah: Harga & Tombol Beli WA Cepat */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
        <span
          className={`text-sm font-black truncate ${
            isDark ? "text-emerald-400 font-mono" : "text-slate-950"
          }`}
        >
          {formatRupiah(product.price)}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOrderClick(e);
            window.open(`https://wa.me/${cleanWa}?text=${waMessage}`, "_blank");
          }}
          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700 shrink-0"
        >
          Beli
        </button>
      </div>
    </div>
  );
}
