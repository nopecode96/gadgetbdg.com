"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  Zap,
  Activity,
  Flame,
  Crown,
  Home,
  Smartphone,
  Tablet,
  Watch,
  Headphones,
  RefreshCw,
  Store as StoreIcon,
  Search,
  SlidersHorizontal,
  MapPin,
  Heart,
  Plus,
  Star,
  ExternalLink,
  ChevronRight,
  Radio,
  Eye,
} from "lucide-react";
import {
  TEMPLATE_LIST,
  TemplateThemeConfig,
  getAvailableTemplatesForTier,
  getTemplateConfig,
} from "@/lib/constants/templates";
import { StoreShell } from "@/components/templates/shared/StoreShell";
import { StoreHomeView } from "@/components/templates/shared/StoreHomeView";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { StoreData, ProductData, StoreTabType } from "@/components/templates/shared/types";

// ---------------------------------------------------------------------------
// Mock Phone Products with Real Physical Device Imagery
// ---------------------------------------------------------------------------
interface MockProduct {
  name: string;
  price: string;
  oldPrice?: string;
  spec: string;
  badge: string;
  brand: string;
  image: string;
  rating: string;
}

const MOCK_PRODUCTS: MockProduct[] = [
  {
    name: "iPhone 15 Pro Max 256GB",
    price: "Rp 18.500.000",
    oldPrice: "Rp 20.900.000",
    spec: "BH 94% • Like New",
    badge: "iBox Resmi",
    brand: "Apple",
    image: "/images/items/iphone-15-pro.png",
    rating: "4.9",
  },
  {
    name: "Samsung S24 Ultra 12/512GB",
    price: "Rp 15.900.000",
    oldPrice: "Rp 17.500.000",
    spec: "SEIN • Fullset Box",
    badge: "Garansi On",
    brand: "Samsung",
    image: "/images/items/samsung-s24-ultra.png",
    rating: "4.8",
  },
  {
    name: "Xiaomi 14T Pro 12/512GB",
    price: "Rp 8.750.000",
    oldPrice: "Rp 9.900.000",
    spec: "Leica Optic • 99% Mulus",
    badge: "Best Deal",
    brand: "Xiaomi",
    image: "/images/items/xiaomi-14t-pro.png",
    rating: "4.7",
  },
  {
    name: "ASUS ROG Phone 8 16/256GB",
    price: "Rp 10.800.000",
    oldPrice: "Rp 12.000.000",
    spec: "Snapdragon 8 Gen 3",
    badge: "165Hz FPS",
    brand: "ASUS ROG",
    image: "/images/items/rog-phone-8.png",
    rating: "4.9",
  },
];

// ---------------------------------------------------------------------------
// 6 DISTINCT ARCHETYPE PHONE SCREEN RENDERERS
// ---------------------------------------------------------------------------

/** 1. MINIMAL CLEAN (Starter - Oraimo / Clean Light E-Commerce, Image 1) */
function MinimalCleanScreen() {
  return (
    <div className="w-full h-full bg-slate-50 text-slate-900 flex flex-col overflow-hidden text-left font-sans">
      {/* Top App Bar: Row 1 Location & Hotline */}
      <div className="pt-2 px-3 pb-1.5 flex items-center justify-between gap-1 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <MapPin className="w-3 h-3 fill-rose-500 text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[8.5px] font-black truncate leading-tight flex items-center gap-1">
              <span>BEC Lt. 1 Blok C-05, Bandung</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            </div>
            <div className="text-[7px] text-slate-400 font-medium leading-none">
              Store Resmi • Siap COD
            </div>
          </div>
        </div>
        <div className="bg-emerald-600 text-white font-black text-[7px] px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs shrink-0">
          <MessageCircle className="w-2 h-2 fill-current" />
          <span>WA</span>
        </div>
      </div>

      {/* Top App Bar: Row 2 Search Bar */}
      <div className="px-3 py-1.5 bg-white border-b border-slate-100 shrink-0">
        <div className="rounded-2xl bg-slate-100/90 border border-slate-200/80 px-2.5 py-1.5 flex items-center gap-1.5">
          <Search className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-[8px] text-slate-400 font-medium truncate flex-1">
            Cari iPhone 15, S24 Ultra...
          </span>
          <SlidersHorizontal className="w-2.5 h-2.5 text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12">
        {/* Hero Promo Card: Oraimo style dark navy card with floating phone */}
        <div className="rounded-3xl p-3 relative overflow-hidden shadow-md bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800">
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[6.5px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-2 h-2 text-amber-300" />
                <span>PROMO SPESIAL GAJIAN</span>
              </span>
              <h3 className="text-[11px] font-black leading-tight text-white">
                Diskon Unit Flagship
              </h3>
              <p className="text-[7px] text-slate-300 line-clamp-1">
                Lolos 30 titik uji • Garansi 30 hari
              </p>
              <button className="px-2.5 py-1 rounded-full text-[7px] font-black bg-white text-slate-950 shadow-xs hover:bg-slate-100 mt-0.5">
                Beli Sekarang →
              </button>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md p-1 flex items-center justify-center shrink-0 border border-white/20 shadow-md">
              <img
                src="/images/items/iphone-15-pro.png"
                alt="Promo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Visual Quick Category Icons (Pilar C) */}
        <div className="space-y-1">
          <div className="text-[8px] font-extrabold text-slate-800">Kategori Pilihan</div>
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
            {[
              { label: "Phone", icon: Smartphone, bg: "bg-blue-50 text-blue-600 border-blue-200" },
              { label: "Tablet", icon: Tablet, bg: "bg-cyan-50 text-cyan-600 border-cyan-200" },
              { label: "Watch", icon: Watch, bg: "bg-purple-50 text-purple-600 border-purple-200" },
              { label: "Audio", icon: Headphones, bg: "bg-rose-50 text-rose-600 border-rose-200" },
              { label: "Charger", icon: Zap, bg: "bg-amber-50 text-amber-600 border-amber-200" },
            ].map(({ label, icon: Icon, bg }) => (
              <div key={label} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-2xs border ${bg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[7px] font-bold text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Unit Pilihan Minggu Ini (Horizontal Snap Slider) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[8px] font-extrabold text-slate-800">
            <span>⚡ Unit Pilihan Minggu Ini</span>
            <span className="text-[7px] text-slate-400">Geser →</span>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {MOCK_PRODUCTS.slice(0, 3).map((p) => (
              <div
                key={`snap-${p.name}`}
                className="w-40 shrink-0 p-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1"
              >
                <div className="w-full h-14 rounded-xl bg-slate-50 p-1 flex items-center justify-center relative overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                  <span className="absolute top-1 left-1 text-[5.5px] font-black uppercase bg-slate-900 text-white px-1 py-0.2 rounded">
                    {p.brand}
                  </span>
                  <span className="absolute top-1 right-1 text-[5.5px] font-bold bg-amber-400 text-slate-950 px-1 py-0.2 rounded">
                    BH 94%
                  </span>
                </div>
                <div className="text-[7.5px] font-black text-slate-900 truncate">{p.name}</div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[7.5px] font-black text-blue-700">{p.price}</span>
                  <span className="text-[6.5px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.2 rounded">COD</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Product Grid (Pilar D: Rounded-3xl + Plus Button) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px]">
            <span className="font-extrabold text-slate-900">Rekomendasi Siap COD</span>
            <span className="font-bold text-indigo-600">Semua →</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MOCK_PRODUCTS.slice(0, 2).map((p) => (
              <div
                key={p.name}
                className="rounded-3xl p-2 bg-white border border-slate-100 shadow-sm flex flex-col justify-between space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[6px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-900 text-white">
                    {p.badge}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Heart className="w-2.5 h-2.5" />
                  </div>
                </div>

                <div className="w-full h-16 rounded-xl bg-slate-50 p-1 flex items-center justify-center overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                </div>

                <div>
                  <div className="text-[8px] font-black text-slate-900 truncate">{p.name}</div>
                  <div className="flex items-center gap-1 text-[6.5px] text-slate-500 font-semibold">
                    <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                    <span>•</span>
                    <span className="truncate">{p.spec}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[8px] font-black text-slate-950">{p.price}</span>
                  <div className="w-5 h-5 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Nav (Pilar E) */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-slate-200/90 bg-white/95 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Home" },
            { icon: Smartphone, label: "Katalog" },
            { icon: RefreshCw, label: "Trade-In" },
            { icon: StoreIcon, label: "Toko" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-slate-950 text-white font-bold" : "text-slate-500"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 2. DARK GAMING NEON (Starter - Spectra Dark Cyan/Mint, Image 4) */
function DarkGamingScreen() {
  return (
    <div className="w-full h-full bg-[#0c0f12] text-white flex flex-col overflow-hidden text-left font-sans">
      {/* Top Bar: Spectra Brand + Notification */}
      <div className="pt-2 px-3 pb-1.5 flex items-center justify-between border-b border-emerald-950/60 bg-[#0c0f12]/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-[#00e5b3]/20 text-[#00e5b3] flex items-center justify-center font-black text-[8px] border border-[#00e5b3]/40">
            ⚡
          </div>
          <div>
            <span className="font-black text-[9px] text-[#00e5b3] tracking-wide block leading-tight">
              SPECTRA ARENA BEC
            </span>
            <span className="text-[7px] text-emerald-400/60 font-mono block leading-none">
              HIGH-FPS STOK READY
            </span>
          </div>
        </div>
        <div className="bg-[#00e5b3] text-slate-950 font-black text-[7px] px-2 py-0.5 rounded-full shadow-md shadow-[#00e5b3]/20 flex items-center gap-0.5">
          <MessageCircle className="w-2 h-2 fill-current" />
          <span>WA</span>
        </div>
      </div>

      {/* Pill Filters Horizontal */}
      <div className="px-3 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-emerald-950/40 shrink-0">
        {["All Gaming", "ROG Phone", "165Hz AMOLED", "Snapdragon 8"].map((f, i) => (
          <span
            key={f}
            className={`px-2 py-0.5 rounded-full text-[6.5px] font-bold shrink-0 border ${
              i === 0
                ? "bg-[#00e5b3] text-slate-950 border-[#00e5b3] shadow-xs"
                : "bg-slate-900 text-slate-400 border-slate-800"
            }`}
          >
            {f}
          </span>
        ))}
      </div>

      {/* Scrollable Body: Spectra Big Hero Featured Card (Image 4) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12">
        {/* Featured Showcase Card with Mint Glow */}
        <div className="rounded-3xl p-3 bg-[#12161c] border border-[#00e5b3]/40 shadow-xl space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[6.5px] font-mono font-black text-[#00e5b3] uppercase tracking-wider bg-[#00e5b3]/15 px-2 py-0.2 rounded-full border border-[#00e5b3]/30">
              FEATURED UNIT
            </span>
            <Heart className="w-3 h-3 text-slate-500" />
          </div>

          <div className="w-full h-24 rounded-2xl bg-black/60 p-2 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00e5b3]/10 blur-xl pointer-events-none" />
            <img
              src="/images/items/rog-phone-8.png"
              alt="ROG Phone 8"
              className="w-full h-full object-contain relative z-10 drop-shadow-xl"
            />
          </div>

          <div>
            <h4 className="text-[9.5px] font-black text-white leading-tight">
              ASUS ROG Phone 8 Pro
            </h4>
            <p className="text-[7px] text-slate-400 font-mono">
              16/256GB • Snapdragon 8 Gen 3 • 165Hz
            </p>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[9px] font-black font-mono text-[#00e5b3]">
              Rp 10.800.000
            </span>
            <div className="w-6 h-6 rounded-full bg-[#00e5b3] text-slate-950 flex items-center justify-center shadow-lg shadow-[#00e5b3]/30">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>
        </div>

        {/* Secondary Specs Mini Strip */}
        <div className="rounded-2xl p-2 bg-[#12161c] border border-emerald-950/60 flex items-center justify-between text-[7px] font-mono text-emerald-400">
          <span>FPS: 165Hz</span>
          <span>•</span>
          <span>BH: 99% LIKE NEW</span>
          <span>•</span>
          <span>GARANSI 30 HARI</span>
        </div>
      </div>

      {/* Floating Bottom Dock Nav */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-emerald-950 bg-[#0c0f12]/95 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Home" },
            { icon: Smartphone, label: "Katalog" },
            { icon: RefreshCw, label: "Trade-In" },
            { icon: StoreIcon, label: "Toko" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-[#00e5b3] text-slate-950 font-black" : "text-slate-400"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 3. KEYNOTE OBSIDIAN (Pro - Apple Keynote Reveal Experience) */
function KeynoteObsidianScreen() {
  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden text-left font-sans">
      {/* Dynamic Island Header */}
      <div className="pt-2 px-3 pb-1 shrink-0">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-full px-3 py-1 flex items-center justify-between shadow-lg">
          <span className="text-[8.5px] font-black text-white flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Keynote Reveal
          </span>
          <span className="text-[7px] text-zinc-400 font-mono">REVEAL 2026</span>
        </div>
      </div>

      {/* Scrollable Stage Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12">
        {/* Spotlight Stage Card */}
        <div className="rounded-3xl p-3.5 bg-gradient-to-b from-zinc-900 via-black to-[#09090b] border border-zinc-800 shadow-2xl relative overflow-hidden text-center space-y-2">
          <div className="inline-block px-2 py-0.2 rounded-full text-[6.5px] font-mono tracking-widest text-zinc-400 uppercase bg-zinc-800/80 border border-zinc-700">
            FLAGSHIP REVEAL
          </div>

          <h2 className="text-[12px] font-black text-white tracking-tight">
            iPhone 15 Pro Max
          </h2>
          <p className="text-[7px] text-zinc-400">
            Titanium. Sangat Kokoh. Sangat Ringan.
          </p>

          <div className="w-full h-24 flex items-center justify-center relative my-1">
            <div className="w-24 h-24 rounded-full bg-indigo-500/15 blur-2xl absolute inset-0 m-auto pointer-events-none" />
            <img
              src="/images/items/iphone-15-pro.png"
              alt="Titanium"
              className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-[7px] text-zinc-300 font-mono">
            <span>BH: 100%</span>
            <span>•</span>
            <span>Grade A++</span>
            <span>•</span>
            <span>iBox Resmi</span>
          </div>

          <button className="w-full py-1.5 rounded-full bg-white text-black font-black text-[8px] shadow-lg">
            Ambil Unit Sekarang — Rp 18.500.000
          </button>
        </div>

        {/* Slide 2: Minimal Specs Cards */}
        <div className="rounded-2xl p-2.5 bg-zinc-950 border border-zinc-800 space-y-1.5">
          <div className="flex items-center justify-between text-[7px] text-zinc-400">
            <span>Kondisi Fisik: 99% Mulus No Dent</span>
            <span className="text-emerald-400 font-bold">READY COD</span>
          </div>
          <div className="text-[8px] font-bold text-white">
            Bandung Electronic Center (BEC) Lantai 1
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Nav */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-zinc-800 bg-black/90 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Reveal" },
            { icon: Smartphone, label: "Stok" },
            { icon: RefreshCw, label: "Trade-In" },
            { icon: StoreIcon, label: "Toko" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-white text-black font-bold" : "text-zinc-500"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 4. TOKYO STREET CLEAN (Pro - Streetwear & Pastel Asymmetric, Image 3) */
function TokyoEditorialScreen() {
  return (
    <div className="w-full h-full bg-[#f4f1ea] text-[#1c1a17] flex flex-col overflow-hidden text-left font-sans">
      {/* Top Header Tokyo Issue */}
      <div className="pt-2 px-3 pb-1.5 border-b border-[#dfd8cc] bg-[#faf8f4] flex items-center justify-between text-[7.5px] font-black uppercase tracking-wider shrink-0">
        <span>// TOKYO ISSUE 024</span>
        <span className="bg-[#1c1a17] text-white px-1.5 py-0.2 rounded">SHIBUYA</span>
      </div>

      {/* Scrollable Asymmetric Body (Image 3) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12">
        {/* Large Lavender Asymmetric Featured Card (Image 3: Pattern AirPod / Phone) */}
        <div className="rounded-3xl p-3 bg-[#ede9fe] border border-[#ddd6fe] shadow-sm space-y-1.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-black uppercase tracking-wider text-purple-900 bg-white/70 px-2 py-0.2 rounded-full">
              POPULAR DESIGN
            </span>
            <span className="text-[8px] font-mono font-bold text-purple-900">
              Rp 18.5M
            </span>
          </div>

          <h3 className="text-[11px] font-black text-purple-950 leading-tight">
            iPhone 15 Pro Shibuya
          </h3>
          <p className="text-[7px] text-purple-700">Curated Streetwear Mobile</p>

          <div className="w-full h-20 rounded-2xl bg-white/60 p-1 flex items-center justify-center overflow-hidden">
            <img
              src="/images/items/iphone-15-pro.png"
              alt="Tokyo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* 2 Asymmetric Pastel Cards Side-by-Side (Image 3 style) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Coral Card */}
          <div className="rounded-3xl p-2.5 bg-[#ffe4e6] border border-[#fecdd3] space-y-1">
            <span className="text-[6.5px] font-bold text-rose-800">Studio Pro</span>
            <div className="w-full h-12 flex items-center justify-center">
              <img
                src="/images/items/samsung-s24-ultra.png"
                alt="S24"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[7.5px] font-black text-rose-950 truncate">
              Samsung S24
            </div>
            <div className="text-[7.5px] font-mono font-black text-rose-900">
              Rp 15.9M
            </div>
          </div>

          {/* Mint Card */}
          <div className="rounded-3xl p-2.5 bg-[#ccfbf1] border border-[#99f6e4] space-y-1">
            <span className="text-[6.5px] font-bold text-teal-800">Leica Lens</span>
            <div className="w-full h-12 flex items-center justify-center">
              <img
                src="/images/items/xiaomi-14t-pro.png"
                alt="Xiaomi"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[7.5px] font-black text-teal-950 truncate">
              Xiaomi 14T
            </div>
            <div className="text-[7.5px] font-mono font-black text-teal-900">
              Rp 8.75M
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Nav */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-[#dfd8cc] bg-[#faf8f4]/95 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Home" },
            { icon: Smartphone, label: "Catalog" },
            { icon: RefreshCw, label: "Trade" },
            { icon: StoreIcon, label: "Store" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-[#d94823] text-white font-bold" : "text-[#736c62]"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 5. CYBER HUD TELEMETRY (Advance - Tactical Military Tech HUD, Image 2) */
function CyberHudScreen() {
  return (
    <div className="w-full h-full bg-[#05070a] text-cyan-100 flex flex-col overflow-hidden text-left font-mono">
      {/* Top Telemetry Bar (Image 2 style) */}
      <div className="pt-2 px-3 pb-1 border-b border-cyan-950 bg-[#080d14] flex items-center justify-between text-[7px] text-cyan-400 shrink-0">
        <span className="flex items-center gap-1 font-bold">
          <Activity className="w-2.5 h-2.5 text-cyan-400 animate-pulse" /> HUD_TELEMETRY: OK
        </span>
        <span className="text-cyan-300">FPS: 144</span>
      </div>

      {/* Location Bar */}
      <div className="px-3 py-1 bg-[#05070a] border-b border-cyan-900/40 text-[7px] text-slate-400 flex items-center gap-1 shrink-0">
        <MapPin className="w-2.5 h-2.5 text-cyan-400" />
        <span className="truncate">HQ_LOC: BEC_BANDUNG_C05</span>
      </div>

      {/* Scrollable Tactical Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12">
        {/* Tactical Launch Banner (Image 2) */}
        <div className="rounded-3xl p-3 bg-gradient-to-r from-[#040d1a] via-[#091f38] to-[#040d1a] border border-cyan-500/40 shadow-xl space-y-1 relative">
          <span className="text-[6.5px] font-bold text-cyan-300 uppercase">
            // TACTICAL LAUNCH
          </span>
          <h3 className="text-[10px] font-black text-white">
            ROG Phone 8 Black Edition
          </h3>
          <p className="text-[7px] text-cyan-300/70">High-Precision Cooling System</p>
          <button className="px-2 py-0.5 rounded-lg bg-cyan-500 text-slate-950 font-black text-[7px] uppercase mt-1">
            Pre-Order Unit →
          </button>
        </div>

        {/* Circular Radar Gadget Icons (Image 2 style) */}
        <div className="space-y-1">
          <div className="text-[7.5px] font-bold text-cyan-400 uppercase">
            // GADGET_COLLECTION
          </div>
          <div className="flex items-center justify-between gap-1">
            {[
              { label: "Audio", icon: Headphones },
              { label: "Smart", icon: Zap },
              { label: "Mobile", icon: Smartphone },
              { label: "Gear", icon: Watch },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-[#0a1420] border border-cyan-800/80 flex items-center justify-center text-cyan-400 shadow-sm shadow-cyan-500/10">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[6.5px] text-cyan-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical Chamfered Cards */}
        <div className="rounded-2xl p-2 bg-[#080d14] border border-cyan-900/60 space-y-1">
          <div className="flex items-center justify-between text-[7px]">
            <span className="font-bold text-white">XIAOMI 14T PRO LEICA</span>
            <span className="text-cyan-400 font-black">Rp 8.750.000</span>
          </div>
          <div className="text-[6.5px] text-slate-400">
            BATTERY: 100% • SIGNAL: 5G ALL OPERATOR
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Nav */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-cyan-950 bg-[#05070a]/95 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Home" },
            { icon: Smartphone, label: "Catalog" },
            { icon: RefreshCw, label: "Trade" },
            { icon: StoreIcon, label: "Base" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-cyan-500 text-slate-950 font-black" : "text-cyan-600"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 6. MIDNIGHT GOLD LUXURY (Advance - VIP Concierge & Warm Amber, Image 5) */
function MidnightGoldScreen() {
  return (
    <div className="w-full h-full bg-[#0a0805] text-amber-100 flex flex-col overflow-hidden text-left font-serif">
      {/* Top Header VIP Concierge */}
      <div className="pt-2 px-3 pb-1.5 flex items-center justify-between border-b border-amber-900/40 bg-[#0a0805]/95 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[8px] border border-amber-500/40">
            <Crown className="w-3 h-3 text-amber-400" />
          </div>
          <div>
            <span className="font-bold text-[9px] text-amber-200 block leading-tight">
              VIP Haute Salon
            </span>
            <span className="text-[6.5px] text-amber-400/60 font-mono block leading-none">
              CONCIERGE BEC
            </span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-[7px] px-2 py-0.5 rounded-full shadow-xs">
          VIP Hotline
        </div>
      </div>

      {/* Scrollable Luxury Body (Clearance / Luxury Card Image 5) */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-2.5 space-y-2.5 pb-12 font-sans">
        {/* Warm Amber-Orange Gradient Hero Card (Image 5) */}
        <div className="rounded-3xl p-3 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 text-white shadow-xl space-y-1 relative overflow-hidden">
          <span className="inline-block px-2 py-0.2 rounded-full text-[6px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs">
            CLEARANCE SALE // UP TO 15% OFF
          </span>
          <h3 className="text-[11px] font-black leading-tight text-white">
            Curated Gold Series
          </h3>
          <p className="text-[7px] text-amber-100 line-clamp-1">
            Exclusive Flagship &amp; VIP Warranty
          </p>
          <button className="px-2.5 py-0.8 rounded-full bg-white text-orange-950 font-black text-[7px] shadow-sm mt-0.5">
            Explore Collection →
          </button>
        </div>

        {/* 2-Column Luxury Curated Grid (Image 5 style) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[8px] font-serif">
            <span className="font-bold text-amber-300">Pilihan Flagship Mewah</span>
            <span className="text-[7px] text-amber-400/70 font-sans font-bold">Semua →</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MOCK_PRODUCTS.slice(0, 2).map((p) => (
              <div
                key={p.name}
                className="rounded-3xl p-2 bg-[#16130d] border border-amber-900/40 shadow-md flex flex-col justify-between space-y-1 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[6px] font-bold px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-700/40 font-mono">
                    VIP SELECT
                  </span>
                  <Heart className="w-2.5 h-2.5 text-amber-500/70" />
                </div>

                <div className="w-full h-16 rounded-xl bg-black/40 p-1 flex items-center justify-center overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                </div>

                <div>
                  <div className="text-[8px] font-extrabold text-amber-100 truncate">
                    {p.name}
                  </div>
                  <div className="text-[6.5px] text-amber-300/60 font-mono">
                    {p.spec}
                  </div>
                </div>

                <div className="pt-1 border-t border-amber-900/30 flex items-center justify-between">
                  <span className="text-[8px] font-black font-mono text-amber-400">
                    {p.price}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-xs">
                    <Plus className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Bottom Dock Nav */}
      <div className="absolute bottom-2 left-0 right-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-[240px] pointer-events-auto rounded-full backdrop-blur-xl border border-amber-950 bg-[#0a0805]/95 shadow-xl py-1 px-1.5 grid grid-cols-4 select-none">
          {[
            { icon: Home, label: "Salon" },
            { icon: Smartphone, label: "Vault" },
            { icon: RefreshCw, label: "Trade" },
            { icon: StoreIcon, label: "Concierge" },
          ].map(({ icon: Icon, label }, idx) => (
            <div
              key={label}
              className={`flex flex-col items-center justify-center py-0.5 rounded-full cursor-pointer ${
                idx === 0 ? "bg-amber-400 text-slate-950 font-bold" : "text-amber-300/60"
              }`}
            >
              <Icon className="w-2.5 h-2.5" />
              <span className="text-[6.5px] mt-0.5 leading-none">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Real Product Data for Live Storefront Mockup
// ---------------------------------------------------------------------------
const LIVE_MOCK_PRODUCTS: ProductData[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    brand: "Apple",
    price: 18500000,
    ramRom: "8GB / 256GB",
    batteryHealth: 94,
    imeiStatus: "Resmi iBox Kemenperin",
    completeness: "Fullset Original Box & Cable",
    condition: "LIKE_NEW",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/iphone-15-pro.png"],
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
    brand: "Samsung",
    price: 15900000,
    ramRom: "12GB / 512GB",
    batteryHealth: null,
    imeiStatus: "Resmi SEIN Indonesia",
    completeness: "Fullset Original",
    condition: "98% Mulus",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/samsung-s24-ultra.png"],
  },
  {
    id: "prod-3",
    name: "Xiaomi 14T Pro 12/512GB Leica Camera",
    brand: "Xiaomi",
    price: 8750000,
    ramRom: "12GB / 512GB",
    batteryHealth: null,
    imeiStatus: "Resmi Kemenperin",
    completeness: "Fullset Box & Fast Charger 120W",
    condition: "99% Mulus",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/xiaomi-14t-pro.png"],
  },
  {
    id: "prod-4",
    name: "ASUS ROG Phone 8 Pro 16/256GB Phantom Black",
    brand: "ASUS ROG",
    price: 10800000,
    ramRom: "16GB / 256GB",
    batteryHealth: null,
    imeiStatus: "Resmi Indonesia",
    completeness: "Fullset Box & AeroActive Cooler",
    condition: "LIKE_NEW",
    minusNotes: null,
    status: "AVAILABLE",
    images: ["/images/items/rog-phone-8.png"],
  },
];

// ---------------------------------------------------------------------------
// Dynamic Switcher for Smartphone Mockup Screen (Synchronized with Live Storefront)
// ---------------------------------------------------------------------------
function PhoneMockupScreen({ activeTheme }: { activeTheme: TemplateThemeConfig }) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");

  const mockStore: StoreData = {
    id: "mock-store-id",
    name: activeTheme.id === "dark-gaming" ? "Gamers Gadget Bandung" : "Berkah Cell Gadget",
    slug: activeTheme.id === "dark-gaming" ? "gamersgadget" : "berkahcell",
    address:
      activeTheme.id === "dark-gaming"
        ? "ITC Kebon Kelapa Lantai 3 Blok F No. 8, Bandung"
        : "Bandung Electronic Center (BEC) Lantai 1 Blok C-05",
    mapsUrl: null,
    whatsapp: "628123456789",
    templateId: activeTheme.id,
    primaryColor: activeTheme.id === "dark-gaming" ? "#00e5b3" : "#2563eb",
    bannerUrl: null,
    logoUrl: null,
    tier: "ADVANCE",
    hasWatermark: true,
  };

  // If minimal-clean or dark-gaming, render StoreShell with StoreHomeView
  if (activeTheme.id === "minimal-clean" || activeTheme.id === "dark-gaming") {
    return (
      <div className="w-full h-full overflow-y-auto no-scrollbar pointer-events-auto text-left select-none">
        <StoreShell
          store={mockStore}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          theme={activeTheme.id}
          totalProducts={LIVE_MOCK_PRODUCTS.length}
          isMockup={true}
        >
          <StoreHomeView
            store={mockStore}
            products={LIVE_MOCK_PRODUCTS}
            onNavigateTab={setActiveTab}
            theme={activeTheme.id}
          />
        </StoreShell>
      </div>
    );
  }

  // Other archetypes (Keynote, Tokyo, Cyber, Midnight) rendered directly
  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pointer-events-auto text-left select-none">
      <TemplateRenderer store={mockStore} products={LIVE_MOCK_PRODUCTS} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main TemplateShowcase Component
// ---------------------------------------------------------------------------
export function TemplateShowcase() {
  const [filterTier, setFilterTier] = useState<"ALL" | "STARTER" | "PRO" | "ADVANCE">("ALL");
  const [selectedId, setSelectedId] = useState<string>("minimal-clean");

  const templatesToDisplay =
    filterTier === "ALL"
      ? TEMPLATE_LIST
      : filterTier === "STARTER"
      ? getAvailableTemplatesForTier("STARTER")
      : filterTier === "PRO"
      ? getAvailableTemplatesForTier("PRO")
      : TEMPLATE_LIST;

  const activeTheme = getTemplateConfig(selectedId);

  return (
    <section
      id="showcase"
      className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-100 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-3 border border-indigo-200 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>6 Arketipe Desain Storefront Sinematik 2026</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Bukan Katalog Kaku. Pilih Karakter Toko Anda.
          </h2>
          <p className="mt-3 text-slate-600 text-sm leading-relaxed">
            Setiap arketipe memiliki <b className="text-slate-900">struktur tata letak, ritme visual, dan animasi yang benar-benar berbeda</b>—dari format mobile e-commerce terang Oraimo, dark gaming Spectra, panggung Apple Keynote, hingga Tokyo streetwear pop.
          </p>

          {/* Tier Filter Tabs (Memuat 6 Arketipe Lengkap) */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setFilterTier("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ALL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Semua Arketipe (6)
            </button>
            <button
              onClick={() => setFilterTier("STARTER")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "STARTER"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Starter (2 Arketipe)
            </button>
            <button
              onClick={() => setFilterTier("PRO")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "PRO"
                  ? "bg-purple-600 text-white border-purple-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Pro (4 Arketipe)
            </button>
            <button
              onClick={() => setFilterTier("ADVANCE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                filterTier === "ADVANCE"
                  ? "bg-amber-600 text-white border-amber-600 shadow-md"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              Advance (Semua 6 Arketipe)
            </button>
          </div>
        </div>

        {/* 2-Column: Live Interactive Smartphone (Left) & Template Gallery (Right) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-6xl mx-auto">
          {/* ----------------------------------------------------------------
              LEFT COLUMN — Smartphone Hardware Mockup Frame
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-24 flex flex-col items-center">
              {/* Smartphone Frame Outer Bezel */}
              <div className="relative overflow-hidden w-full max-w-[320px] sm:max-w-[340px] h-[580px] sm:h-[640px] bg-slate-50 dark:bg-slate-950 rounded-[40px] border-[8px] border-slate-900 shadow-2xl">
                {/* Dynamic Island / Notch */}
                <div className="w-[120px] h-[18px] bg-slate-950 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-30 flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-800 rounded-full" />
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full h-full relative">
                  <PhoneMockupScreen key={activeTheme.id} activeTheme={activeTheme} />
                </div>
              </div>

              {/* Status bar info di bawah HP */}
              <div className="mt-4 text-center space-y-2 w-full max-w-[310px]">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="text-left min-w-0">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Arketipe Aktif:
                    </div>
                    <div className="font-black text-slate-900 truncate">{activeTheme.name}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      activeTheme.category === "Starter"
                        ? "bg-blue-100 text-blue-800"
                        : activeTheme.category === "Pro"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {activeTheme.category}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------------------
              RIGHT COLUMN — 6 Archetype Interactive Cards Grid
          ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
              <span className="font-extrabold text-slate-800 text-sm">
                Pilihan Arketipe Layout ({templatesToDisplay.length})
              </span>
              <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                👆 Klik untuk ganti layout di layar HP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {templatesToDisplay.map((t) => {
                const isSelected = selectedId === t.id;
                const isDark = t.colors.isDark;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? "ring-2 ring-indigo-600 border-indigo-600 shadow-md scale-[1.01] bg-white text-slate-900"
                        : isDark
                        ? "border-2 border-slate-800 hover:border-indigo-400/60 bg-slate-950 text-slate-100 hover:shadow-md"
                        : "border-2 border-slate-200 hover:border-indigo-300 bg-white text-slate-900 hover:shadow-md"
                    }`}
                  >
                    <div>
                      {/* Card Header: Name & Tier Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`font-black text-sm leading-snug ${
                              isSelected ? "text-indigo-600" : isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {t.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {t.tagline}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                            t.category === "Starter"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : t.category === "Pro"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>

                      {/* Description */}
                      <p className={`text-xs mt-2 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {t.description}
                      </p>
                    </div>

                    {/* Footer: Archetype Pill & Selection Indicator */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                        <span>Layout:</span>
                        <b className={isSelected ? "text-indigo-600" : isDark ? "text-slate-200" : "text-slate-700"}>
                          {t.archetype}
                        </b>
                      </span>

                      {isSelected ? (
                        <span className="font-black text-[11px] text-indigo-600 flex items-center gap-1">
                          Aktif di HP ✓
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-600 flex items-center gap-1">
                          Pilih →
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
