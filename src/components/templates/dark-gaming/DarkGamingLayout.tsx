"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  Home,
  Smartphone,
  RefreshCw,
  Store as StoreIcon,
  Zap,
  ShieldCheck,
  Flame,
  Plus,
  Star,
  Cpu,
  Gamepad2,
  ArrowRight,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { formatRupiah } from "@/lib/utils";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { StoreAboutView } from "../shared/StoreAboutView";
import {
  ProductFilterBar,
  ProductEmptyState,
  ProductFilterState,
  filterAndSortProducts,
} from "@/components/storefront/ProductFilterBar";
import { TradeInModal, TradeInBanner } from "@/components/storefront/TradeInModal";
import styles from "./dark-gaming.module.css";

interface DarkGamingLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function DarkGamingLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: DarkGamingLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTradeInModalOpen, setIsTradeInModalOpen] = useState(false);
  const [filterState, setFilterState] = useState<ProductFilterState>({
    searchQuery: "",
    category: "ALL",
    brand: "ALL",
    grade: "ALL",
    sort: "DEFAULT",
  });

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: "",
      category: "ALL",
      brand: "ALL",
      grade: "ALL",
      sort: "DEFAULT",
    });
  };

  const displayProducts = Array.isArray(products) ? products : [];
  const heroHighlight = displayProducts[0];
  const snapSliderProducts = displayProducts.slice(0, 5);

  const gamingFilteredProducts = useMemo(() => {
    return filterAndSortProducts(displayProducts, filterState);
  }, [displayProducts, filterState]);

  const gamingPills = [
    { id: "ALL" as const, label: "SEMUA UNIT", icon: "⚡" },
    { id: "FLAGSHIP" as const, label: "FLAGSHIP", icon: "🔥" },
    { id: "GAMING" as const, label: "GAMING ROG", icon: "🎮" },
    { id: "IPHONE" as const, label: "iPHONE", icon: "🍎" },
    { id: "ANDROID" as const, label: "ANDROID", icon: "🤖" },
    { id: "BUDGET" as const, label: "BUDGET", icon: "💸" },
  ];

  const cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
    store.name
  )},%20saya%20mau%20cek%20stok%20gaming%20phone%20second`;

  return (
    <div
      className={`${styles.gamingContainer} ${styles.scanlineOverlay} ${
        isMockup
          ? "w-full min-h-full flex flex-col"
          : "min-h-screen flex justify-center"
      }`}
    >
      <div
        className={`w-full ${
          isMockup
            ? "max-w-full flex-1 flex flex-col"
            : "max-w-lg min-h-screen pb-28 flex flex-col relative"
        }`}
      >
        {/* ── 1. HEADER (Single-Row Dark Gaming) ── */}
        <header
          className={`sticky top-0 z-40 px-4 py-2.5 ${styles.gamingHeader}`}
        >
          <div className="flex items-center justify-between gap-3 h-10">
            {/* Left: Neon Avatar + Store Name + Pulse */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"
              onClick={() => {
                setActiveTab("home");
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              title="Ke Halaman Utama"
            >
              <div
                className={`w-9 h-9 rounded-full bg-slate-950 flex items-center justify-center shrink-0 overflow-hidden ${styles.neonAvatar}`}
              >
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <div className="flex items-center min-w-0 gap-1.5">
                <h1 className="font-black text-sm tracking-tight text-white leading-none truncate">
                  {store.name}
                </h1>
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse shrink-0 inline-block"
                  title="Online · Siap COD"
                />
              </div>
            </div>

            {/* Right: Search + WA */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTradeInModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                title="Tukar Tambah / Jual HP"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tukar Tambah</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isSearchOpen || filterState.searchQuery
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                    : "bg-slate-800/70 hover:bg-slate-700/80 text-slate-400 border border-slate-700/60"
                }`}
                title={isSearchOpen ? "Tutup Pencarian" : "Cari Unit Gaming"}
              >
                <Search className="w-4 h-4" />
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 transition ${styles.neonWaButton}`}
                title="Chat WhatsApp Toko"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Expandable Search Bar */}
          {isSearchOpen && (
            <div className="pt-2.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div
                className={`rounded-2xl px-3.5 py-2 flex items-center gap-2 shadow-lg transition ${styles.gamingSearchInput}`}
              >
                <Search className="w-4 h-4 text-emerald-500/70 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={filterState.searchQuery}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                    if (activeTab !== "list" && activeTab !== "home") {
                      setActiveTab("list");
                    }
                  }}
                  placeholder="Cari ROG, Xiaomi, iPhone, RAM..."
                  className="w-full bg-transparent text-xs font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
                {filterState.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                    className="w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 flex items-center justify-center text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ── 2. SCROLLABLE MAIN CONTENT ── */}
        <main className={`flex-1 ${isMockup ? "pb-24" : "pb-12"} p-4 space-y-5`}>
          {/* ════════════════════════════════════════
              TAB 1: HOME
          ════════════════════════════════════════ */}
          {activeTab === "home" && (
            <>
              {/* ── CYBER HERO BANNER ── */}
              <div
                className={`relative rounded-3xl overflow-hidden p-5 sm:p-6 ${styles.cyberHero}`}
              >
                {/* Grid overlay texture */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="space-y-2.5 max-w-[190px] sm:max-w-xs">
                    {/* Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${styles.fpsBadge}`}
                    >
                      <Cpu className="w-2.5 h-2.5 shrink-0" />
                      <span>HIGH FPS TESTED · COD READY</span>
                    </div>

                    <h2 className="text-base sm:text-xl font-black text-white tracking-tight leading-tight">
                      MAX PERFORMANCE{" "}
                      <span className={styles.neonTextEmerald}>
                        FLAGSHIP READY
                      </span>
                    </h2>

                    <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                      Unit gaming & flagship second teruji. Benchmark nyata,
                      garansi toko 30 hari, IMEI aman Kemenperin.
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveTab("list")}
                      className={`px-4 py-2 rounded-full font-black text-xs flex items-center gap-1.5 text-white active:scale-95 transition ${styles.neonCtaButton}`}
                    >
                      <span>Lihat Katalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hero Product Preview */}
                  <div
                    onClick={() => setActiveTab("list")}
                    className="relative shrink-0 cursor-pointer group select-none"
                  >
                    <div
                      className={`w-24 sm:w-28 aspect-square rounded-2xl bg-slate-950/80 p-2 flex flex-col items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105 ${styles.neonGlowEmeraldBorder}`}
                    >
                      {heroHighlight?.images?.[0] ? (
                        <img
                          src={heroHighlight.images[0]}
                          alt={heroHighlight.name}
                          className="w-full h-full object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <Gamepad2 className="w-10 h-10 text-emerald-400" />
                      )}
                      <span
                        className={`absolute -bottom-2 font-black text-[8px] px-2 py-0.5 rounded-full shadow-md text-white ${styles.neonCtaButton}`}
                      >
                        TOP PICK
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── GAMING FILTER PILLS ── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <div className="flex items-center gap-1.5 font-black text-emerald-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>SMART FILTER</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {gamingFilteredProducts.length} UNIT TERSEDIA
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 overflow-x-auto pb-1 ${styles.customScrollbar}`}
                >
                  {gamingPills.map((pill) => {
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => {
                          if (pill.id === "ALL") {
                            setFilterState((prev) => ({ ...prev, category: "ALL", brand: "ALL", grade: "ALL" }));
                          } else if (pill.id === "FLAGSHIP") {
                            setFilterState((prev) => ({ ...prev, sort: "PRICE_DESC" }));
                          } else if (pill.id === "GAMING") {
                            setFilterState((prev) => ({ ...prev, searchQuery: "gaming" }));
                          } else if (pill.id === "IPHONE") {
                            setFilterState((prev) => ({ ...prev, brand: "Apple", category: "SMARTPHONE" }));
                          } else if (pill.id === "ANDROID") {
                            setFilterState((prev) => ({ ...prev, category: "SMARTPHONE", brand: "ALL" }));
                          } else if (pill.id === "BUDGET") {
                            setFilterState((prev) => ({ ...prev, sort: "PRICE_ASC" }));
                          }
                          setActiveTab("list");
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 transition-all duration-200 select-none text-xs font-bold ${styles.gamingPill} hover:scale-102`}
                      >
                        <span>{pill.icon}</span>
                        <span className="whitespace-nowrap">{pill.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── TRUST BADGES (DARK GAMING) ── */}
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`p-3 rounded-2xl text-center space-y-1 ${styles.gamingTrustBadge}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight text-white">
                    Garansi 30 Hari
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Replace Unit
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl text-center space-y-1 ${styles.gamingTrustBadge}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mx-auto">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight text-white">
                    FPS Tested
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Benchmark Real
                  </div>
                </div>

                <div
                  className={`p-3 rounded-2xl text-center space-y-1 ${styles.gamingTrustBadge}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="font-extrabold text-[11px] leading-tight text-white">
                    IMEI Aman
                  </div>
                  <div className="text-[9px] text-slate-500">
                    Kemenperin
                  </div>
                </div>
              </div>

              {/* ── BANNER AJAKAN TUKAR TAMBAH / JUAL HP BEKAS ── */}
              <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />

              {/* ── SNAP SLIDER: UNIT PILIHAN ── */}
              {snapSliderProducts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs px-0.5">
                    <div className="flex items-center gap-1.5 font-black text-white">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>⚡ UNIT PILIHAN MINGGU INI</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Geser →
                    </span>
                  </div>

                  <div
                    className={`flex gap-3 overflow-x-auto pb-2 pt-1 -mx-4 px-4 scroll-smooth ${styles.customScrollbar}`}
                  >
                    {snapSliderProducts.map((p) => {
                      const detailUrl = isMockup
                        ? "#"
                        : `/${store.slug}/product/${p.id}`;
                      const buyWaUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                        store.name
                      )},%20saya%20tertarik%20unit%20*${encodeURIComponent(
                        p.name
                      )}*%20seharga%20*${formatRupiah(p.price)}*.%20Masih%20available?`;

                      return (
                        <div
                          key={`snap-${p.id}`}
                          className={`w-[220px] sm:w-[240px] shrink-0 snap-start rounded-3xl p-3.5 flex flex-col group transition-all ${styles.hudCard}`}
                        >
                          <a
                            href={detailUrl}
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                            className="block"
                          >
                            <div
                              className={`relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center ${styles.gamingProductImage}`}
                            >
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <Smartphone className="w-10 h-10 text-slate-600" />
                              )}

                              <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
                                <span className="px-2 py-0.5 rounded-md bg-slate-950/90 text-emerald-400 font-black text-[9px] uppercase tracking-wider">
                                  {p.brand}
                                </span>
                                {p.batteryHealth !== null &&
                                  p.batteryHealth !== undefined && (
                                    <span
                                      className={`px-2 py-0.5 rounded-md font-black text-[9px] flex items-center gap-1 ${styles.fpsBadge}`}
                                    >
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
                              <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-emerald-400 transition">
                                {p.name}
                              </h4>
                            </a>
                            <div className="text-xs text-slate-500 line-clamp-1 mb-3 mt-0.5">
                              {p.ramRom || "Fullset"} • {p.condition || "Mulus"}
                            </div>
                          </div>

                          <div
                            className={`mt-auto pt-2 border-t flex items-center justify-between ${styles.neonDivider}`}
                          >
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                                Harga
                              </span>
                              <div className={`text-sm font-black ${styles.neonTextEmerald}`}>
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
                              className={`text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition ${styles.neonCtaButton}`}
                            >
                              Beli
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── 2-COL PRODUCT GRID ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <div className="flex items-center gap-1.5 font-black text-white">
                    <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400/50" />
                    <span>REKOMENDASI SIAP COD</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    Semua ({gamingFilteredProducts.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {gamingFilteredProducts.map((product) => {
                    const detailUrl = isMockup
                      ? "#"
                      : `/${store.slug}/product/${product.id}`;
                    const buyWaUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                      store.name
                    )},%20saya%20tertarik%20unit%20*${encodeURIComponent(
                      product.name
                    )}*%20seharga%20*${formatRupiah(product.price)}*.%20Masih%20available?`;

                    return (
                      <div
                        key={product.id}
                        className={`rounded-3xl p-3 flex flex-col justify-between space-y-2 group relative text-left transition-all ${styles.hudCard}`}
                      >
                        {/* Badges */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 truncate max-w-[90px]">
                            {product.brand}
                          </span>
                          {product.batteryHealth && (
                            <span
                              className={`text-[7.5px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${styles.fpsBadge}`}
                            >
                              ⚡ {product.batteryHealth}%
                            </span>
                          )}
                        </div>

                        {/* Image */}
                        <Link
                          href={detailUrl}
                          onClick={(e) => {
                            if (isMockup) e.preventDefault();
                          }}
                          className={`w-full aspect-square rounded-2xl p-2 flex items-center justify-center relative overflow-hidden border ${styles.gamingProductImage}`}
                          style={{ borderColor: "rgba(30, 41, 59, 0.8)" }}
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Smartphone className="w-8 h-8 text-slate-600" />
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
                            <h3 className="font-black text-xs text-white line-clamp-2 leading-snug group-hover:text-emerald-400 transition">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold truncate">
                            <Star className="w-3 h-3 fill-emerald-500/50 text-emerald-400 shrink-0" />
                            <span>4.9</span>
                            <span>•</span>
                            <span className="truncate">{product.condition}</span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div
                          className={`pt-2 border-t flex items-center justify-between gap-1 ${styles.neonDivider}`}
                        >
                          <div>
                            <div className="text-[8.5px] text-slate-500 font-bold uppercase leading-none">
                              Harga
                            </div>
                            <div className={`text-xs font-black ${styles.neonTextEmerald}`}>
                              {formatRupiah(product.price)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isMockup) window.open(buyWaUrl, "_blank");
                            }}
                            className={`w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs active:scale-95 transition shrink-0 ${styles.neonCtaButton}`}
                            title="Beli via WhatsApp"
                          >
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ════════════════════════════════════════
              TAB 2: KATALOG
          ════════════════════════════════════════ */}
          {activeTab === "list" && (
            <div className="space-y-4 text-left -mx-4 -mt-4">
              {/* Sticky Filter Bar */}
              <div
                className={`sticky top-[61px] z-30 px-4 py-3 ${styles.gamingHeader}`}
              >
                <ProductFilterBar
                  products={displayProducts}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onReset={handleResetFilters}
                  theme="dark-gaming"
                  isDark={true}
                  totalFilteredCount={gamingFilteredProducts.length}
                />
              </div>

              <div className="px-4 space-y-4">
                <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />

                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-white">
                    KATALOG UNIT ({gamingFilteredProducts.length})
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("home")}
                    className="text-xs text-emerald-400 font-bold hover:text-emerald-300"
                  >
                    ← Home
                  </button>
                </div>

                {gamingFilteredProducts.length === 0 ? (
                  <ProductEmptyState
                    storeName={store.name}
                    storeWhatsapp={store.whatsapp}
                    onReset={handleResetFilters}
                    isDark={true}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                  {gamingFilteredProducts.map((p) => {
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
                    )},%20saya%20tertarik%20unit%20*${encodeURIComponent(
                      p.name
                    )}*%20seharga%20*${formatRupiah(p.price)}*.%20Masih%20available?`;

                    return (
                      <div
                        key={p.id}
                        className={`group relative flex flex-col justify-between rounded-3xl p-3.5 transition-all text-left ${styles.hudCard}`}
                      >
                        <Link
                          href={detailUrl}
                          onClick={(e) => {
                            if (isMockup) e.preventDefault();
                          }}
                          className="block cursor-pointer"
                        >
                          <div
                            className={`relative aspect-square w-full overflow-hidden rounded-2xl flex items-center justify-center ${styles.gamingProductImage}`}
                          >
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <Smartphone className="w-8 h-8 text-slate-600" />
                            )}
                          </div>

                          <span className="mt-2.5 inline-block text-[10px] font-black uppercase tracking-wider text-emerald-500/80">
                            {p.brand}
                          </span>
                          <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {p.ramRom} • {p.condition}
                          </p>
                        </Link>

                        <div
                          className={`mt-3 flex items-center justify-between border-t pt-2.5 ${styles.neonDivider}`}
                        >
                          <span className={`text-sm font-black ${styles.neonTextEmerald}`}>
                            {formatRupiah(p.price)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!isMockup) window.open(buyWaUrl, "_blank");
                            }}
                            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold text-white transition-colors ${styles.neonCtaButton}`}
                          >
                            Beli
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════
              TAB 3: TRADE-IN
          ════════════════════════════════════════ */}
          {activeTab === "trade-in" && (
            <StoreTradeInView store={store} theme="dark-gaming" isMockup={isMockup} />
          )}

          {/* ════════════════════════════════════════
              TAB 4: TOKO / ABOUT
          ════════════════════════════════════════ */}
          {activeTab === "about" && (
            <StoreAboutView store={store} theme="dark-gaming" isMockup={isMockup} />
          )}
        </main>

        {/* ── 3. FLOATING BOTTOM DOCK (DARK GAMING) ── */}
        {!hideDock && (
          <div
            className={`${
              isMockup
                ? "absolute bottom-3 left-3 right-3"
                : "fixed bottom-4 left-4 right-4 max-w-md mx-auto"
            } z-30 pointer-events-none flex justify-center`}
          >
            <nav
              className={`w-full max-w-sm rounded-full px-4 py-2 flex items-center justify-between pointer-events-auto select-none transition-all duration-300 ${styles.floatingDockDark}`}
            >
              {/* Home */}
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "home"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-500 hover:text-slate-300 font-medium"
                }`}
              >
                <Home className={`w-4 h-4 ${activeTab === "home" ? "scale-110" : ""}`} />
                <span className="text-[9px] tracking-tight leading-none font-bold">
                  Home
                </span>
              </button>

              {/* Katalog */}
              <button
                type="button"
                onClick={() => setActiveTab("list")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "list"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-500 hover:text-slate-300 font-medium"
                }`}
              >
                <Smartphone className={`w-4 h-4 ${activeTab === "list" ? "scale-110" : ""}`} />
                <span className="text-[9px] tracking-tight leading-none font-bold">
                  Katalog
                </span>
              </button>

              {/* Trade-In */}
              <button
                type="button"
                onClick={() => setActiveTab("trade-in")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "trade-in"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-500 hover:text-slate-300 font-medium"
                }`}
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    activeTab === "trade-in"
                      ? "scale-110 rotate-180 transition-transform duration-500"
                      : ""
                  }`}
                />
                <span className="text-[9px] tracking-tight leading-none font-bold">
                  Trade-In
                </span>
              </button>

              {/* Toko */}
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === "about"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-500 hover:text-slate-300 font-medium"
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

        {/* ── TRADE-IN / SELL DEVICE MODAL ── */}
        <TradeInModal
          isOpen={isTradeInModalOpen}
          onClose={() => setIsTradeInModalOpen(false)}
          store={store}
          products={displayProducts}
          theme="dark-gaming"
          isDark={true}
        />
      </div>
    </div>
  );
}
