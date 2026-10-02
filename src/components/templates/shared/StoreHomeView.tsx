"use client";

import React from "react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Flame,
  ShieldCheck,
  BatteryCharging,
  MessageCircle,
  Tag,
  CheckCircle,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "./types";
import { formatRupiah } from "@/lib/utils";

interface StoreHomeViewProps {
  store: StoreData;
  products: ProductData[];
  onNavigateTab: (tab: StoreTabType) => void;
  onSelectBrand?: (brand: string) => void;
  theme?: "minimal-clean" | "dark-gaming";
}

export function StoreHomeView({
  store,
  products,
  onNavigateTab,
  onSelectBrand,
  theme = "minimal-clean",
}: StoreHomeViewProps) {
  const isDark = theme === "dark-gaming";
  const displayProducts = Array.isArray(products) ? products : [];

  // Best deal picks: first 2-4 products
  const bestDeals = displayProducts.slice(0, 4);

  // Quick brand chips
  const popularBrands = Array.from(new Set(displayProducts.map((p) => p.brand).filter(Boolean))).slice(0, 6);

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  return (
    <div className="space-y-5 p-4 animate-fade-in">
      {/* 1. Hero Promo Banner Card */}
      <div
        className={`rounded-3xl p-5 relative overflow-hidden shadow-lg border ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-emerald-950/60 to-slate-950 border-emerald-500/30 text-white"
            : "bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 border-blue-500 text-white"
        }`}
      >
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Spesialis HP Second Bandung</span>
          </div>

          <h2 className="text-xl font-black tracking-tight leading-snug">
            {isDark ? "Gear Flagship & HP Gaming Murah" : "Katalog iPhone & Android Istimewa"}
          </h2>

          <p className={`text-xs leading-relaxed max-w-[280px] ${isDark ? "text-slate-300" : "text-blue-100"}`}>
            Semua unit telah lolos 30 titik uji fungsi, IMEI Kemenperin aman seumur hidup & garansi toko 30 hari.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigateTab("list")}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-1.5 ${
                isDark
                  ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                  : "bg-white text-blue-700 hover:bg-blue-50"
              }`}
            >
              <span>Jelajahi Stok</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab("trade-in")}
              className={`px-3.5 py-2 rounded-xl font-semibold text-xs transition border ${
                isDark
                  ? "bg-slate-900/60 border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "bg-blue-700/60 border-blue-400/60 text-white hover:bg-blue-700"
              }`}
            >
              Tukar Tambah HP
            </button>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Quick Brand Chips */}
      {popularBrands.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold ${isDark ? "text-slate-300" : "text-neutral-700"}`}>Pilih Merk HP</span>
            <button
              onClick={() => onNavigateTab("list")}
              className={`text-[11px] font-semibold ${isDark ? "text-emerald-400" : "text-blue-600"}`}
            >
              Lihat Semua →
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {popularBrands.map((brand) => (
              <button
                key={brand}
                onClick={() => {
                  if (onSelectBrand) onSelectBrand(brand);
                  onNavigateTab("list");
                }}
                className={`px-3.5 py-1.5 rounded-full font-bold tracking-wide shrink-0 transition border ${
                  isDark
                    ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:border-emerald-500"
                    : "bg-neutral-100 border-neutral-200 text-neutral-800 hover:border-blue-400"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Best Deals / Unit Pilihan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Flame className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-rose-500"}`} />
            <span>Unit Pilihan & Best Deal</span>
          </div>
          <span className={`text-[11px] font-bold ${isDark ? "text-slate-500" : "text-neutral-400"}`}>
            Stok Terbatas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bestDeals.map((product) => {
            const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://gadgetbdg.com";
            const productUrl = `${currentOrigin}/${store.slug}#${product.id}`;
            const waMessage = encodeURIComponent(
              `Halo ${store.name}, saya berminat dengan unit *${product.name}* seharga ${formatRupiah(
                product.price
              )}.\n\nDetail: ${productUrl}\nApakah masih tersedia?`
            );

            return (
              <div
                key={product.id}
                className={`rounded-2xl p-3 border transition flex flex-col justify-between space-y-2.5 ${
                  isDark
                    ? "bg-slate-950/70 border-slate-800 hover:border-emerald-500/40"
                    : "bg-white border-neutral-200 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div>
                  <div className="aspect-square rounded-xl bg-neutral-100 dark:bg-slate-900 overflow-hidden relative border border-neutral-200/50 dark:border-slate-800 mb-2">
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
                    <span
                      className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${
                        isDark ? "bg-emerald-500 text-slate-950" : "bg-blue-600 text-white"
                      }`}
                    >
                      {product.condition.slice(0, 8)}
                    </span>
                  </div>

                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-blue-600"}`}>
                    {product.brand}
                  </span>
                  <h3 className="font-bold text-xs line-clamp-1 leading-snug">{product.name}</h3>

                  <div className={`font-black text-sm mt-0.5 ${isDark ? "text-emerald-400 font-mono" : "text-blue-700"}`}>
                    {formatRupiah(product.price)}
                  </div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400 font-mono" : "text-neutral-500"}`}>
                    {product.ramRom}
                  </div>
                </div>

                <a
                  href={`https://wa.me/${cleanWa}?text=${waMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-1.5 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                    isDark
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <MessageCircle className="w-3 h-3 fill-current" />
                  <span>Chat WA</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Mini Banner CTA: Trade In */}
      <div
        onClick={() => onNavigateTab("trade-in")}
        className={`rounded-2xl p-4 cursor-pointer transition border flex items-center justify-between shadow-sm ${
          isDark
            ? "bg-slate-950 border-emerald-500/40 hover:bg-slate-900"
            : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-600 text-white shadow-sm"
            }`}
          >
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h4 className={`font-bold text-xs leading-tight ${isDark ? "text-white" : "text-emerald-950"}`}>
              Mau Ganti HP Baru? Tukar Tambah di Sini!
            </h4>
            <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-400" : "text-emerald-700"}`}>
              Kirim spek HP lamamu, dapatkan taksiran harga instan & COD Bandung.
            </p>
          </div>
        </div>

        <ArrowRight className={`w-4 h-4 shrink-0 ${isDark ? "text-emerald-400" : "text-emerald-700"}`} />
      </div>

      {/* 5. Section Stok Terbaru Link to Tab List */}
      <div className="pt-2 text-center">
        <button
          onClick={() => onNavigateTab("list")}
          className={`w-full py-3 rounded-2xl font-bold text-xs transition border flex items-center justify-center gap-2 ${
            isDark
              ? "bg-slate-800 border-slate-700 text-white hover:bg-slate-750"
              : "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800"
          }`}
        >
          <span>Buka Semua Katalog ({displayProducts.length} Unit HP)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
