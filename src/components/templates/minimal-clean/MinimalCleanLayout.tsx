"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  MapPin,
  SlidersHorizontal,
  Home,
  Smartphone,
  RefreshCw,
  Store as StoreIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Flame,
  Plus,
  Star,
  Check,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { formatRupiah } from "@/lib/utils";
import { StoreAboutView } from "../shared/StoreAboutView";

interface MinimalCleanLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function MinimalCleanLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: MinimalCleanLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "IPHONE" | "ANDROID" | "GAMING" | "BUDGET" | "LIKENEW"
  >("ALL");

  const displayProducts = Array.isArray(products) ? products : [];
  const heroHighlight = displayProducts[0];
  const snapSliderProducts = displayProducts.slice(0, 5);

  const smartFilteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (p.name || "").toLowerCase().includes(query);
        const matchesBrand = (p.brand || "").toLowerCase().includes(query);
        const matchesSpec = (p.ramRom || "").toLowerCase().includes(query);
        const matchesImei = (p.imeiStatus || "").toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSpec && !matchesImei) {
          return false;
        }
      }

      // Filter category
      if (activeFilter === "ALL") return true;
      const brandLower = (p.brand || "").toLowerCase();
      const nameLower = (p.name || "").toLowerCase();

      if (activeFilter === "IPHONE") {
        return brandLower === "apple" || nameLower.includes("iphone");
      }
      if (activeFilter === "ANDROID") {
        return brandLower !== "apple" && !nameLower.includes("iphone");
      }
      if (activeFilter === "GAMING") {
        return (
          brandLower.includes("rog") ||
          brandLower.includes("poco") ||
          brandLower.includes("iqoo") ||
          nameLower.includes("gaming") ||
          nameLower.includes("rog")
        );
      }
      if (activeFilter === "BUDGET") {
        return Number(p.price) < 3000000;
      }
      if (activeFilter === "LIKENEW") {
        const cond = (p.condition || "").toUpperCase();
        return (
          cond.includes("LIKE_NEW") ||
          cond.includes("99%") ||
          cond.includes("MULUS")
        );
      }
      return true;
    });
  }, [displayProducts, activeFilter, searchQuery]);

  const smartPills = [
    { id: "ALL" as const, label: "Semua Unit", icon: "📱" },
    { id: "IPHONE" as const, label: "iPhone", icon: "🍎" },
    { id: "ANDROID" as const, label: "Android", icon: "🤖" },
    { id: "GAMING" as const, label: "Gaming / FPS", icon: "🎮" },
    { id: "BUDGET" as const, label: "Budget < 3 Jt", icon: "🏷️" },
    { id: "LIKENEW" as const, label: "Mulus 99%", icon: "✨" },
  ];

  // Clean WA Number
  const cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
    store.name
  )},%20saya%20ingin%20tanya%20stok%20HP%20second`;

  const mainBranch = store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const locationLabel = mainBranch
    ? `${mainBranch.name}, Bandung`
    : store.address
    ? store.address.split(",").slice(0, 2).join(",")
    : "Bandung Electronic Center (BEC) Lantai 1 Blok C-05";

  return (
    <div
      className={`${
        isMockup ? "w-full min-h-full flex flex-col" : "min-h-screen bg-slate-50 flex justify-center"
      } font-sans text-slate-900`}
    >
      <div
        className={`w-full ${
          isMockup ? "max-w-full flex-1 flex flex-col" : "max-w-lg min-h-screen bg-slate-50 shadow-2xl border-x border-slate-200 pb-28 flex flex-col relative"
        }`}
      >
        {/* ── 1. HEADER BERSIH (Pilar A) ── */}
        <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-md px-4 pt-3.5 pb-3 space-y-2.5 shadow-xs">
          {/* Baris 1: Logo Toko + Nama Toko Hitam Pekat + Lokasi BEC + WA Button */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Store Avatar Logo */}
              <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center shrink-0 border border-slate-800 shadow-xs overflow-hidden">
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

              <div className="min-w-0">
                <div className="flex items-center">
                  <h1 className="font-black text-base tracking-tight text-slate-950 leading-tight truncate">
                    {store.name}
                  </h1>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse inline-block ml-1.5 shrink-0"
                    title="Toko Buka"
                  />
                </div>

                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] sm:max-w-xs leading-tight">
                    {locationLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* WA Hotline Button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition shrink-0"
              title="Hubungi WhatsApp Toko"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span className="hidden xs:inline">WhatsApp</span>
            </a>
          </div>

          {/* Baris 2: Search Bar Kontras */}
          <div className="rounded-2xl bg-slate-100 border border-slate-300/80 focus-within:border-slate-800 px-3.5 py-2.5 flex items-center gap-2 shadow-2xs transition">
            <Search className="w-4 h-4 text-slate-700 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari iPhone 15, S24 Ultra, RAM, IMEI..."
              className="w-full bg-transparent text-xs font-semibold text-slate-950 placeholder:text-slate-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-slate-600 px-1"
              >
                ✕
              </button>
            )}
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          </div>
        </header>

        {/* ── 2. SCROLLABLE MAIN CONTENT ── */}
        <main className={`flex-1 ${isMockup ? "pb-24" : "pb-12"} p-4 space-y-6`}>
          {/* TAB 1: HOME */}
          {activeTab === "home" && (
            <>
              {/* ── HERO PROMO CARD (Pilar B) ── */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 p-5 sm:p-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="space-y-2 max-w-[200px] sm:max-w-xs text-left">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-md">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
                      <span>PROMO SPESIAL GAJIAN</span>
                    </div>

                    <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight drop-shadow-sm">
                      Diskon Unit Flagship Siap COD
                    </h2>

                    <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                      Lolos 30 titik uji kelayakan. Garansi replace 30 hari &amp; IMEI aman seumur hidup.
                    </p>

                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveTab("list")}
                        className="px-4 py-2 rounded-full font-black text-xs transition-all duration-200 flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-white/10 active:scale-95 shrink-0"
                      >
                        <span>Lihat Promo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Floating Physical Product Preview */}
                  <div
                    onClick={() => setActiveTab("list")}
                    className="relative shrink-0 cursor-pointer group select-none"
                  >
                    <div className="w-24 sm:w-32 aspect-square rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex flex-col items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
                      {heroHighlight?.images?.[0] ? (
                        <img
                          src={heroHighlight.images[0]}
                          alt={heroHighlight.name}
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <img
                          src="/images/items/iphone-15-pro.png"
                          alt="Flagship Phone"
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      )}
                      <span className="absolute -bottom-2 bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full shadow-md">
                        HOT DEAL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── QUICK PRESET FILTERS (Pilar C) ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <div className="flex items-center gap-1.5 font-black text-slate-900">
                    <span className="text-sm">🎯</span>
                    <span>Smart Filter Koleksi</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {smartFilteredProducts.length} Unit Sesuai
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                  {smartPills.map((pill) => {
                    const isSelected = activeFilter === pill.id;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setActiveFilter(pill.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl shrink-0 transition-all duration-200 select-none ${
                          isSelected
                            ? "bg-slate-950 text-white font-black border-2 border-slate-950 shadow-md scale-105"
                            : "bg-white text-slate-700 border-2 border-slate-200/90 hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <span className="text-sm">{pill.icon}</span>
                        <div className="text-left">
                          <div className="text-xs font-black leading-tight whitespace-nowrap">
                            {pill.label}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TRUST BADGES ── */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs text-center space-y-1">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight">Garansi 30 Hari</div>
                  <div className="text-[9px] text-slate-400">Ganti Unit / Servis</div>
                </div>

                <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs text-center space-y-1">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center mx-auto">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight">Bebas Blokir IMEI</div>
                  <div className="text-[9px] text-slate-400">Jaminan Kemenperin</div>
                </div>

                <div className="p-3 rounded-2xl border bg-slate-50 border-slate-200/80 text-slate-700 shadow-2xs text-center space-y-1">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight">Free Pindah Data</div>
                  <div className="text-[9px] text-slate-400">Dukungan Kasir BEC</div>
                </div>
              </div>

              {/* ── SNAP SLIDER HORIZONTAL: UNIT PILIHAN MINGGU INI ── */}
              {snapSliderProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <div className="flex items-center gap-1.5 font-black text-slate-900">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      <span>Unit Pilihan Minggu Ini</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Geser ke kanan →
                    </span>
                  </div>

                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 scroll-smooth">
                    {snapSliderProducts.map((p) => {
                      const detailUrl = isMockup ? "#" : `/${store.slug}/product/${p.id}`;
                      const buyWaUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                        store.name
                      )},%20saya%20tertarik%20dengan%20unit%20*${encodeURIComponent(
                        p.name
                      )}*%20seharga%20*${formatRupiah(p.price)}*.%20Apakah%20stok%20masih%20tersedia?`;

                      return (
                        <div
                          key={`snap-${p.id}`}
                          className="w-[240px] sm:w-[260px] shrink-0 snap-start bg-white dark:bg-slate-900 rounded-3xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col group"
                        >
                          <a
                            href={detailUrl}
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                            className="block"
                          >
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/60 flex items-center justify-center">
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <Smartphone className="w-10 h-10 text-slate-300" />
                              )}

                              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                                <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white font-black text-[9px] uppercase tracking-wider backdrop-blur-xs">
                                  {p.brand}
                                </span>
                                {p.batteryHealth !== null && p.batteryHealth !== undefined && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-black text-[9px] flex items-center gap-1 shadow-sm">
                                    <Zap className="w-2.5 h-2.5" />
                                    <span>BH {p.batteryHealth}%</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </a>

                          <div className="mt-2.5">
                            <a
                              href={detailUrl}
                              onClick={(e) => {
                                if (isMockup) e.preventDefault();
                              }}
                              className="block"
                            >
                              <h4 className="font-bold text-sm text-slate-950 dark:text-white line-clamp-1 group-hover:text-blue-600 transition">
                                {p.name}
                              </h4>
                            </a>
                            <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-3 mt-0.5">
                              {p.ramRom || "Fullset"} • {p.condition || "98% Mulus"}
                            </div>
                          </div>

                          <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                                Harga Spesial
                              </span>
                              <div className="text-sm font-black text-blue-700 dark:text-blue-400">
                                {formatRupiah(p.price)}
                              </div>
                            </div>

                            <a
                              href={buyWaUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                if (isMockup) e.preventDefault();
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                            >
                              Beli Unit
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 2-COLUMN PRODUCT GRID (Pilar D: Rekomendasi Siap COD) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <div className="flex items-center gap-1.5 font-black text-slate-900">
                    <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Rekomendasi Siap COD Hari Ini</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    Semua ({smartFilteredProducts.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {smartFilteredProducts.map((product) => {
                    const detailUrl = isMockup ? "#" : `/${store.slug}/product/${product.id}`;
                    const buyWaUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                      store.name
                    )},%20saya%20tertarik%20dengan%20unit%20*${encodeURIComponent(
                      product.name
                    )}*%20seharga%20*${formatRupiah(product.price)}*.%20Apakah%20stok%20masih%20tersedia?`;

                    return (
                      <div
                        key={product.id}
                        className="rounded-3xl p-3 bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-2 group relative text-left"
                      >
                        {/* Badges Bar */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950 text-white truncate max-w-[90px]">
                            {product.brand}
                          </span>
                          {product.batteryHealth && (
                            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shrink-0">
                              ⚡ {product.batteryHealth}%
                            </span>
                          )}
                        </div>

                        {/* Image Preview */}
                        <Link
                          href={detailUrl}
                          onClick={(e) => {
                            if (isMockup) e.preventDefault();
                          }}
                          className="w-full aspect-square rounded-2xl bg-slate-50 p-2 flex items-center justify-center relative overflow-hidden border border-slate-100"
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-300" />
                          )}
                        </Link>

                        {/* Title & Specs */}
                        <div className="space-y-1">
                          <Link
                            href={detailUrl}
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                          >
                            <h3 className="font-black text-xs text-slate-950 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold truncate">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                            <span>4.9</span>
                            <span>•</span>
                            <span className="truncate">{product.condition}</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <div>
                            <div className="text-[8.5px] text-slate-400 font-bold uppercase leading-none">
                              Harga Unit
                            </div>
                            <div className="text-xs sm:text-sm font-black text-slate-950">
                              {formatRupiah(product.price)}
                            </div>
                          </div>

                          <a
                            href={buyWaUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                            className="w-7 h-7 rounded-full bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center shadow-xs active:scale-95 transition shrink-0"
                            title="Beli Unit via WhatsApp"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: KATALOG */}
          {activeTab === "list" && (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-950">
                  Daftar Katalog Unit ({smartFilteredProducts.length})
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab("home")}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  ← Kembali ke Home
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {smartFilteredProducts.map((p) => {
                  const isCustomDomain =
                    typeof window !== "undefined" &&
                    !window.location.pathname.startsWith(`/${store.slug}`) &&
                    !window.location.hostname.includes("localhost") &&
                    !window.location.hostname.includes("gadgetbdg.com");

                  const detailUrl = isMockup
                    ? "#"
                    : isCustomDomain
                    ? `/product/${p.id}`
                    : `/${store.slug}/product/${p.id}`;

                  const buyWaUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                    store.name
                  )},%20saya%20tertarik%20dengan%20unit%20*${encodeURIComponent(
                    p.name
                  )}*%20seharga%20*${formatRupiah(p.price)}*.%20Apakah%20stok%20masih%20tersedia?`;

                  return (
                    <div
                      key={p.id}
                      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all hover:shadow-md text-left"
                    >
                      <Link
                        href={detailUrl}
                        onClick={(e) => {
                          if (isMockup) e.preventDefault();
                        }}
                        className="block cursor-pointer"
                      >
                        {/* Gambar Unit HP */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-300" />
                          )}
                        </div>

                        {/* Brand & Nama Unit */}
                        <span className="mt-2.5 inline-block text-[10px] font-black uppercase tracking-wider text-slate-500">
                          {p.brand}
                        </span>
                        <h3 className="line-clamp-1 text-sm font-bold text-slate-950 group-hover:text-blue-700 transition-colors">
                          {p.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {p.ramRom} • {p.condition}
                        </p>
                      </Link>

                      {/* Baris Bawah: Harga & Tombol Beli WA Cepat */}
                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                        <span className="text-sm font-black text-slate-950">
                          {formatRupiah(p.price)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isMockup) {
                              window.open(buyWaUrl, "_blank");
                            }
                          }}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
                        >
                          Beli
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRADE-IN */}
          {activeTab === "trade-in" && (
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm text-left space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-950">Estimasi Tukar Tambah</h3>
                  <p className="text-[10px] text-slate-500">Tukar HP lama ke unit impian di {store.name}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bawa HP lama Anda ke konter fisik kami di <b>{locationLabel}</b> untuk uji fisik langsung atau ajukan konsultasi via WhatsApp.
              </p>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Konsultasi Trade-In via WhatsApp</span>
              </a>
            </div>
          )}

          {/* TAB 4: TOKO */}
          {activeTab === "about" && (
            <StoreAboutView store={store} theme="minimal-clean" isMockup={isMockup} />
          )}
        </main>

        {/* ── 3. FLOATING BOTTOM DOCK NAV (TERKUNCI DI BAWAH) ── */}
        {!hideDock && (
          <div
            className={`${
              isMockup
                ? "absolute bottom-3 left-3 right-3"
                : "fixed bottom-4 left-4 right-4 max-w-md mx-auto"
            } z-30 pointer-events-none flex justify-center`}
          >
            <nav className="w-full max-w-sm rounded-full px-4 py-2 flex items-center justify-between border bg-white/95 border-slate-200 text-slate-800 shadow-xl backdrop-blur-xl pointer-events-auto select-none transition-all duration-300">
              {/* Tab 1: Home */}
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "home"
                    ? "text-blue-600 font-bold"
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
                onClick={() => setActiveTab("list")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "list"
                    ? "text-blue-600 font-bold"
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
                onClick={() => setActiveTab("trade-in")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "trade-in"
                    ? "text-blue-600 font-bold"
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
                onClick={() => setActiveTab("about")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "about"
                    ? "text-blue-600 font-bold"
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
        )}
      </div>
    </div>
  );
}
