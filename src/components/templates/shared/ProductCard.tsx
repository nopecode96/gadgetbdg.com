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

  const detailUrl = `/${store.slug}/product/${product.id}`;

  return (
    <div
      id={product.id}
      className={`group rounded-3xl p-3 sm:p-3.5 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative flex flex-col justify-between ${
        isDark
          ? "bg-slate-900/90 border-slate-800 shadow-md text-white"
          : "bg-white border-slate-100 shadow-sm hover:shadow-md text-slate-900"
      }`}
    >
      <div>
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

        {/* Foto Produk Bersih Terisolasi di Tengah */}
        <Link href={detailUrl} className="block">
          <div className="aspect-square w-full rounded-2xl bg-neutral-50 dark:bg-slate-950/70 p-2.5 flex items-center justify-center relative overflow-hidden border border-neutral-100 dark:border-slate-800/60 select-none">
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
        </Link>

        {/* Informasi Produk: Brand & Nama Unit Tebal Kontras */}
        <div className="mt-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {product.brand}
            </span>
            {product.batteryHealth !== null && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-600 dark:text-amber-400">
                <BatteryCharging className="w-2.5 h-2.5" />
                <span>BH {product.batteryHealth}%</span>
              </span>
            )}
          </div>

          <Link href={detailUrl} className="block">
            <h3
              className={`font-black text-xs sm:text-[13px] line-clamp-1 leading-snug group-hover:underline ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating / Kondisi (⭐ 4.9 • 98% Mulus) */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            <div className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
            <span>•</span>
            <span className="truncate">{product.condition || "98% Mulus"}</span>
          </div>

          {product.branch && (
            <div className="text-[9px] text-slate-400 font-mono truncate">
              📍 {product.branch.name}
            </div>
          )}
        </div>
      </div>

      {/* Harga Format Rupiah Tebal + Tombol Aksi Bulat (+) / WA */}
      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
            Harga Unit
          </div>
          <div
            className={`font-black text-xs sm:text-sm tracking-tight truncate ${
              isDark ? "text-emerald-400 font-mono" : "text-slate-950"
            }`}
          >
            {formatRupiah(product.price)}
          </div>
        </div>

        <a
          href={`https://wa.me/${cleanWa}?text=${waMessage}`}
          onClick={handleOrderClick}
          target="_blank"
          rel="noreferrer"
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all duration-200 active:scale-95 ${
            isDark
              ? "bg-[#00e5b3] text-slate-950 hover:bg-[#00c99d] shadow-emerald-500/20"
              : "bg-slate-950 text-white hover:bg-slate-800 shadow-slate-950/20"
          }`}
          title="Beli Unit via WhatsApp"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
        </a>
      </div>
    </div>
  );
}
