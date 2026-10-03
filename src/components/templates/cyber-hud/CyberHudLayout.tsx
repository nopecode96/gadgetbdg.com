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
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Star,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ExternalLink,
  Activity,
  Cpu,
  Radio,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { formatRupiah } from "@/lib/utils";
import { submitTradeInOfferAction } from "@/lib/actions/tradein-actions";
import { submitStoreReviewAction } from "@/lib/actions/review-actions";
import {
  ProductFilterBar,
  ProductEmptyState,
  ProductFilterState,
  filterAndSortProducts,
} from "@/components/storefront/ProductFilterBar";
import { TradeInModal, TradeInBanner } from "@/components/storefront/TradeInModal";
import styles from "./cyber-hud.module.css";

interface CyberHudLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function CyberHudLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: CyberHudLayoutProps) {
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

  // --- Trade-In State ---
  const [tiCustomerName, setTiCustomerName] = useState("");
  const [tiCustomerWa, setTiCustomerWa] = useState("");
  const [tiPhoneModel, setTiPhoneModel] = useState("");
  const [tiRamRom, setTiRamRom] = useState("");
  const [tiCondition, setTiCondition] = useState("98% Mulus Like New");
  const [tiBatteryHealth, setTiBatteryHealth] = useState("88");
  const [tiImeiStatus, setTiImeiStatus] = useState("Resmi iBox / Kemenperin");
  const [tiCompleteness, setTiCompleteness] = useState("Fullset Box Original");
  const [tiExpectedPrice, setTiExpectedPrice] = useState("");
  const [tiMinusNotes, setTiMinusNotes] = useState("");
  const [tiLoading, setTiLoading] = useState(false);
  const [tiSuccess, setTiSuccess] = useState(false);
  const [tiError, setTiError] = useState<string | null>(null);

  // --- Review State ---
  const [reviews, setReviews] = useState(store.reviews || []);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revRating, setRevRating] = useState(5);
  const [revName, setRevName] = useState("");
  const [revUnit, setRevUnit] = useState("");
  const [revComment, setRevComment] = useState("");
  const [revLoading, setRevLoading] = useState(false);
  const [revSuccess, setRevSuccess] = useState(false);
  const [revError, setRevError] = useState<string | null>(null);

  const displayProducts = Array.isArray(products) ? products : [];
  const spotlightProducts = displayProducts.slice(0, 4);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(displayProducts, filterState);
  }, [displayProducts, filterState]);

  const freqTabs = [
    { id: "ALL" as const, label: "[FREQ-ALL]" },
    { id: "APPLE" as const, label: "[FREQ-APPLE]" },
    { id: "ANDROID" as const, label: "[FREQ-ANDROID]" },
    { id: "GAMING" as const, label: "[FREQ-GAMING]" },
  ];

  let cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
    store.name
  )},%20saya%20ingin%20cek%20telemetri%20stok%20unit%20high-performance`;

  function getProductWaUrl(p: ProductData) {
    return `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
      store.name
    )},%20saya%20ingin%20order%20unit%20*${encodeURIComponent(
      p.name
    )}*%20(${formatRupiah(p.price)}).%20Apakah%20unit%20masih%20ready%20COD?`;
  }

  // --- Trade-In Submit ---
  async function handleTradeInSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) {
      setTiSuccess(true);
      return;
    }
    setTiLoading(true);
    setTiError(null);
    try {
      const formData = new FormData();
      formData.append("storeId", store.id);
      formData.append("customerName", tiCustomerName);
      formData.append("customerWa", tiCustomerWa);
      formData.append("phoneModel", tiPhoneModel);
      formData.append("ramStorage", tiRamRom);
      formData.append("condition", tiCondition);
      formData.append("batteryHealth", tiBatteryHealth);
      formData.append("imeiStatus", tiImeiStatus);
      formData.append("completeness", tiCompleteness);
      formData.append("expectedPrice", tiExpectedPrice.replace(/\D/g, ""));
      formData.append("minusNotes", tiMinusNotes);
      formData.append("photoUrls", JSON.stringify([]));

      const res = await submitTradeInOfferAction(formData);
      if (res.success) {
        setTiSuccess(true);
        const msg = encodeURIComponent(
          `[TELEMETRY VALUATION] Halo ${store.name}, saya submit taksiran Trade-In:\n\nUnit: ${tiPhoneModel} ${tiRamRom}\nKondisi: ${tiCondition}\nBH: ${tiBatteryHealth}%\nIMEI: ${tiImeiStatus}\nKelengkapan: ${tiCompleteness}\nMinus: ${
            tiMinusNotes || "-"
          }\nHarga Harapan: ${tiExpectedPrice || "-"}\n\nMohon validasi taksiran tertinggi. Terima kasih!`
        );
        if (!isMockup)
          window.open(`https://wa.me/${cleanWa}?text=${msg}`, "_blank");
      } else {
        setTiError(res.error || "Gagal mengirim data taksiran.");
      }
    } catch {
      setTiError("Gangguan koneksi terminal telemetri. Silakan ulangi.");
    }
    setTiLoading(false);
  }

  // --- Review Submit ---
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) {
      setShowReviewModal(false);
      return;
    }
    setRevLoading(true);
    setRevError(null);
    const res = await submitStoreReviewAction({
      storeId: store.id,
      customerName: revName,
      rating: revRating,
      comment: revComment,
      purchasedUnit: revUnit || undefined,
    });
    setRevLoading(false);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setRevSuccess(true);
      setTimeout(() => {
        setRevSuccess(false);
        setShowReviewModal(false);
        setRevName("");
        setRevUnit("");
        setRevComment("");
        setRevRating(5);
      }, 1500);
    } else {
      setRevError(res.error || "Gagal mencatat ulasan.");
    }
  }

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const mainBranch =
    store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const defaultMapsUrl =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address || store.name + " Bandung"
    )}`;

  return (
    <div
      className={`${styles.hudCanvas} ${
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
        {/* ══════════════════════════════════════════════
            HEADER — 1 Baris Ramping Cyber HUD Telemetry
        ══════════════════════════════════════════════ */}
        <header className="sticky top-0 z-40 px-4 py-2.5 bg-slate-950/95 backdrop-blur-md border-b border-cyan-500/25">
          <div className="flex items-center justify-between gap-2.5 h-11">
            {/* Kiri: Logo Radar & Nama Toko */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"
              onClick={() => {
                setActiveTab("home");
                if (typeof window !== "undefined")
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="w-8 h-8 rounded-lg border border-cyan-400/60 bg-slate-900 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-mono font-black text-xs tracking-wider text-white uppercase truncate">
                    {store.name}
                  </h1>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4] animate-ping shrink-0" />
                </div>
                <div className="text-[8.5px] font-mono font-bold text-cyan-300/80 truncate">
                  NODE: ACTIVE // 100% VERIFIED
                </div>
              </div>
            </div>

            {/* Kanan: Search Konsol & Direct WA Cyan */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTradeInModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 transition shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                title="Tukar Tambah / Jual HP"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span>TRADE-IN</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-9 h-9 rounded-xl font-mono flex items-center justify-center transition border ${
                  isSearchOpen || filterState.searchQuery
                    ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "bg-slate-900 text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
                }`}
                title="Search Telemetry"
              >
                <Search className="w-4 h-4" />
              </button>

              <a
                href={isMockup ? "#" : waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (isMockup) e.preventDefault();
                }}
                className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs ${styles.cyanGlowBtn}`}
                title="Direct WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WA</span>
              </a>
            </div>
          </div>

          {/* Search Dropdown Konsol */}
          {isSearchOpen && (
            <div className="pt-2 pb-1 animate-in fade-in duration-150">
              <div className="rounded-xl px-3 py-2 flex items-center gap-2 bg-slate-900 border border-cyan-500/40 focus-within:border-cyan-400 transition shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={filterState.searchQuery}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                    if (activeTab !== "list" && activeTab !== "home")
                      setActiveTab("list");
                  }}
                  placeholder="QUERY SPECS / IPHONE / RAM / CHIPSET..."
                  className="w-full bg-transparent text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none"
                />
                {filterState.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                    className="w-5 h-5 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center text-[10px] font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════ */}
        <main className={`flex-1 ${isMockup ? "pb-24" : "pb-12"}`}>
          {/* ══════════ TAB 1: HOME ══════════ */}
          {activeTab === "home" && (
            <div className="space-y-4 p-4">
              {/* HERO BANNER: COCKPIT TELEMETRY */}
              <div className={`rounded-2xl p-5 sm:p-6 ${styles.cockpitHero} ${styles.hudCornerBracket}`}>
                <div className="space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-bold tracking-wider uppercase">
                    <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                    <span>[DIAGNOSTIC STATUS: 100% HARDWARE VERIFIED]</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-mono font-black text-white leading-tight tracking-wide">
                    HIGH-GRADE FLAGSHIP TELEMETRY READY COD
                  </h2>

                  <p className="text-xs font-mono text-slate-300 leading-relaxed">
                    Setiap unit lolos uji diagnostic hardware 30 titik. Bebas blokir IMEI seumur hidup, jaminan replace unit 30 hari di store BEC Bandung.
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("list")}
                      className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 ${styles.cyanGlowBtn}`}
                    >
                      <span>AKSES KATALOG</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("trade-in")}
                      className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 ${styles.cyanOutlineBtn}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>VALUASI TRADE-IN</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 🎯 TELEMETRY FAST FILTER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>TELEMETRY FAST FILTER</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="text-[11px] font-mono font-bold text-cyan-400 hover:underline"
                  >
                    SYSTEM LOG ({displayProducts.length}) →
                  </button>
                </div>

                <div className={`flex items-center gap-2 overflow-x-auto pb-1 ${styles.noScrollbar}`}>
                  {freqTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        if (tab.id === "ALL") {
                          setFilterState((prev) => ({ ...prev, category: "ALL", brand: "ALL" }));
                        } else if (tab.id === "APPLE") {
                          setFilterState((prev) => ({ ...prev, brand: "Apple", category: "SMARTPHONE" }));
                        } else if (tab.id === "ANDROID") {
                          setFilterState((prev) => ({ ...prev, category: "SMARTPHONE", brand: "ALL" }));
                        } else if (tab.id === "GAMING") {
                          setFilterState((prev) => ({ ...prev, searchQuery: "gaming" }));
                        }
                        setActiveTab("list");
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition ${styles.freqTabInactive} hover:scale-102`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── BANNER AJAKAN TUKAR TAMBAH / JUAL HP BEKAS ── */}
              <div className="pt-1">
                <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />
              </div>

              {/* SLIDER UNIT PILIHAN TELEMETRI */}
              {spotlightProducts.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
                      UNIT TELEMETRI REKOMENDASI
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400/80">
                      TIER 1 BENCHMARK
                    </span>
                  </div>

                  <div className={`flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 ${styles.noScrollbar}`}>
                    {spotlightProducts.map((p) => {
                      const detailUrl = isMockup
                        ? "#"
                        : `/${store.slug}/product/${p.id}`;
                      const buyWaUrl = getProductWaUrl(p);

                      return (
                        <div
                          key={p.id}
                          className={`w-[170px] sm:w-[185px] shrink-0 rounded-2xl p-3 flex flex-col justify-between ${styles.hudCardInteractive} ${styles.hudCornerBracket}`}
                        >
                          <div>
                            {/* Gambar Produk 1:1 */}
                            <a
                              href={detailUrl}
                              onClick={(e) => {
                                if (isMockup) e.preventDefault();
                              }}
                            >
                              <div className="w-full aspect-square rounded-xl bg-slate-950 border border-cyan-500/20 p-2 flex items-center justify-center overflow-hidden mb-2.5 relative">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <Smartphone className="w-8 h-8 text-cyan-800" />
                                )}

                                {p.batteryHealth != null && (
                                  <span
                                    className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-0.5 ${styles.bhBadge}`}
                                  >
                                    <Zap className="w-2.5 h-2.5 text-amber-400" />
                                    <span>BH {p.batteryHealth}%</span>
                                  </span>
                                )}
                              </div>
                            </a>

                            <div className="space-y-1">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] ${styles.telemetryBadge}`}
                              >
                                {p.brand}
                              </span>

                              <a
                                href={detailUrl}
                                onClick={(e) => {
                                  if (isMockup) e.preventDefault();
                                }}
                              >
                                <h4 className="font-mono font-bold text-xs text-white line-clamp-2 leading-snug hover:text-cyan-300 transition">
                                  {p.name}
                                </h4>
                              </a>

                              <p className="text-[10px] font-mono text-cyan-200/70 line-clamp-1">
                                {p.ramRom} · {p.condition}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-1">
                            <div>
                              <div className="text-[8px] font-mono uppercase text-slate-400 leading-none">
                                VALUATION
                              </div>
                              <div className="text-xs font-mono font-black text-cyan-400">
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
                              className={`px-2.5 py-1 rounded-lg text-[10px] ${styles.cyanGlowBtn}`}
                            >
                              ORDER
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════ TAB 2: KATALOG LENGKAP ══════════ */}
          {activeTab === "list" && (
            <div className="space-y-3 text-left">
              {/* Bilah Filter Frekuensi Sticky */}
              <div className="sticky top-[61px] z-30 bg-[#050b14]/95 backdrop-blur-md border-b border-cyan-950/80 px-4 py-3">
                <ProductFilterBar
                  products={displayProducts}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onReset={handleResetFilters}
                  theme="cyber-hud"
                  isDark={true}
                  totalFilteredCount={filteredProducts.length}
                />
              </div>

              {/* Grid Produk Cyber HUD */}
              <div className="p-4 space-y-4">
                <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />
                <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map((p) => {
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
                  const buyWaUrl = getProductWaUrl(p);

                  return (
                    <div
                      key={p.id}
                      className={`rounded-2xl p-3 flex flex-col justify-between ${styles.hudCardInteractive} ${styles.hudCornerBracket}`}
                    >
                      <div>
                        {/* Area Foto */}
                        <Link
                          href={detailUrl}
                          onClick={(e) => {
                            if (isMockup) e.preventDefault();
                          }}
                          className="block"
                        >
                          <div className="w-full aspect-square rounded-xl bg-slate-950 border border-cyan-500/20 p-2 flex items-center justify-center overflow-hidden mb-2 relative">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <Smartphone className="w-8 h-8 text-cyan-800" />
                            )}

                            {p.batteryHealth != null && (
                              <span
                                className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[7.5px] flex items-center gap-0.5 ${styles.bhBadge}`}
                              >
                                <Zap className="w-2.5 h-2.5 text-amber-400" />
                                <span>BH {p.batteryHealth}%</span>
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Title & Brand */}
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] ${styles.telemetryBadge}`}
                          >
                            {p.brand}
                          </span>

                          <Link
                            href={detailUrl}
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                          >
                            <h3 className="font-mono font-bold text-xs text-white line-clamp-2 leading-snug hover:text-cyan-300 transition">
                              {p.name}
                            </h3>
                          </Link>

                          <p className="text-[10px] font-mono text-cyan-200/70 line-clamp-1">
                            {p.ramRom} · {p.condition}
                          </p>
                        </div>
                      </div>

                      {/* Harga & Tombol Order WA */}
                      <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between gap-1">
                        <div>
                          <div className="text-[8px] font-mono uppercase text-slate-400 leading-none">
                            VALUATION
                          </div>
                          <div className="text-xs font-mono font-black text-cyan-400">
                            {formatRupiah(p.price)}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isMockup) window.open(buyWaUrl, "_blank");
                          }}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${styles.cyanGlowBtn}`}
                          title="Transmit Order via WA"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="col-span-2">
                    <ProductEmptyState
                      storeName={store.name}
                      storeWhatsapp={store.whatsapp}
                      onReset={handleResetFilters}
                      isDark={true}
                    />
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: TRADE-IN ══════════ */}
          {activeTab === "trade-in" && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono font-black uppercase tracking-wider">
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  <span>HARDWARE VALUATION TERMINAL</span>
                </div>
                <h2 className="text-lg font-mono font-black text-white tracking-tight">
                  Taksiran Telemetri Tukar Tambah
                </h2>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  Input spesifikasi HP lama Anda. Sistem kami melakukan taksiran benchmark harga tertinggi se-Bandung.
                </p>
              </div>

              {tiSuccess ? (
                <div className={`rounded-2xl p-6 text-center space-y-3 ${styles.hudCard}`}>
                  <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto" />
                  <h3 className="font-mono font-black text-sm text-white">
                    TELEMETRY TRANSMITTED SUCCESSFULLY!
                  </h3>
                  <p className="text-xs font-mono text-slate-300">
                    Draft spesifikasi telah dialihkan ke WhatsApp kasir {store.name}.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTiSuccess(false)}
                    className={`mt-2 px-4 py-2 rounded-xl text-xs ${styles.cyanOutlineBtn}`}
                  >
                    SUBMIT ANOTHER NODE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTradeInSubmit} className={`rounded-2xl p-4 sm:p-5 space-y-3.5 ${styles.hudCard} ${styles.hudCornerBracket}`}>
                  {tiError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{tiError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                      PILOT / CUSTOMER NAME *
                    </label>
                    <input
                      type="text"
                      required
                      value={tiCustomerName}
                      onChange={(e) => setTiCustomerName(e.target.value)}
                      placeholder="CONTOH: ALEX CYBERNETICS"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                      WHATSAPP TELEMETRY CONTACT *
                    </label>
                    <input
                      type="tel"
                      required
                      value={tiCustomerWa}
                      onChange={(e) => setTiCustomerWa(e.target.value)}
                      placeholder="081234567890"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        DEVICE MODEL *
                      </label>
                      <input
                        type="text"
                        required
                        value={tiPhoneModel}
                        onChange={(e) => setTiPhoneModel(e.target.value)}
                        placeholder="Contoh: ROG Phone 8"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        RAM / STORAGE
                      </label>
                      <input
                        type="text"
                        value={tiRamRom}
                        onChange={(e) => setTiRamRom(e.target.value)}
                        placeholder="16GB / 512GB"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        PHYSICAL GRADE
                      </label>
                      <select
                        value={tiCondition}
                        onChange={(e) => setTiCondition(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      >
                        <option value="98% Mulus Like New">98% Mulus Like New</option>
                        <option value="95% Mulus Pemakaian">95% Mulus Pemakaian</option>
                        <option value="90% Bekas Wajar">90% Bekas Wajar</option>
                        <option value="Ada Minus Fisik / Dent">Ada Minus Fisik / Dent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        BATTERY HEALTH (%)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={tiBatteryHealth}
                        onChange={(e) => setTiBatteryHealth(e.target.value)}
                        placeholder="88"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        IMEI STATUS
                      </label>
                      <select
                        value={tiImeiStatus}
                        onChange={(e) => setTiImeiStatus(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      >
                        <option value="Resmi iBox / Kemenperin">Resmi iBox / Kemenperin</option>
                        <option value="Resmi SEIN">Resmi SEIN</option>
                        <option value="Bea Cukai Terdaftar">Bea Cukai Terdaftar</option>
                        <option value="WiFi Only">WiFi Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                        PACKAGE SPECS
                      </label>
                      <select
                        value={tiCompleteness}
                        onChange={(e) => setTiCompleteness(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                      >
                        <option value="Fullset Box Original">Fullset Box Original</option>
                        <option value="Fullset Dus OEM">Fullset Dus OEM</option>
                        <option value="Unit Only (Batangan)">Unit Only (Batangan)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                      EXPECTED VALUATION (RP)
                    </label>
                    <input
                      type="text"
                      value={tiExpectedPrice}
                      onChange={(e) => setTiExpectedPrice(e.target.value)}
                      placeholder="Contoh: 8500000"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold text-cyan-200 mb-1">
                      DIAGNOSTIC MINUS NOTES (IF ANY)
                    </label>
                    <textarea
                      rows={2}
                      value={tiMinusNotes}
                      onChange={(e) => setTiMinusNotes(e.target.value)}
                      placeholder="Informasikan detail minus jika ada..."
                      className={`w-full px-3 py-2 rounded-xl text-xs resize-none ${styles.hudInput}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tiLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${styles.cyanGlowBtn}`}
                  >
                    {tiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>TRANSMIT VALUATION TO WHATSAPP</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════ TAB 4: TOKO / ABOUT ══════════ */}
          {activeTab === "about" && (
            <div className="p-4 space-y-4">
              {/* Foto Physical Node */}
              <div className={`rounded-2xl overflow-hidden ${styles.hudCard} ${styles.hudCornerBracket}`}>
                <div className="aspect-video w-full relative bg-slate-950">
                  <img
                    src={
                      store.storeImage ||
                      store.bannerUrl ||
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"
                    }
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050914] via-black/40 to-transparent flex flex-col justify-end p-4">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-mono text-[9px] font-bold uppercase inline-block self-start mb-1">
                      VERIFIED PHYSICAL NODE BANDUNG // BEC LEVEL 1
                    </span>
                    <h2 className="text-lg font-mono font-black text-white">{store.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-0.5">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold ml-1 text-white">{averageRating}</span>
                      </div>
                      <span>•</span>
                      <span>{totalReviews > 0 ? `${totalReviews} LOG REVIEWS` : "HIGH-FPS AUTHORIZED HUB"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hotline WhatsApp Kasir */}
              <div className={`rounded-2xl p-4 space-y-2 ${styles.hudCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono font-black text-xs text-white">
                    <MessageCircle className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                    <span>OPERATOR HOTLINE & WHATSAPP TERMINAL</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    REALTIME RESPONSE
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-300">
                  Konfirmasi stok unit etalase BEC atau negosiasi taksiran tukar tambah langsung dengan teknisi toko.
                </p>
                <a
                  href={isMockup ? "#" : waUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (isMockup) e.preventDefault();
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ${styles.cyanGlowBtn}`}
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>TRANSMIT CHAT VIA WHATSAPP</span>
                </a>
              </div>

              {/* Jam Operasional Node */}
              <div className={`rounded-2xl p-4 space-y-2 ${styles.hudCard}`}>
                <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                  <div className="flex items-center gap-2 font-mono font-black text-xs text-white">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>NODE OPERATIONAL HOURS</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    ACTIVE NOW
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-white">
                  {store.operationalHours || "Setiap Hari: 10:00 - 20:30 WIB"}
                </p>
                <p className="text-[11px] font-mono text-slate-300">
                  Melayani COD konter BEC Bandung, trade-in instan, dan kurir kilat Bandung Raya.
                </p>
              </div>

              {/* Alamat Fisik Node */}
              <div className={`rounded-2xl p-4 space-y-2.5 ${styles.hudCard}`}>
                <div className="flex items-center gap-2 font-mono font-black text-xs text-white border-b border-cyan-900/40 pb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{mainBranch ? mainBranch.name : "COORDINATES / BEC STORE ADDRESS"}</span>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed">
                  {mainBranch
                    ? mainBranch.address
                    : store.address ||
                      "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung"}
                </p>
                <a
                  href={isMockup ? "#" : defaultMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (isMockup) e.preventDefault();
                  }}
                  className={`w-full py-2 rounded-xl text-xs flex items-center justify-center gap-2 ${styles.cyanOutlineBtn}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>TRANSMIT RADAR MAPS (GOOGLE MAPS)</span>
                </a>
              </div>

              {/* Jaminan & Klausul Garansi */}
              <div className={`rounded-2xl p-4 space-y-2.5 ${styles.hudCard}`}>
                <div className="flex items-center gap-2 font-mono font-black text-xs text-white border-b border-cyan-900/40 pb-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>TELEMETRY WARRANTY & GUARANTEES</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300">
                      <b className="text-white">Garansi Toko Resmi 30 Hari:</b>{" "}
                      {store.warrantyPolicy ||
                        "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300">
                      <b className="text-white">Bebas Blokir IMEI Seumur Hidup:</b>{" "}
                      Seluruh unit berstatus resmi iBox, SEIN, atau Kemenperin terverifikasi 100%.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300">
                      <b className="text-white">Free Data Transfer di Konter:</b>{" "}
                      Didampingi teknisi berpengalaman untuk migrasi game data, WhatsApp, dan Google/Apple ID.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Log */}
              <div className={`rounded-2xl p-4 space-y-3 ${styles.hudCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono font-black text-xs text-white">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>NODE REPUTATION & LOG REVIEWS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-white">
                      ★ {averageRating}
                    </span>
                    {store.tier !== "STARTER" && (
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] ${styles.cyanGlowBtn}`}
                      >
                        + SUBMIT REVIEW
                      </button>
                    )}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border border-cyan-900/40 bg-slate-950/70 space-y-1 font-mono"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          {rev.purchasedUnit && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 truncate max-w-[140px]">
                              UNIT: {rev.purchasedUnit}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-mono text-slate-300 leading-relaxed italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <div className="text-[10px] text-cyan-400 font-bold block pt-0.5">
                          // PILOT: {rev.customerName}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center space-y-1 border border-dashed border-cyan-900/50 font-mono">
                    <p className="text-xs text-slate-300">
                      NO LOG REVIEWS RECORDED YET. BE THE FIRST PILOT!
                    </p>
                    {store.tier !== "STARTER" && (
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="mt-1 text-xs font-bold text-cyan-400 hover:underline"
                      >
                        + SUBMIT NODE REVIEW NOW
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════
            FLOATING BOTTOM DOCK — Cockpit Telemetry
        ══════════════════════════════════════════════ */}
        {!hideDock && (
          <div
            className={`${
              isMockup
                ? "absolute bottom-3 left-3 right-3"
                : "fixed bottom-4 left-4 right-4 max-w-md mx-auto"
            } z-30 pointer-events-none flex justify-center`}
          >
            <nav
              className={`w-full max-w-sm rounded-full px-4 py-2.5 flex items-center justify-between pointer-events-auto select-none ${styles.cockpitDock}`}
            >
              {[
                { tab: "home" as StoreTabType, Icon: Home, label: "COCKPIT" },
                { tab: "list" as StoreTabType, Icon: Smartphone, label: "KATALOG" },
                { tab: "trade-in" as StoreTabType, Icon: RefreshCw, label: "VALUASI" },
                { tab: "about" as StoreTabType, Icon: StoreIcon, label: "NODE" },
              ].map(({ tab, Icon, label }) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-full transition-all duration-150 cursor-pointer ${
                      isActive
                        ? styles.dockActiveTab
                        : "text-slate-400 hover:text-cyan-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-mono leading-none font-bold">
                      {label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODAL: SUBMIT NODE REVIEW
      ══════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-2xl p-5 ${styles.hudCard} ${styles.hudCornerBracket} relative space-y-4`}>
            <div className="flex items-center justify-between border-b border-cyan-900/50 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="font-mono font-black text-sm text-white">
                  SUBMIT NODE REVIEW
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {revSuccess ? (
              <div className="p-4 rounded-xl bg-cyan-950/80 text-cyan-300 text-center space-y-2 border border-cyan-500/40 font-mono">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 mx-auto" />
                <p className="font-bold text-xs">REVIEW RECORDED TO TELEMETRY SYSTEM!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 font-mono">
                {revError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-300 border border-rose-500/40 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{revError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                    BENCHMARK RATING *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRevRating(s)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            s <= revRating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-white ml-2">
                      {revRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                    PILOT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    placeholder="Contoh: Raymond Cyber"
                    className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                    PURCHASED UNIT (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={revUnit}
                    onChange={(e) => setRevUnit(e.target.value)}
                    placeholder="Contoh: ASUS ROG Phone 8"
                    className={`w-full px-3 py-2 rounded-xl text-xs ${styles.hudInput}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                    EXPERIENCE LOG *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Tulis ulasan pengalaman transaksi unit di store ini..."
                    className={`w-full px-3 py-2 rounded-xl text-xs resize-none ${styles.hudInput}`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs ${styles.cyanOutlineBtn}`}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={revLoading}
                    className={`flex-1 py-2.5 rounded-xl text-xs ${styles.cyanGlowBtn}`}
                  >
                    {revLoading ? "TRANSMITTING..." : "SUBMIT REVIEW"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── TRADE-IN / SELL DEVICE MODAL ── */}
      <TradeInModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        store={store}
        products={displayProducts}
        theme="cyber-hud"
        isDark={true}
      />
    </div>
  );
}
