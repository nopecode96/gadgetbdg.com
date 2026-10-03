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
  Building2,
  X,
  BatteryCharging,
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
import styles from "./tokyo-street.module.css";

interface TokyoStreetLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function TokyoStreetLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: TokyoStreetLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const filterTabs = [
    { id: "ALL" as const, label: "Semua Unit" },
    { id: "APPLE" as const, label: "Apple" },
    { id: "ANDROID" as const, label: "Android" },
    { id: "FLAGSHIP" as const, label: "Street Flagship" },
  ];

  let cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
    store.name
  )},%20saya%20ingin%20tanya%20stok%20HP%20second%20bergaransi`;

  function getProductWaUrl(p: ProductData) {
    return `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
      store.name
    )},%20saya%20berminat%20unit%20*${encodeURIComponent(
      p.name
    )}*%20seharga%20*${formatRupiah(p.price)}*.%20Apakah%20masih%20tersedia?`;
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
          `Halo ${store.name}, saya ingin mengajukan penaksiran Trade-In:\n\nNama: ${tiCustomerName}\nUnit: ${tiPhoneModel} ${tiRamRom}\nKondisi: ${tiCondition}\nBattery Health: ${tiBatteryHealth}%\nIMEI: ${tiImeiStatus}\nKelengkapan: ${tiCompleteness}\nMinus: ${
            tiMinusNotes || "-"
          }\nHarga Harapan: ${tiExpectedPrice || "-"}\n\nMohon info estimasi taksiran terbaiknya. Terima kasih!`
        );
        if (!isMockup)
          window.open(`https://wa.me/${cleanWa}?text=${msg}`, "_blank");
      } else {
        setTiError(res.error || "Gagal mengirim formulir trade-in.");
      }
    } catch {
      setTiError("Terjadi kendala koneksi. Silakan coba kembali.");
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
      setRevError(res.error || "Gagal mengirimkan ulasan.");
    }
  }

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1)
      : "4.9";

  const mainBranch =
    store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const defaultMapsUrl =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address || store.name + " Bandung"
    )}`;

  return (
    <div
      className={`${styles.streetCanvas} ${
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
            HEADER — 1 Baris Ramping Tokyo Street
        ══════════════════════════════════════════════ */}
        <header className="sticky top-0 z-40 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-neutral-200">
          <div className="flex items-center justify-between gap-2.5 h-11">
            {/* Kiri: Brand & Logo */}
            <div
              className="flex items-center gap-2.5 min-w-0 cursor-pointer select-none"
              onClick={() => {
                setActiveTab("home");
                if (typeof window !== "undefined")
                  window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {store.logoUrl ? (
                <div className="w-8 h-8 rounded-lg border border-neutral-900 overflow-hidden shrink-0 bg-neutral-100">
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg border border-neutral-900 bg-neutral-950 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {store.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-xs tracking-tight text-neutral-950 uppercase truncate">
                    {store.name}
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <div className="text-[9px] font-bold text-neutral-600 truncate">
                  TOKYO URBAN SPEC · COD READY
                </div>
              </div>
            </div>

            {/* Kanan: Search Toggle & Direct WhatsApp */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${
                  isSearchOpen || filterState.searchQuery
                    ? "bg-neutral-950 text-white border-neutral-950"
                    : "bg-white text-neutral-950 border-neutral-300 hover:border-neutral-950"
                }`}
                title="Cari Unit"
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
                className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs ${styles.vermilionButton}`}
                title="Chat WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>WA</span>
              </a>
            </div>
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="pt-2.5 pb-1 animate-in fade-in duration-150">
              <div className="rounded-xl px-3 py-2 flex items-center gap-2 bg-neutral-100 border border-neutral-300 focus-within:border-neutral-900 focus-within:bg-white transition">
                <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={filterState.searchQuery}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                    if (activeTab !== "list" && activeTab !== "home")
                      setActiveTab("list");
                  }}
                  placeholder="Cari iPhone, spesifikasi, atau RAM..."
                  className="w-full bg-transparent text-xs font-semibold text-neutral-950 placeholder-neutral-400 focus:outline-none"
                />
                {filterState.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                    className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-[10px] font-bold"
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
              {/* HERO BANNER: URBAN EDITORIAL */}
              <div className={`rounded-2xl p-5 sm:p-6 ${styles.urbanHero}`}>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-200 border border-neutral-700 text-[9px] font-black tracking-wider uppercase">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>TOKYO URBAN SPEC · BEBAS BLOKIR & GARANSI 30 HARI</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                    KURASI SMARTPHONE FLAGSHIP TERVERIFIKASI
                  </h2>

                  <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                    Setiap unit melalui 30 titik inspeksi ketat. Bebas blokir IMEI seumur hidup, siap COD Bandung atau kirim instan.
                  </p>

                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("list")}
                      className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 ${styles.vermilionButton}`}
                    >
                      <span>Jelajahi Katalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("trade-in")}
                      className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 ${styles.monoButton}`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Tukar Tambah</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 🎯 FILTER KOLEKSI CEPAT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-tight text-neutral-950 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                    <span>Filter Koleksi Cepat</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="text-[11px] font-bold text-rose-700 hover:underline"
                  >
                    Buka Semua ({displayProducts.length}) →
                  </button>
                </div>

                <div className={`flex items-center gap-2 overflow-x-auto pb-1 ${styles.noScrollbar}`}>
                  {filterTabs.map((tab) => (
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
                        } else if (tab.id === "FLAGSHIP") {
                          setFilterState((prev) => ({ ...prev, sort: "PRICE_DESC" }));
                        }
                        setActiveTab("list");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs whitespace-nowrap transition ${styles.pillInactive} hover:scale-102`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SLIDER UNIT REKOMENDASI */}
              {spotlightProducts.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-950">
                      Rekomendasi Minggu Ini
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500">
                      GRADE A+ TERUJI
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
                          className={`w-[170px] sm:w-[185px] shrink-0 rounded-2xl p-3 flex flex-col justify-between ${styles.boxCardInteractive}`}
                        >
                          <div>
                            {/* Gambar 1:1 Kontainer */}
                            <a
                              href={detailUrl}
                              onClick={(e) => {
                                if (isMockup) e.preventDefault();
                              }}
                            >
                              <div className="w-full aspect-square rounded-xl bg-neutral-100 border border-neutral-200/80 p-2 flex items-center justify-center overflow-hidden mb-2.5 relative">
                                {p.images?.[0] ? (
                                  <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <Smartphone className="w-8 h-8 text-neutral-400" />
                                )}

                                {p.batteryHealth != null && (
                                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[8px] font-black flex items-center gap-0.5 shadow-xs">
                                    <Zap className="w-2.5 h-2.5 text-amber-700" />
                                    <span>BH {p.batteryHealth}%</span>
                                  </span>
                                )}
                              </div>
                            </a>

                            <div className="space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-300 inline-block">
                                {p.brand}
                              </span>

                              <a
                                href={detailUrl}
                                onClick={(e) => {
                                  if (isMockup) e.preventDefault();
                                }}
                              >
                                <h4 className="font-extrabold text-xs text-neutral-950 line-clamp-2 leading-snug hover:text-rose-700 transition">
                                  {p.name}
                                </h4>
                              </a>

                              <p className="text-[10px] font-medium text-neutral-600 line-clamp-1">
                                {p.ramRom} · {p.condition}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between gap-1">
                            <div>
                              <div className="text-[8px] font-bold uppercase text-neutral-500 leading-none">
                                Harga
                              </div>
                              <div className="text-xs font-black text-rose-700">
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
                              className={`px-2.5 py-1 rounded-lg text-[10px] ${styles.vermilionButton}`}
                            >
                              WA
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
              {/* Sticky Top Filter Bar */}
              <div className="sticky top-[61px] z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 py-3">
                <ProductFilterBar
                  products={displayProducts}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onReset={handleResetFilters}
                  theme="tokyo-street"
                  totalFilteredCount={filteredProducts.length}
                />
              </div>

              {/* Grid Produk */}
              <div className="p-4 grid grid-cols-2 gap-3">
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
                      className={`rounded-2xl p-3 flex flex-col justify-between ${styles.boxCardInteractive}`}
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
                          <div className="w-full aspect-square rounded-xl bg-neutral-100 border border-neutral-200/80 p-2 flex items-center justify-center overflow-hidden mb-2 relative">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <Smartphone className="w-8 h-8 text-neutral-400" />
                            )}

                            {p.batteryHealth != null && (
                              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[7.5px] font-black flex items-center gap-0.5 shadow-xs">
                                <Zap className="w-2.5 h-2.5 text-amber-700" />
                                <span>BH {p.batteryHealth}%</span>
                              </span>
                            )}
                          </div>
                        </Link>

                        {/* Title & Brand */}
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-300 inline-block">
                            {p.brand}
                          </span>

                          <Link
                            href={detailUrl}
                            onClick={(e) => {
                              if (isMockup) e.preventDefault();
                            }}
                          >
                            <h3 className="font-extrabold text-xs text-neutral-950 line-clamp-2 leading-snug hover:text-rose-700 transition">
                              {p.name}
                            </h3>
                          </Link>

                          <p className="text-[10px] font-medium text-neutral-600 line-clamp-1">
                            {p.ramRom} · {p.condition}
                          </p>
                        </div>
                      </div>

                      {/* Harga & Tombol Order WA */}
                      <div className="mt-3 pt-2 border-t border-neutral-200 flex items-center justify-between gap-1">
                        <div>
                          <div className="text-[8px] font-bold uppercase text-neutral-500 leading-none">
                            Harga
                          </div>
                          <div className="text-xs font-black text-rose-700">
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
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${styles.vermilionButton}`}
                          title="Order via WhatsApp"
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
                      isDark={false}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: TRADE-IN ══════════ */}
          {activeTab === "trade-in" && (
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-950 text-white text-[9px] font-black uppercase tracking-wider">
                  <RefreshCw className="w-3 h-3 text-rose-500" />
                  <span>Inspeksi Retail Tokyo</span>
                </div>
                <h2 className="text-lg font-black text-neutral-950 tracking-tight">
                  Formulir Taksiran Tukar Tambah
                </h2>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
                  Dapatkan penawaran taksir tertinggi untuk HP lamamu. Data tersimpan di sistem toko dan terhubung langsung ke WhatsApp.
                </p>
              </div>

              {tiSuccess ? (
                <div className={`rounded-2xl p-6 text-center space-y-3 ${styles.boxCard}`}>
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-black text-sm text-neutral-950">
                    Formulir Berhasil Dikirim!
                  </h3>
                  <p className="text-xs font-medium text-neutral-700">
                    WhatsApp kasir {store.name} telah disiapkan dengan draf spesifikasi HP Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => setTiSuccess(false)}
                    className={`mt-2 px-4 py-2 rounded-xl text-xs ${styles.monoButton}`}
                  >
                    Ajukan Unit Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTradeInSubmit} className={`rounded-2xl p-4 sm:p-5 space-y-3.5 ${styles.boxCard}`}>
                  {tiError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{tiError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Nama Lengkap Pemilik *
                    </label>
                    <input
                      type="text"
                      required
                      value={tiCustomerName}
                      onChange={(e) => setTiCustomerName(e.target.value)}
                      placeholder="Contoh: Kenji Takahashi"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={tiCustomerWa}
                      onChange={(e) => setTiCustomerWa(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        Merk & Tipe HP *
                      </label>
                      <input
                        type="text"
                        required
                        value={tiPhoneModel}
                        onChange={(e) => setTiPhoneModel(e.target.value)}
                        placeholder="Contoh: iPhone 13 Pro"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        RAM / Storage
                      </label>
                      <input
                        type="text"
                        value={tiRamRom}
                        onChange={(e) => setTiRamRom(e.target.value)}
                        placeholder="Contoh: 6GB / 128GB"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        Kondisi Fisik
                      </label>
                      <select
                        value={tiCondition}
                        onChange={(e) => setTiCondition(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      >
                        <option value="98% Mulus Like New">98% Mulus Like New</option>
                        <option value="95% Mulus Pemakaian">95% Mulus Pemakaian</option>
                        <option value="90% Bekas Wajar">90% Bekas Wajar</option>
                        <option value="Ada Minus Fisik / Dent">Ada Minus Fisik / Dent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        Battery Health (%)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={tiBatteryHealth}
                        onChange={(e) => setTiBatteryHealth(e.target.value)}
                        placeholder="Contoh: 88"
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        Legalitas IMEI
                      </label>
                      <select
                        value={tiImeiStatus}
                        onChange={(e) => setTiImeiStatus(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      >
                        <option value="Resmi iBox / Kemenperin">Resmi iBox / Kemenperin</option>
                        <option value="Resmi SEIN">Resmi SEIN</option>
                        <option value="Bea Cukai Terdaftar">Bea Cukai Terdaftar</option>
                        <option value="WiFi Only">WiFi Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                        Kelengkapan
                      </label>
                      <select
                        value={tiCompleteness}
                        onChange={(e) => setTiCompleteness(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                      >
                        <option value="Fullset Box Original">Fullset Box Original</option>
                        <option value="Fullset Dus OEM">Fullset Dus OEM</option>
                        <option value="Unit Only (Batangan)">Unit Only (Batangan)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Ekspektasi Harga Taksiran (Rp)
                    </label>
                    <input
                      type="text"
                      value={tiExpectedPrice}
                      onChange={(e) => setTiExpectedPrice(e.target.value)}
                      placeholder="Contoh: 6500000"
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Catatan Kejujuran Minus (Jika Ada)
                    </label>
                    <textarea
                      rows={2}
                      value={tiMinusNotes}
                      onChange={(e) => setTiMinusNotes(e.target.value)}
                      placeholder="Contoh: Layar lecet halus, True Tone off, kelengkapan kabel non-ori..."
                      className={`w-full px-3 py-2 rounded-xl text-xs resize-none ${styles.tokyoInput}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tiLoading}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${styles.vermilionButton}`}
                  >
                    {tiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Formulir Taksiran ke WhatsApp</span>
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
              {/* Foto Toko Fisik */}
              <div className={`rounded-2xl overflow-hidden ${styles.boxCard}`}>
                <div className="aspect-video w-full relative bg-neutral-900">
                  <img
                    src={
                      store.storeImage ||
                      store.bannerUrl ||
                      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"
                    }
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-4">
                    <span className="px-2 py-0.5 rounded-md bg-white text-neutral-950 font-black text-[9px] uppercase tracking-wider inline-block self-start mb-1">
                      VERIFIED MERCHANT BANDUNG
                    </span>
                    <h2 className="text-lg font-black text-white">{store.name}</h2>
                    <div className="flex items-center gap-2 text-xs text-neutral-300 font-medium mt-0.5">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-black ml-1 text-white">{averageRating}</span>
                      </div>
                      <span>•</span>
                      <span>{totalReviews > 0 ? `${totalReviews} Ulasan Pembeli` : "Spesialis HP Second Original"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kontak WhatsApp Kasir */}
              <div className={`rounded-2xl p-4 space-y-2 ${styles.boxCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-xs text-neutral-950">
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>Kontak Kasir & Hotline Toko</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Fast Response
                  </span>
                </div>
                <p className="text-xs font-medium text-neutral-700">
                  Konsultasi ketersediaan unit di etalase atau tawar harga langsung dengan kasir toko.
                </p>
                <a
                  href={isMockup ? "#" : waUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (isMockup) e.preventDefault();
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 ${styles.vermilionButton}`}
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat Kasir Toko via WhatsApp</span>
                </a>
              </div>

              {/* Jam Operasional */}
              <div className={`rounded-2xl p-4 space-y-2 ${styles.boxCard}`}>
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div className="flex items-center gap-2 font-black text-xs text-neutral-950">
                    <Clock className="w-4 h-4 text-neutral-800" />
                    <span>Jam Operasional Toko</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Buka Hari Ini
                  </span>
                </div>
                <p className="text-xs font-bold text-neutral-950">
                  {store.operationalHours || "Setiap Hari: 10:00 - 20:30 WIB"}
                </p>
                <p className="text-[11px] font-medium text-neutral-600">
                  Melayani COD konter, tukar tambah, dan pengiriman kurir instan Bandung Raya.
                </p>
              </div>

              {/* Alamat Fisik Markas Toko */}
              <div className={`rounded-2xl p-4 space-y-2.5 ${styles.boxCard}`}>
                <div className="flex items-center gap-2 font-black text-xs text-neutral-950 border-b border-neutral-100 pb-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <span>{mainBranch ? mainBranch.name : "Alamat Konter Resmi"}</span>
                </div>
                <p className="text-xs font-medium text-neutral-700 leading-relaxed">
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
                  className={`w-full py-2 rounded-xl text-xs flex items-center justify-center gap-2 ${styles.monoButton}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Petunjuk Arah (Google Maps)</span>
                </a>
              </div>

              {/* Klausul Garansi & Jaminan Transaksi */}
              <div className={`rounded-2xl p-4 space-y-2.5 ${styles.boxCard}`}>
                <div className="flex items-center gap-2 font-black text-xs text-neutral-950 border-b border-neutral-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Garansi & Jaminan Transaksi</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-neutral-700 font-medium">
                      <b className="text-neutral-950 font-bold">Garansi Toko Resmi:</b>{" "}
                      {store.warrantyPolicy ||
                        "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup."}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-neutral-700 font-medium">
                      <b className="text-neutral-950 font-bold">Bebas Blokir IMEI Seumur Hidup:</b>{" "}
                      Semua unit berstatus resmi iBox, SEIN, atau Bea Cukai resmi.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-neutral-700 font-medium">
                      <b className="text-neutral-950 font-bold">Gratis Pindah Data di Konter:</b>{" "}
                      Didampingi kasir berpengalaman untuk transfer WhatsApp, foto, dan akun.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ulasan & Reputasi Pembeli */}
              <div className={`rounded-2xl p-4 space-y-3 ${styles.boxCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-neutral-950">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Reputasi & Ulasan Pembeli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-neutral-950">
                      ★ {averageRating}
                    </span>
                    {store.tier !== "STARTER" && (
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] ${styles.vermilionButton}`}
                      >
                        + Tulis Ulasan
                      </button>
                    )}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          {rev.purchasedUnit && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-800 truncate max-w-[140px]">
                              Unit: {rev.purchasedUnit}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-neutral-800 leading-relaxed italic">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <div className="text-[10px] text-neutral-500 font-bold block pt-0.5">
                          — {rev.customerName}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl text-center space-y-1 border border-dashed border-neutral-300">
                    <p className="text-xs font-medium text-neutral-700">
                      Belum ada ulasan untuk toko ini. Jadilah pembeli pertama!
                    </p>
                    {store.tier !== "STARTER" && (
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="mt-1 text-xs font-bold text-rose-700 hover:underline"
                      >
                        + Tulis Ulasan Toko Sekarang
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════
            FLOATING BOTTOM DOCK — Minimalist Tokyo
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
              className={`w-full max-w-sm rounded-full px-4 py-2.5 flex items-center justify-between pointer-events-auto select-none ${styles.minimalBottomDock}`}
            >
              {[
                { tab: "home" as StoreTabType, Icon: Home, label: "Home" },
                { tab: "list" as StoreTabType, Icon: Smartphone, label: "Katalog" },
                { tab: "trade-in" as StoreTabType, Icon: RefreshCw, label: "Trade-In" },
                { tab: "about" as StoreTabType, Icon: StoreIcon, label: "Toko" },
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
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] leading-none font-bold">
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
          MODAL: TULIS ULASAN TOKO
      ══════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl p-5 bg-white border border-neutral-300 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="font-black text-sm text-neutral-950">
                  Tulis Ulasan Toko
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-neutral-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {revSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-xs">Ulasan berhasil dicatat!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {revError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{revError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                    Bintang Penilaian *
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
                              : "text-neutral-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-neutral-900 ml-2">
                      {revRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                    Nama Anda *
                  </label>
                  <input
                    type="text"
                    required
                    value={revName}
                    onChange={(e) => setRevName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                    Unit yang Dibeli (Opsional)
                  </label>
                  <input
                    type="text"
                    value={revUnit}
                    onChange={(e) => setRevUnit(e.target.value)}
                    placeholder="Contoh: iPhone 13 128GB Midnight"
                    className={`w-full px-3 py-2 rounded-xl text-xs ${styles.tokyoInput}`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                    Pengalaman Belanja *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Ceritakan kepuasan Anda belanja di konter ini..."
                    className={`w-full px-3 py-2 rounded-xl text-xs resize-none ${styles.tokyoInput}`}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className={`flex-1 py-2.5 rounded-xl text-xs ${styles.monoButton}`}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={revLoading}
                    className={`flex-1 py-2.5 rounded-xl text-xs ${styles.vermilionButton}`}
                  >
                    {revLoading ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
