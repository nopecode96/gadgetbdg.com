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
  Star,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  ExternalLink,
  Crown,
  Award,
  Gem,
  X,
  SlidersHorizontal,
  ChevronRight,
  BatteryCharging,
  Layers,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { formatRupiah } from "@/lib/utils";
import { getProductDetailUrl } from "@/lib/product-slug";
import { submitTradeInOfferAction } from "@/lib/actions/tradein-actions";
import { submitStoreReviewAction } from "@/lib/actions/review-actions";
import {
  ProductFilterBar,
  ProductEmptyState,
  ProductFilterState,
  filterAndSortProducts,
} from "@/components/storefront/ProductFilterBar";
import { TradeInModal, TradeInBanner } from "@/components/storefront/TradeInModal";
import styles from "./midnight-gold.module.css";

interface MidnightGoldLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function MidnightGoldLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: MidnightGoldLayoutProps) {
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
  const [tiCondition, setTiCondition] = useState("99% Like New Mint Condition");
  const [tiBatteryHealth, setTiBatteryHealth] = useState("90");
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

  const goldPills = [
    { id: "ALL" as const, label: "Semua Koleksi" },
    { id: "APPLE" as const, label: "Apple Pro" },
    { id: "ANDROID" as const, label: "Android Flagship" },
    { id: "SPECIALIST" as const, label: "Specialist & Fold" },
  ];

  let cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20Concierge%20${encodeURIComponent(
    store.name
  )},%20saya%20tertarik%20dengan%20koleksi%20flagship%20smartphone%20resmi%20toko`;

  function getProductWaUrl(p: ProductData) {
    return `https://wa.me/${cleanWa}?text=Halo%20Concierge%20${encodeURIComponent(
      store.name
    )},%20saya%20ingin%20reservasi%20unit%20*${encodeURIComponent(
      p.name
    )}*%20(${formatRupiah(p.price)}).%20Apakah%20unit%20masih%20tersedia%20untuk%20inspeksi%20COD?`;
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
        const draftMsg = encodeURIComponent(
          `Halo Concierge ${store.name},\nSaya baru mengajukan taksiran Private Trade-In via website:\n\n` +
            `• Nama: *${tiCustomerName}*\n` +
            `• Unit Saya: *${tiPhoneModel}* (${tiRamRom || "-"})\n` +
            `• Kondisi: ${tiCondition}\n` +
            `• Battery Health: ${tiBatteryHealth ? tiBatteryHealth + "%" : "-"}\n` +
            `• Status IMEI: ${tiImeiStatus}\n` +
            `• Kelengkapan: ${tiCompleteness}\n` +
            `• Ekspektasi Harga: ${tiExpectedPrice ? formatRupiah(Number(tiExpectedPrice.replace(/\D/g, ""))) : "-"}\n` +
            `• Minus/Catatan: ${tiMinusNotes || "Tidak ada"}\n\n` +
            `Mohon taksiran harga dan jadwal pengecekan unit di butik. Terima kasih.`
        );
        window.open(`https://wa.me/${cleanWa}?text=${draftMsg}`, "_blank");
      } else {
        setTiError(res.error || "Gagal mengirim formulir private trade-in.");
      }
    } catch (err: any) {
      setTiError(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setTiLoading(false);
    }
  }

  // --- Review Submit ---
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) {
      setReviews((prev) => [
        {
          id: "mock-" + Date.now(),
          customerName: revName || "Pembeli VIP",
          rating: revRating,
          comment: revComment,
          purchasedUnit: revUnit || "iPhone 15 Pro Max",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setRevSuccess(true);
      setShowReviewModal(false);
      return;
    }

    setRevLoading(true);
    setRevError(null);
    try {
      const res = await submitStoreReviewAction({
        storeId: store.id,
        customerName: revName,
        rating: revRating,
        comment: revComment,
        purchasedUnit: revUnit || undefined,
      });

      if (res.success && res.review) {
        setRevSuccess(true);
        setReviews((prev) => [res.review as any, ...prev]);
        setShowReviewModal(false);
        setRevName("");
        setRevUnit("");
        setRevComment("");
      } else {
        setRevError(res.error || "Gagal mengirim ulasan.");
      }
    } catch (err: any) {
      setRevError(err.message || "Terjadi kesalahan server.");
    } finally {
      setRevLoading(false);
    }
  }

  return (
    <div
      className={`${styles.luxuryCanvas} ${
        isMockup ? "min-h-full" : "min-h-screen"
      } relative flex flex-col font-sans select-none overflow-x-hidden`}
    >
      {/* ============================================================
          1. HEADER 1 BARIS RAMPING (MidnightGoldHeader)
          ============================================================ */}
      <header
        className={`sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 px-3.5 sm:px-5 py-2.5 transition-all duration-200`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Sisi Kiri: Logo + Ring Emas + Nama Toko + Status Dot */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[1.5px] shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.35)]">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Crown className="w-4 h-4 text-amber-300" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-50 font-black text-xs sm:text-sm tracking-wider uppercase truncate">
                  {store.name}
                </span>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-amber-400/80 font-medium truncate">
                <Gem className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                <span className="truncate">
                  {store.address ? store.address.split(",")[0] : "BEC BANDUNG"} • LUXURY SALON
                </span>
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Search Button + WhatsApp Gold CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsTradeInModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition"
              title="Tukar Tambah / Jual HP"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Tukar Tambah</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-xl transition ${
                isSearchOpen
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 border border-amber-500/25 text-slate-300 hover:text-amber-300 hover:border-amber-500/40"
              }`}
              title="Cari Koleksi"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className={`${styles.goldGlowBtn} px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Concierge</span>
            </a>
          </div>
        </div>

        {/* Dropdown Live Search */}
        {isSearchOpen && (
          <div className="pt-2 pb-1 border-t border-amber-500/20 mt-2">
            <div className="relative">
              <input
                type="text"
                value={filterState.searchQuery}
                onChange={(e) => {
                  setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                  if (activeTab !== "list" && activeTab !== "home") setActiveTab("list");
                }}
                placeholder="Cari tipe iPhone, Galaxy Ultra, atau spesifikasi..."
                className="w-full bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-medium"
                autoFocus
              />
              {filterState.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          MAIN BODY
          ============================================================ */}
      <main className="flex-1 pb-24">
        {/* ============================================================
            TAB 1: HOME (SALON SHOWCASE)
            ============================================================ */}
        {activeTab === "home" && (
          <div className="p-3.5 sm:p-5 space-y-5 max-w-4xl mx-auto w-full">
            {/* HERO BANNER LUXURY SHOWCASE */}
            <div className={`${styles.luxuryHero} rounded-2xl p-5 border border-amber-500/35 relative`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Crown className="w-3 h-3 text-amber-400" />
                  [THE LUXURY COLLECTION] CERTIFIED PRE-OWNED
                </span>
              </div>
              <h1 className="text-amber-50 font-black text-xl sm:text-2xl leading-tight tracking-tight mb-2">
                FLAGSHIP SMARTPHONE BERGARANSI RESMI TOKO
              </h1>
              <p className="text-slate-300 font-medium text-xs sm:text-sm leading-relaxed max-w-xl mb-4">
                Setiap unit dikurasi ketat melalui 30 titik inspeksi fisik & hardware. Jaminan bebas blokir IMEI seumur hidup, replace unit 30 hari, dan siap COD eksklusif di BEC Bandung.
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setActiveTab("list");
                  }}
                  className={`${styles.goldGlowBtn} px-4 py-2 rounded-xl text-xs flex items-center gap-2`}
                >
                  <span>Eksplorasi Koleksi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("trade-in")}
                  className={`${styles.goldOutlineBtn} px-4 py-2 rounded-xl text-xs flex items-center gap-2`}
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Private Trade-In Lounge</span>
                </button>
              </div>
            </div>

            {/* SMART FILTER KOLEKSI EKSKLUSIF */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-50 tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎯 Filter Koleksi Eksklusif</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("list")}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <span>Lihat Semua ({displayProducts.length})</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {goldPills.map((pill) => (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      if (pill.id === "ALL") {
                        setFilterState((prev) => ({ ...prev, category: "ALL", brand: "ALL" }));
                      } else if (pill.id === "APPLE") {
                        setFilterState((prev) => ({ ...prev, brand: "Apple", category: "SMARTPHONE" }));
                      } else if (pill.id === "ANDROID") {
                        setFilterState((prev) => ({ ...prev, category: "SMARTPHONE", brand: "ALL" }));
                      } else if (pill.id === "SPECIALIST") {
                        setFilterState((prev) => ({ ...prev, searchQuery: "Pro Max" }));
                      }
                      setActiveTab("list");
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black shrink-0 transition flex items-center gap-1.5 ${styles.goldRibbonInactive} hover:scale-102`}
                  >
                    <span>{pill.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── BANNER AJAKAN TUKAR TAMBAH / JUAL HP BEKAS ── */}
            <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />

            {/* CURATED HIGHLIGHTS GRID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-50 uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Koleksi Unggulan Siap COD</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  Grade A+ Teruji
                </span>
              </div>

              {spotlightProducts.length === 0 ? (
                <div className={`${styles.goldCard} rounded-2xl p-6 text-center text-slate-400 text-xs`}>
                  Koleksi unit sedang disiapkan oleh kurator toko.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {spotlightProducts.map((p) => {
                    const img =
                      Array.isArray(p.images) && p.images.length > 0
                        ? p.images[0]
                        : "/images/items/iphone-15-pro.png";
                    return (
                      <div
                        key={p.id}
                        className={`${styles.goldCardInteractive} rounded-2xl p-3 flex flex-col justify-between group`}
                      >
                        <Link
                          href={getProductDetailUrl(store.slug, p, store.isTenantHost)}
                          className="block relative space-y-2.5"
                        >
                          <div className="aspect-square rounded-xl bg-slate-950/80 p-2 flex items-center justify-center relative overflow-hidden border border-amber-500/15">
                            <img
                              src={img}
                              alt={p.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            {p.batteryHealth && (
                              <span
                                className={`absolute top-1.5 left-1.5 ${styles.bhBadge} px-1.5 py-0.5 rounded flex items-center gap-1`}
                              >
                                <BatteryCharging className="w-2.5 h-2.5 text-amber-400" />
                                <span>BH {p.batteryHealth}%</span>
                              </span>
                            )}
                            <span
                              className={`absolute top-1.5 right-1.5 ${styles.gradeBadge} px-1.5 py-0.5 rounded`}
                            >
                              {p.condition?.includes("99%") || p.condition?.includes("Like New")
                                ? "Grade A+"
                                : "Certified"}
                            </span>
                          </div>
                          <div>
                            <div className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider truncate">
                              {p.brand} • {p.ramRom}
                            </div>
                            <h3 className="text-amber-50 font-black text-xs sm:text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {p.name}
                            </h3>
                            <div className="text-amber-400 font-black text-sm mt-1">
                              {formatRupiah(p.price)}
                            </div>
                          </div>
                        </Link>
                        <div className="pt-2 mt-2 border-t border-amber-500/20">
                          <a
                            href={getProductWaUrl(p)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`${styles.goldGlowBtn} w-full py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1`}
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>Reservasi</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TRUST BANNER: BEC SALON & LEGALITAS */}
            <div className={`${styles.goldCard} rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-amber-50 font-black text-sm mb-0.5">
                    Private Inspection &amp; COD Bandung
                  </h4>
                  <p className="text-slate-300 font-medium text-xs leading-relaxed max-w-md">
                    Ingin melihat unit fisik langsung? Datang ke butik kami di BEC atau gunakan layanan COD khusus area Bandung Raya dengan jaminan unit original.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab("about")}
                className={`${styles.goldOutlineBtn} px-3.5 py-2 rounded-xl text-xs shrink-0 flex items-center gap-1.5`}
              >
                <span>Info Butik &amp; Ulasan</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: LIST / KATALOG (EXQUISITE INVENTORY)
            ============================================================ */}
        {activeTab === "list" && (
          <div className="p-3.5 sm:p-5 space-y-4 max-w-4xl mx-auto w-full">
            {/* BILAH FILTER STICKY */}
            <div className="sticky top-[53px] z-20 bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border border-amber-500/25 shadow-lg">
              <ProductFilterBar
                products={displayProducts}
                filterState={filterState}
                onFilterChange={setFilterState}
                onReset={handleResetFilters}
                theme="midnight-gold"
                isDark={true}
                totalFilteredCount={filteredProducts.length}
              />
            </div>

            {/* ── BANNER AJAKAN TUKAR TAMBAH / JUAL HP BEKAS ── */}
            <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />

            {/* PRODUCT GRID */}
            {filteredProducts.length === 0 ? (
              <ProductEmptyState
                storeName={store.name}
                storeWhatsapp={store.whatsapp}
                onReset={handleResetFilters}
                isDark={true}
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredProducts.map((p) => {
                  const img =
                    Array.isArray(p.images) && p.images.length > 0
                      ? p.images[0]
                      : "/images/items/iphone-15-pro.png";
                  return (
                    <div
                      key={p.id}
                      className={`${styles.goldCardInteractive} rounded-2xl p-3 flex flex-col justify-between group`}
                    >
                      <Link
                        href={getProductDetailUrl(store.slug, p, store.isTenantHost)}
                        className="block relative space-y-2.5"
                      >
                        <div className="aspect-square rounded-xl bg-slate-950/80 p-2 flex items-center justify-center relative overflow-hidden border border-amber-500/15">
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          {p.batteryHealth && (
                            <span
                              className={`absolute top-1.5 left-1.5 ${styles.bhBadge} px-1.5 py-0.5 rounded flex items-center gap-1`}
                            >
                              <BatteryCharging className="w-2.5 h-2.5 text-amber-400" />
                              <span>BH {p.batteryHealth}%</span>
                            </span>
                          )}
                          <span
                            className={`absolute top-1.5 right-1.5 ${styles.gradeBadge} px-1.5 py-0.5 rounded`}
                          >
                            {p.condition?.includes("99%") || p.condition?.includes("Like New")
                              ? "Grade A+"
                              : "Verified"}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] text-amber-400/90 font-bold uppercase tracking-wider truncate">
                            <span>{p.brand}</span>
                            <span>•</span>
                            <span className="truncate">{p.ramRom}</span>
                          </div>
                          <h3 className="text-amber-50 font-black text-xs sm:text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                            {p.name}
                          </h3>
                          <div className="text-amber-400 font-black text-sm mt-1">
                            {formatRupiah(p.price)}
                          </div>
                        </div>

                        {/* Specs Micro Pills */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-300">
                          <span className="bg-slate-950/80 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            {p.imeiStatus || "Resmi iBox"}
                          </span>
                          <span className="bg-slate-950/80 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            {p.completeness || "Fullset"}
                          </span>
                        </div>
                      </Link>

                      <div className="pt-2 mt-2 border-t border-amber-500/20">
                        <a
                          href={getProductWaUrl(p)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`${styles.goldGlowBtn} w-full py-1.5 rounded-lg text-[11px] flex items-center justify-center gap-1`}
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Pesan via WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 3: TRADE-IN (PRIVATE VALUATION LOUNGE)
            ============================================================ */}
        {activeTab === "trade-in" && (
          <div className="p-3.5 sm:p-5 space-y-5 max-w-2xl mx-auto w-full">
            <div className={`${styles.luxuryHero} rounded-2xl p-5 border border-amber-500/35 relative`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  VIP TRADE-IN VALUATION LOUNGE
                </span>
              </div>
              <h2 className="text-amber-50 font-black text-lg sm:text-xl leading-tight tracking-tight mb-1.5">
                Tukar Tambah Gadget Lama Anda ke Seri Flagship
              </h2>
              <p className="text-slate-300 font-medium text-xs leading-relaxed">
                Dapatkan estimasi valuasi terbaik berdasarkan kondisi fisik riil. Form ini otomatis terhubung ke sistem penaksiran butik dan draf pesan instan ke WhatsApp Concierge.
              </p>
            </div>

            {/* FORM TRADE-IN */}
            <div className={`${styles.goldCard} rounded-2xl p-4 sm:p-6 border border-amber-500/30`}>
              {tiSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-amber-50 font-black text-base">
                    Permintaan Valuasi Terkirim!
                  </h3>
                  <p className="text-slate-300 font-medium text-xs max-w-sm mx-auto">
                    Data Anda telah tercatat di sistem butik. Tim kurator kami sedang meninjau taksiran unit Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTiSuccess(false);
                      setTiCustomerName("");
                      setTiCustomerWa("");
                      setTiPhoneModel("");
                      setTiRamRom("");
                      setTiExpectedPrice("");
                      setTiMinusNotes("");
                    }}
                    className={`${styles.goldOutlineBtn} px-4 py-2 rounded-xl text-xs`}
                  >
                    Kirim Valuasi Unit Lain
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTradeInSubmit} className="space-y-4">
                  {tiError && (
                    <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{tiError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={tiCustomerName}
                        onChange={(e) => setTiCustomerName(e.target.value)}
                        placeholder="Contoh: Calvin Hartono"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Nomor WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={tiCustomerWa}
                        onChange={(e) => setTiCustomerWa(e.target.value)}
                        placeholder="081234567890"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Model HP yang Ingin Ditukar *
                      </label>
                      <input
                        type="text"
                        required
                        value={tiPhoneModel}
                        onChange={(e) => setTiPhoneModel(e.target.value)}
                        placeholder="Contoh: iPhone 13 Pro Max"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Kapasitas Memori (RAM / ROM)
                      </label>
                      <input
                        type="text"
                        value={tiRamRom}
                        onChange={(e) => setTiRamRom(e.target.value)}
                        placeholder="Contoh: 128GB / 256GB"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Kondisi Fisik
                      </label>
                      <select
                        value={tiCondition}
                        onChange={(e) => setTiCondition(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      >
                        <option value="99% Like New Mint Condition">99% Like New Mint Condition</option>
                        <option value="95% Mulus Lecet Pemakaian Halus">95% Mulus Lecet Halus</option>
                        <option value="90% Ada Dent / Baret Bezel">90% Ada Dent / Baret Bezel</option>
                        <option value="Perlu Perbaikan Fisik">Perlu Perbaikan Fisik</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Battery Health (%)
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={tiBatteryHealth}
                        onChange={(e) => setTiBatteryHealth(e.target.value)}
                        placeholder="Contoh: 88"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Status IMEI
                      </label>
                      <select
                        value={tiImeiStatus}
                        onChange={(e) => setTiImeiStatus(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      >
                        <option value="Resmi iBox / Kemenperin">Resmi iBox / Kemenperin</option>
                        <option value="Bea Cukai Permanen">Bea Cukai Permanen</option>
                        <option value="All Operator Whitelist">All Operator Whitelist</option>
                        <option value="Smartfren Only">Smartfren Only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Kelengkapan Unit
                      </label>
                      <select
                        value={tiCompleteness}
                        onChange={(e) => setTiCompleteness(e.target.value)}
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      >
                        <option value="Fullset Box Original">Fullset Box Original</option>
                        <option value="Unit + Kabel Charger">Unit + Kabel Charger</option>
                        <option value="Batangan / Unit Only">Batangan / Unit Only</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Ekspektasi Harga Taksiran (Rp)
                      </label>
                      <input
                        type="text"
                        value={tiExpectedPrice}
                        onChange={(e) => setTiExpectedPrice(e.target.value)}
                        placeholder="Contoh: 8.500.000"
                        className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                      Catatan Minus / Riwayat Pergantian Part
                    </label>
                    <textarea
                      rows={2}
                      value={tiMinusNotes}
                      onChange={(e) => setTiMinusNotes(e.target.value)}
                      placeholder="Contoh: Pernah ganti baterai di iBox service center resmi, kamera & TrueTone aktif normal."
                      className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={tiLoading}
                    className={`${styles.goldGlowBtn} w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2`}
                  >
                    {tiLoading ? (
                      <span>Mengirim Formulir Valuasi...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Valuasi &amp; Konsultasikan ke WhatsApp</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: ABOUT / TOKO (BUTIK & REPUTASI)
            ============================================================ */}
        {activeTab === "about" && (
          <div className="p-3.5 sm:p-5 space-y-5 max-w-3xl mx-auto w-full">
            {/* PHYSICAL NODE BANNER */}
            <div className={`${styles.luxuryHero} rounded-2xl p-5 border border-amber-500/35 relative space-y-3`}>
              {store.verifiedBadge && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Crown className="w-3 h-3 text-amber-400" />
                    CERTIFIED MERCHANT
                  </span>
                </div>
              )}
              <h2 className="text-amber-50 font-black text-xl leading-tight">
                {store.name}
              </h2>
              {store.address && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{store.address}</span>
                  </div>
                  {store.mapsUrl && (
                    <a
                      href={store.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold underline"
                    >
                      <span>Buka Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
              {store.operationalHours && (
                <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{store.operationalHours}</span>
                </div>
              )}
            </div>

            {/* THREE PILLARS OF LUXURY WARRANTY */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-50 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Standar Garansi &amp; Layanan Butik</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`${styles.goldCard} rounded-xl p-4 border border-amber-500/25 space-y-1.5`}>
                  <div className="text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>30 Hari Replace</span>
                  </div>
                  <p className="text-slate-300 font-medium text-xs leading-relaxed">
                    Garansi ganti unit 30 hari penuh apabila terdapat kendala fungsional non-human error.
                  </p>
                </div>

                <div className={`${styles.goldCard} rounded-xl p-4 border border-amber-500/25 space-y-1.5`}>
                  <div className="text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <Crown className="w-4 h-4" />
                    <span>IMEI Seumur Hidup</span>
                  </div>
                  <p className="text-slate-300 font-medium text-xs leading-relaxed">
                    Jaminan legalitas sinyal & IMEI permanen bebas blokir dengan perlindungan garansi toko.
                  </p>
                </div>

                <div className={`${styles.goldCard} rounded-xl p-4 border border-amber-500/25 space-y-1.5`}>
                  <div className="text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                    <Gem className="w-4 h-4" />
                    <span>Free Data Migration</span>
                  </div>
                  <p className="text-slate-300 font-medium text-xs leading-relaxed">
                    Layanan pindah data, transfer WhatsApp, dan pemasangan pelindung layar di butik tanpa biaya.
                  </p>
                </div>
              </div>
            </div>

            {/* REPUTASI & ULASAN PEMBELI */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-amber-50 uppercase tracking-wider">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Reputasi &amp; Ulasan Pembeli ({reviews.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className={`${styles.goldGlowBtn} px-3 py-1.5 rounded-xl text-xs flex items-center gap-1`}
                >
                  <Plus className="w-3 h-3" />
                  <span>Tulis Ulasan</span>
                </button>
              </div>

              {reviews.length === 0 ? (
                <div className={`${styles.goldCard} rounded-2xl p-6 text-center text-slate-400 text-xs`}>
                  Belum ada ulasan publik. Jadilah yang pertama memberikan ulasan pengalaman transaksi di butik kami.
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-amber-50 font-bold text-xs flex items-center gap-1.5">
                            <span>{rev.customerName}</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-black">
                              VERIFIED BUYER
                            </span>
                          </div>
                          {rev.purchasedUnit && (
                            <div className="text-[11px] text-amber-400/80 font-medium">
                              Unit: {rev.purchasedUnit}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-200 font-medium text-xs leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          FLOATING LUXURY DOCK
          ============================================================ */}
      {!hideDock && (
        <nav
          className={`${
            isMockup ? "absolute bottom-3 left-3 right-3" : "fixed bottom-4 left-4 right-4"
          } max-w-md mx-auto z-40 ${styles.luxuryDock} rounded-2xl px-3 py-2 flex items-center justify-around`}
        >
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center gap-1 text-[10px] transition ${
              activeTab === "home" ? styles.dockActiveTab : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="font-bold">Salon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`flex flex-col items-center gap-1 text-[10px] transition ${
              activeTab === "list" ? styles.dockActiveTab : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="font-bold">Koleksi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trade-in")}
            className={`flex flex-col items-center gap-1 text-[10px] transition ${
              activeTab === "trade-in" ? styles.dockActiveTab : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-bold">Trade-In</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`flex flex-col items-center gap-1 text-[10px] transition ${
              activeTab === "about" ? styles.dockActiveTab : "text-slate-400 hover:text-amber-300"
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span className="font-bold">Butik</span>
          </button>
        </nav>
      )}

      {/* ============================================================
          MODAL WRITE REVIEW
          ============================================================ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${styles.goldCard} rounded-2xl max-w-md w-full p-5 border border-amber-500/40 relative shadow-2xl`}>
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-amber-50 font-black text-sm">
                Tulis Ulasan Pengalaman Transaksi
              </h3>
            </div>

            {revError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
                {revError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Rating Bintang
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRevRating(s)}
                      className="p-1"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          s <= revRating
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="Contoh: Raymond Kusuma"
                  className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Unit yang Dibeli / Diinspeksi
                </label>
                <input
                  type="text"
                  value={revUnit}
                  onChange={(e) => setRevUnit(e.target.value)}
                  placeholder="Contoh: iPhone 15 Pro Max 256GB"
                  className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Ulasan &amp; Kesan Layanan *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  placeholder="Tuliskan pengalaman Anda mengenai kondisi unit, kecepatan pelayanan, atau proses COD..."
                  className={`w-full rounded-xl px-3 py-2 text-xs ${styles.luxuryInput}`}
                />
              </div>

              <button
                type="submit"
                disabled={revLoading}
                className={`${styles.goldGlowBtn} w-full py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 mt-4`}
              >
                {revLoading ? (
                  <span>Mengirim Ulasan...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim Ulasan Sekarang</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── TRADE-IN / SELL DEVICE MODAL ── */}
      <TradeInModal
        isOpen={isTradeInModalOpen}
        onClose={() => setIsTradeInModalOpen(false)}
        store={store}
        products={displayProducts}
        theme="midnight-gold"
        isDark={true}
      />
    </div>
  );
}
