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
  Cpu,
  MapPin,
  Clock,
  ExternalLink,
  Building2,
  X,
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
import styles from "./keynote-obsidian.module.css";

interface KeynoteObsidianLayoutProps {
  store: StoreData;
  products: ProductData[];
  isMockup?: boolean;
  hideDock?: boolean;
}

export function KeynoteObsidianLayout({
  store,
  products,
  isMockup = false,
  hideDock = false,
}: KeynoteObsidianLayoutProps) {
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
  const featuredProduct = displayProducts[0];
  const spotlightProducts = displayProducts.slice(0, 4);

  const filteredProducts = useMemo(() => {
    return filterAndSortProducts(displayProducts, filterState);
  }, [displayProducts, filterState]);

  const filterTabs = [
    { id: "ALL" as const, label: "Semua Koleksi" },
    { id: "FLAGSHIP" as const, label: "Flagship" },
    { id: "IPHONE" as const, label: "iPhone" },
    { id: "ANDROID" as const, label: "Android" },
    { id: "LIKENEW" as const, label: "Like New" },
  ];

  let cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(store.name)},%20saya%20ingin%20tanya%20stok%20HP%20second%20premium`;

  function getProductWaUrl(p: ProductData) {
    return `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(store.name)},%20saya%20berminat%20unit%20*${encodeURIComponent(p.name)}*%20seharga%20*${formatRupiah(p.price)}*.%20Apakah%20masih%20tersedia?`;
  }

  // --- Trade-In Submit ---
  async function handleTradeInSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) {
      setTiSuccess(true);
      return;
    }
    setTiLoading(true); setTiError(null);
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
        const msg = encodeURIComponent(`Halo ${store.name}, saya ingin mengajukan penaksiran Trade-In:\n\nNama: ${tiCustomerName}\nUnit: ${tiPhoneModel} ${tiRamRom}\nKondisi: ${tiCondition}\nBattery Health: ${tiBatteryHealth}%\nIMEI: ${tiImeiStatus}\nKelengkapan: ${tiCompleteness}\nMinus: ${tiMinusNotes || "-"}\nHarga Harapan: ${tiExpectedPrice || "-"}\n\nMohon info estimasi taksiran terbaiknya. Terima kasih!`);
        if (!isMockup) window.open(`https://wa.me/${cleanWa}?text=${msg}`, "_blank");
      } else {
        setTiError(res.error || "Gagal mengirim form.");
      }
    } catch {
      setTiError("Terjadi kesalahan. Coba lagi.");
    }
    setTiLoading(false);
  }

  // --- Review Submit ---
  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) { setShowReviewModal(false); return; }
    setRevLoading(true); setRevError(null);
    const res = await submitStoreReviewAction({ storeId: store.id, customerName: revName, rating: revRating, comment: revComment, purchasedUnit: revUnit || undefined });
    setRevLoading(false);
    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setRevSuccess(true);
      setTimeout(() => { setRevSuccess(false); setShowReviewModal(false); setRevName(""); setRevUnit(""); setRevComment(""); setRevRating(5); }, 1500);
    } else {
      setRevError(res.error || "Gagal mengirim ulasan.");
    }
  }

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1)
    : "4.9";

  const mainBranch = store.branches?.find((b) => b.isMain) || store.branches?.[0];
  const defaultMapsUrl = store.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address || store.name + " Bandung")}`;

  return (
    <div
      className={`${styles.obsidianContainer} ${
        isMockup
          ? "w-full min-h-full flex flex-col"
          : "min-h-screen flex justify-center"
      } font-sans`}
    >
      <div
        className={`w-full ${
          isMockup
            ? "max-w-full flex-1 flex flex-col"
            : "max-w-lg min-h-screen pb-28 flex flex-col relative"
        }`}
      >
        {/* ══════════════════════════════════════════════
            HEADER — Boutique Centered (3-column layout)
        ══════════════════════════════════════════════ */}
        <header className={`sticky top-0 z-40 px-4 py-2.5 ${styles.obsidianHeader}`}>
          <div className="flex items-center justify-between gap-2 h-11">
            {/* Left: Search Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isSearchOpen || filterState.searchQuery
                  ? `border text-amber-400 bg-amber-400/10 ${styles.goldBorder}`
                  : "text-zinc-400 hover:text-zinc-200 bg-zinc-900/70 border border-zinc-800"
              }`}
              title="Cari Unit"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Center: Logo + Store Name */}
            <div
              className="flex flex-col items-center min-w-0 cursor-pointer select-none"
              onClick={() => {
                setActiveTab("home");
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="flex items-center gap-2">
                {store.logoUrl ? (
                  <div className={`w-7 h-7 rounded-full overflow-hidden shrink-0 border ${styles.goldBorder}`}>
                    <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
                  </div>
                ) : null}
                <h1 className={`font-black text-xs tracking-wider uppercase text-white leading-none`}>
                  {store.name}
                </h1>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[8px] tracking-widest uppercase text-zinc-500 font-bold">Premium · COD Ready</span>
              </div>
            </div>

            {/* Right: WA Button & Trade-In */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTradeInModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 hover:bg-amber-400/20 transition shrink-0"
                title="Tukar Tambah / Jual HP"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Tukar Tambah</span>
              </button>

              <a
                href={isMockup ? "#" : waUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => { if (isMockup) e.preventDefault(); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 active:scale-95 ${styles.obsidianWaButton}`}
                title="Chat WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Expandable Search */}
          {isSearchOpen && (
            <div className="pt-2.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className={`rounded-2xl px-3.5 py-2 flex items-center gap-2 ${styles.obsidianSearch}`}>
                <Search className="w-4 h-4 text-amber-400/60 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={filterState.searchQuery}
                  onChange={(e) => {
                    setFilterState((prev) => ({ ...prev, searchQuery: e.target.value }));
                    if (activeTab !== "list" && activeTab !== "home") setActiveTab("list");
                  }}
                  placeholder="Cari iPhone, Samsung, RAM..."
                  className="w-full bg-transparent text-xs font-semibold text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                />
                {filterState.searchQuery && (
                  <button type="button" onClick={() => setFilterState((prev) => ({ ...prev, searchQuery: "" }))}
                    className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-400 flex items-center justify-center text-[10px] font-bold">
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
            <div className="space-y-5 p-4">
              {/* CINEMATIC HERO */}
              <div className={`relative rounded-3xl overflow-hidden p-5 sm:p-6 ${styles.cinematicHero}`}>
                <div className="relative z-10 space-y-3">
                  {/* Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${styles.gradeBadge}`}>
                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                    <span>TITANIUM & PRO SERIES · KEYNOTE REVEAL 2026</span>
                  </div>

                  {/* Headline */}
                  <div className="space-y-1">
                    <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white`}>
                      Elegansi Titik Puncak.
                    </h2>
                    <h3 className={`text-base sm:text-xl font-black leading-tight ${styles.goldTextGradient}`}>
                      Koleksi Second Grade A+
                    </h3>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[240px]">
                    Setiap unit lolos 30 titik diagnostik mesin. Garansi IMEI resmi & replace 30 hari.
                  </p>

                  {/* Featured Product Preview */}
                  {featuredProduct && (
                    <div className={`flex items-center gap-3 p-3 rounded-2xl mt-3 ${styles.titaniumCard}`}>
                      <div className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${styles.productImageFrame}`}>
                        {featuredProduct.images?.[0] ? (
                          <img src={featuredProduct.images[0]} alt={featuredProduct.name}
                            className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <Smartphone className="w-7 h-7 text-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          {featuredProduct.brand}
                        </span>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{featuredProduct.name}</h4>
                        <div className={`text-sm font-black ${styles.goldTextGradient}`}>
                          {formatRupiah(featuredProduct.price)}
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => setActiveTab("list")}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition shrink-0 ${styles.acquireButton}`}>
                        Lihat →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* UNDERLINE FILTER TABS */}
              <div>
                <div className={`flex items-center gap-0 overflow-x-auto pb-0 ${styles.filterTabBar} ${styles.noScrollbar}`}>
                  {filterTabs.map((tab) => {
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          if (tab.id === "ALL") {
                            setFilterState((prev) => ({ ...prev, category: "ALL", brand: "ALL", grade: "ALL" }));
                          } else if (tab.id === "FLAGSHIP") {
                            setFilterState((prev) => ({ ...prev, sort: "PRICE_DESC" }));
                          } else if (tab.id === "IPHONE") {
                            setFilterState((prev) => ({ ...prev, brand: "Apple", category: "SMARTPHONE" }));
                          } else if (tab.id === "ANDROID") {
                            setFilterState((prev) => ({ ...prev, category: "SMARTPHONE", brand: "ALL" }));
                          } else if (tab.id === "LIKENEW") {
                            setFilterState((prev) => ({ ...prev, grade: "A+" }));
                          }
                          setActiveTab("list");
                        }}
                        className={`px-3.5 pb-2 shrink-0 transition-all ${styles.filterTab}`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[10px] text-zinc-600 font-medium pt-2 px-0.5">
                  {filteredProducts.length} unit tersedia
                </div>
              </div>

              {/* TRUST PILLARS */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: ShieldCheck, label: "Garansi 30 Hari", sub: "Replace Unit", color: "text-amber-400" },
                  { icon: Zap, label: "IMEI Aman", sub: "Kemenperin", color: "text-amber-400" },
                  { icon: Cpu, label: "30 Titik Uji", sub: "Diagnostik AI", color: "text-amber-400" },
                ].map(({ icon: Icon, label, sub, color }) => (
                  <div key={label} className={`p-3 rounded-2xl text-center space-y-1 ${styles.trustPillar}`}>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto bg-amber-400/10 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="font-extrabold text-[10px] leading-tight text-zinc-100">{label}</div>
                    <div className="text-[9px] text-zinc-600">{sub}</div>
                  </div>
                ))}
              </div>

              {/* ── BANNER AJAKAN TUKAR TAMBAH / JUAL HP BEKAS ── */}
              <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />

              {/* SPOTLIGHT SLIDER — Vertical tall cards */}
              {spotlightProducts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-3.5 rounded-full ${styles.acquireButton}`} />
                      <span className="text-xs font-black text-zinc-100 tracking-tight">SPOTLIGHT KOLEKSI</span>
                    </div>
                    <button type="button" onClick={() => setActiveTab("list")}
                      className={`text-[10px] font-bold ${styles.goldAccent} hover:opacity-80`}>
                      Semua ({displayProducts.length}) →
                    </button>
                  </div>

                  <div className={`flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 ${styles.noScrollbar}`}>
                    {spotlightProducts.map((p) => {
                      const detailUrl = isMockup ? "#" : `/${store.slug}/product/${p.id}`;
                      return (
                        <div key={p.id} className={`w-[160px] sm:w-[175px] shrink-0 rounded-3xl p-3 flex flex-col ${styles.spotlightCard}`}>
                          {/* Image */}
                          <a href={detailUrl} onClick={(e) => { if (isMockup) e.preventDefault(); }}>
                            <div className={`w-full aspect-[4/5] rounded-2xl flex items-center justify-center overflow-hidden mb-2.5 ${styles.productImageFrame}`}>
                              {p.images?.[0] ? (
                                <img src={p.images[0]} alt={p.name}
                                  className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
                              ) : (
                                <Smartphone className="w-8 h-8 text-zinc-700" />
                              )}
                            </div>
                          </a>

                          {/* Meta */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                              {p.brand}
                            </span>
                            {p.batteryHealth != null && (
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${styles.gradeBadge}`}>
                                BH {p.batteryHealth}%
                              </span>
                            )}
                          </div>
                          <a href={detailUrl} onClick={(e) => { if (isMockup) e.preventDefault(); }}>
                            <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug hover:text-amber-300 transition">
                              {p.name}
                            </h4>
                          </a>
                          <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{p.ramRom} · {p.condition}</p>

                          <div className={`mt-auto pt-2 border-t flex items-center justify-between ${styles.goldDivider}`}>
                            <div className={`text-xs font-black ${styles.goldTextGradient}`}>
                              {formatRupiah(p.price)}
                            </div>
                            <a href={getProductWaUrl(p)} target="_blank" rel="noreferrer"
                              onClick={(e) => { if (isMockup) e.preventDefault(); }}
                              className={`text-[9px] font-bold px-2 py-1 rounded-lg text-zinc-950 transition ${styles.acquireButton}`}>
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

          {/* ══════════ TAB 2: KATALOG ══════════ */}
          {activeTab === "list" && (
            <div className="space-y-0 text-left">
              {/* Sticky Filter */}
              <div className={`sticky top-[61px] z-30 px-4 pt-3 pb-2 ${styles.obsidianHeader}`}>
                <ProductFilterBar
                  products={displayProducts}
                  filterState={filterState}
                  onFilterChange={setFilterState}
                  onReset={handleResetFilters}
                  theme="keynote-obsidian"
                  isDark={true}
                  totalFilteredCount={filteredProducts.length}
                />
              </div>

              {/* Catalog Header */}
              <div className="px-4 pt-4 pb-1 space-y-3">
                <TradeInBanner onOpen={() => setIsTradeInModalOpen(true)} isDark={true} />
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-zinc-100 tracking-tight uppercase">
                    Showcase Koleksi
                  </h2>
                  <button type="button" onClick={() => setActiveTab("home")}
                    className={`text-xs font-bold ${styles.goldAccent} hover:opacity-80`}>
                    ← Home
                  </button>
                </div>
              </div>

              {/* Full-width showcase cards */}
              <div className="px-4 space-y-3 pb-6">
                {filteredProducts.map((p) => {
                  const isCustomDomain = typeof window !== "undefined" &&
                    !window.location.pathname.startsWith(`/${store.slug}`) &&
                    !window.location.hostname.includes("localhost") &&
                    !window.location.hostname.includes("gadgetbdg.com");
                  const detailUrl = isMockup ? "#" : isCustomDomain ? `/product/${p.id}` : `/${store.slug}/product/${p.id}`;
                  const waLink = getProductWaUrl(p);

                  return (
                    <div key={p.id} className={`rounded-3xl overflow-hidden ${styles.showcaseCard}`}>
                      <Link href={detailUrl} onClick={(e) => { if (isMockup) e.preventDefault(); }}
                        className="block">
                        <div className="flex items-center gap-4 p-4">
                          {/* Square Product Photo */}
                          <div className={`w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden ${styles.productImageFrame}`}>
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name}
                                className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105" />
                            ) : (
                              <Smartphone className="w-8 h-8 text-zinc-700" />
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                                {p.brand}
                              </span>
                              {p.batteryHealth != null && (
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${styles.gradeBadge}`}>
                                  BH {p.batteryHealth}%
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-sm text-zinc-100 line-clamp-1 group-hover:text-amber-300 transition">
                              {p.name}
                            </h3>
                            <p className="text-[11px] text-zinc-500">
                              {p.ramRom} · {p.condition}
                            </p>
                            <div className={`text-base font-black ${styles.goldTextGradient}`}>
                              {formatRupiah(p.price)}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Action Row */}
                      <div className={`flex items-center gap-2 px-4 pb-3.5 pt-0 border-t ${styles.goldDivider}`}>
                        <Link href={detailUrl} onClick={(e) => { if (isMockup) e.preventDefault(); }}
                          className="flex-1 py-2 rounded-2xl text-xs font-bold text-center text-zinc-300 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 transition">
                          Lihat Detail
                        </Link>
                        <button type="button"
                          onClick={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (!isMockup) window.open(waLink, "_blank");
                          }}
                          className={`flex-1 py-2 rounded-2xl text-xs font-black text-center transition ${styles.acquireButton}`}>
                          Acquire via WA
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <ProductEmptyState
                    storeName={store.name}
                    storeWhatsapp={store.whatsapp}
                    onReset={handleResetFilters}
                    isDark={true}
                  />
                )}
              </div>
            </div>
          )}

          {/* ══════════ TAB 3: TRADE-IN ══════════ */}
          {activeTab === "trade-in" && (
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="space-y-1">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${styles.gradeBadge}`}>
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Bespoke Appraisal</span>
                </div>
                <h2 className="text-lg font-black text-white tracking-tight">Valuasi Tukar Tambah</h2>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Isi form di bawah untuk mendapatkan estimasi harga taksiran unit Anda dari tim kurator kami.
                </p>
              </div>

              {tiSuccess ? (
                <div className={`rounded-3xl p-6 text-center space-y-3 ${styles.titaniumCard}`}>
                  <CheckCircle2 className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="font-black text-white text-sm">Pengajuan Terkirim!</p>
                  <p className="text-zinc-400 text-xs">Tim kami akan menghubungi Anda via WhatsApp untuk estimasi valuasi.</p>
                  <button type="button" onClick={() => setTiSuccess(false)}
                    className={`mt-2 px-4 py-2 rounded-xl text-xs font-bold ${styles.acquireButton}`}>
                    Ajukan Lagi
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTradeInSubmit} className="space-y-3">
                  {tiError && (
                    <div className="p-3 rounded-2xl bg-rose-950/50 text-rose-300 border border-rose-800/50 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{tiError}</span>
                    </div>
                  )}

                  {/* Form fields */}
                  {[
                    { label: "Nama Anda *", value: tiCustomerName, setter: setTiCustomerName, placeholder: "Contoh: Rizky M.", type: "text", required: true },
                    { label: "No. WhatsApp *", value: tiCustomerWa, setter: setTiCustomerWa, placeholder: "0812xxxxxxxx", type: "tel", required: true },
                    { label: "Model HP *", value: tiPhoneModel, setter: setTiPhoneModel, placeholder: "Contoh: iPhone 13 Pro", type: "text", required: true },
                    { label: "Kapasitas RAM/ROM", value: tiRamRom, setter: setTiRamRom, placeholder: "Contoh: 6/128GB", type: "text", required: false },
                    { label: "Battery Health (%)", value: tiBatteryHealth, setter: setTiBatteryHealth, placeholder: "Contoh: 87", type: "number", required: false },
                    { label: "Harga Harapan (Rp)", value: tiExpectedPrice, setter: setTiExpectedPrice, placeholder: "Contoh: 5500000", type: "text", required: false },
                  ].map(({ label, value, setter, placeholder, type, required }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">{label}</label>
                      <input
                        type={type}
                        required={required}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs ${styles.obsidianInput}`}
                      />
                    </div>
                  ))}

                  {/* Selects */}
                  {[
                    { label: "Kondisi Unit", value: tiCondition, setter: setTiCondition, options: ["98% Mulus Like New", "95% Mulus", "90% Bekas Wajar", "80% Ada Minus Minor"] },
                    { label: "Status IMEI", value: tiImeiStatus, setter: setTiImeiStatus, options: ["Resmi iBox / Kemenperin", "Resmi SEIN", "Resmi BM Terdaftar", "Perlu Dicek"] },
                    { label: "Kelengkapan", value: tiCompleteness, setter: setTiCompleteness, options: ["Fullset Box Original", "Fullset tanpa Box", "Unit Only + Charger", "Unit Only"] },
                  ].map(({ label, value, setter, options }) => (
                    <div key={label}>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">{label}</label>
                      <select value={value} onChange={(e) => setter(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-2xl text-xs ${styles.obsidianSelect}`}>
                        {options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}

                  {/* Minus notes */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Catatan Minus / Kekurangan</label>
                    <textarea
                      rows={2}
                      value={tiMinusNotes}
                      onChange={(e) => setTiMinusNotes(e.target.value)}
                      placeholder="Ceritakan kondisi minus jika ada: layar ada goresan, punggung retak, dll."
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs resize-none ${styles.obsidianInput}`}
                    />
                  </div>

                  <button type="submit" disabled={tiLoading}
                    className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition disabled:opacity-60 ${styles.acquireButton}`}>
                    {tiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Pengajuan Valuasi</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ══════════ TAB 4: TOKO / ABOUT ══════════ */}
          {activeTab === "about" && (
            <div className="p-4 space-y-4 pb-10">
              {/* Cover Foto Toko */}
              <div className={`rounded-3xl overflow-hidden border ${styles.goldDivider}`}>
                <div className="aspect-video w-full relative">
                  <img
                    src={store.storeImage || store.bannerUrl || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-zinc-950 flex items-center gap-1 ${styles.acquireButton}`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Premium Merchant</span>
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">{store.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black text-white">{averageRating}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-xs text-zinc-400">{totalReviews > 0 ? `${totalReviews} Ulasan` : "Premium Second Store"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className={`rounded-3xl p-4 space-y-3 ${styles.titaniumCard}`}>
                <div className="flex items-center gap-2 font-black text-sm text-zinc-100">
                  <MessageCircle className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                  <span>Kontak & Hotline Kurator</span>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Cek stok fisik, minta video 3uTools, atau diskusi valuasi trade-in. Respon cepat.
                </p>
                <a href={isMockup ? "#" : waUrl} target="_blank" rel="noreferrer"
                  onClick={(e) => { if (isMockup) e.preventDefault(); }}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition ${styles.acquireButton}`}>
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat via WhatsApp</span>
                </a>
              </div>

              {/* Jam Operasional */}
              <div className={`rounded-3xl p-4 space-y-2.5 ${styles.titaniumCard}`}>
                <div className={`flex items-center justify-between border-b pb-2.5 ${styles.goldDivider}`}>
                  <div className="flex items-center gap-2 font-black text-sm text-zinc-100">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Jam Operasional</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Buka
                  </span>
                </div>
                <p className="font-semibold text-xs text-zinc-100">
                  {store.operationalHours || "Setiap Hari: 10:00 – 20:30 WIB"}
                </p>
                <p className="text-[11px] text-zinc-300">COD konter, tukar tambah, pengiriman instan Bandung Raya.</p>
              </div>

              {/* Alamat */}
              <div className={`rounded-3xl p-4 space-y-3 ${styles.titaniumCard}`}>
                <div className={`flex items-center gap-2 font-black text-sm text-zinc-100 border-b pb-2.5 ${styles.goldDivider}`}>
                  <MapPin className="w-4 h-4 text-rose-400" />
                  <span>{mainBranch ? mainBranch.name : "Alamat Konter"}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {mainBranch ? mainBranch.address : store.address || "Bandung Electronic Center (BEC) Lantai 1 Blok C-05"}
                </p>
                <a href={isMockup ? "#" : defaultMapsUrl} target="_blank" rel="noreferrer"
                  onClick={(e) => { if (isMockup) e.preventDefault(); }}
                  className="w-full py-2 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600 transition">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Petunjuk Arah (Google Maps)</span>
                </a>
              </div>

              {/* Garansi */}
              <div className={`rounded-3xl p-4 space-y-3 ${styles.titaniumCard}`}>
                <div className="flex items-center gap-2 font-black text-sm text-zinc-100">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Garansi & Jaminan Transaksi</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { bold: "Garansi Toko 30 Hari:", text: store.warrantyPolicy || "Replace unit atau servis gratis dalam 30 hari." },
                    { bold: "IMEI Bebas Blokir Seumur Hidup:", text: "Semua unit terdaftar resmi iBox, SEIN, atau Kemenperin." },
                    { bold: "Pindah Data Gratis:", text: "Didampingi kasir berpengalaman di konter." },
                  ].map(({ bold, text }) => (
                    <div key={bold} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-zinc-300">
                        <b className="text-zinc-100">{bold}</b> {text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ulasan Pembeli */}
              <div className={`rounded-3xl p-4 space-y-3 ${styles.titaniumCard}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-sm text-zinc-100">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Ulasan Pembeli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${styles.gradeBadge}`}>
                      ★ {averageRating}
                    </span>
                    {store.tier !== "STARTER" && (
                      <button type="button" onClick={() => setShowReviewModal(true)}
                        className={`px-2.5 py-1 rounded-xl text-[9px] font-black flex items-center gap-1 ${styles.acquireButton}`}>
                        <Plus className="w-3 h-3" />
                        Tulis
                      </button>
                    )}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div className="space-y-2.5 pt-1">
                    {reviews.map((rev) => (
                      <div key={rev.id} className={`p-3 rounded-2xl ${styles.reviewCard}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                          {rev.purchasedUnit && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md truncate max-w-[140px] ${styles.gradeBadge}`}>
                              {rev.purchasedUnit}
                            </span>
                          )}
                        </div>
                        <p className="text-xs italic leading-relaxed text-zinc-300">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                        <span className="text-[10px] text-zinc-600 block mt-1.5 font-bold">
                          — {rev.customerName}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`p-4 rounded-2xl text-center space-y-1.5 border border-dashed ${styles.goldDivider}`}>
                    <p className="text-xs text-zinc-600">Belum ada ulasan. Jadilah yang pertama!</p>
                    {store.tier !== "STARTER" && (
                      <button type="button" onClick={() => setShowReviewModal(true)}
                        className={`mt-1 text-xs font-bold ${styles.goldAccent} hover:opacity-80 flex items-center gap-1 mx-auto`}>
                        <Plus className="w-3.5 h-3.5" />
                        Tulis Ulasan Sekarang
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════
            FLOATING BOTTOM DOCK — Obsidian Luxury
        ══════════════════════════════════════════════ */}
        {!hideDock && (
          <div className={`${
            isMockup
              ? "absolute bottom-3 left-3 right-3"
              : "fixed bottom-4 left-4 right-4 max-w-md mx-auto"
          } z-30 pointer-events-none flex justify-center`}>
            <nav className={`w-full max-w-sm rounded-full px-4 py-2.5 flex items-center justify-between pointer-events-auto select-none transition-all duration-300 ${styles.obsidianDock}`}>
              {[
                { tab: "home" as StoreTabType, Icon: Home, label: "Home" },
                { tab: "list" as StoreTabType, Icon: Smartphone, label: "Koleksi" },
                { tab: "trade-in" as StoreTabType, Icon: RefreshCw, label: "Trade-In" },
                { tab: "about" as StoreTabType, Icon: StoreIcon, label: "Toko" },
              ].map(({ tab, Icon, label }) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex flex-col items-center justify-center gap-0.5 px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer ${
                      isActive ? styles.dockTabActive : "text-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "scale-110" : ""} ${
                      tab === "trade-in" && isActive ? "rotate-180 transition-transform duration-500" : ""
                    }`} />
                    <span className="text-[9px] tracking-tight leading-none font-bold">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════
          MODAL: TULIS ULASAN
      ══════════════════════════════════════════════ */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 border space-y-4 shadow-2xl relative ${styles.titaniumCard} ${styles.goldDivider}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${styles.goldDivider}`}>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="font-black text-sm text-white">Tulis Ulasan</h3>
              </div>
              <button type="button" onClick={() => setShowReviewModal(false)}
                className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {revSuccess ? (
              <div className="p-4 rounded-2xl bg-amber-400/10 text-amber-300 text-center space-y-2 border border-amber-400/30">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="font-bold text-xs">Ulasan berhasil dikirim. Terima kasih!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {revError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-800/50 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{revError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Bintang *</label>
                  <div className="flex items-center gap-1.5">
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" onClick={() => setRevRating(s)} className="p-1 transition">
                        <Star className={`w-6 h-6 ${s <= revRating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                      </button>
                    ))}
                    <span className="text-xs font-black text-zinc-300 ml-2">{revRating}/5</span>
                  </div>
                </div>
                {[
                  { label: "Nama Anda *", value: revName, setter: setRevName, placeholder: "Contoh: Budi A.", required: true },
                  { label: "Unit yang Dibeli (Opsional)", value: revUnit, setter: setRevUnit, placeholder: "Contoh: iPhone 13 128GB", required: false },
                ].map(({ label, value, setter, placeholder, required }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
                    <input type="text" required={required} value={value}
                      onChange={(e) => setter(e.target.value)} placeholder={placeholder}
                      className={`w-full px-3 py-2 rounded-xl text-xs ${styles.obsidianInput}`} />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Ulasan *</label>
                  <textarea required rows={3} value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    placeholder="Ceritakan pengalaman belanja Anda..."
                    className={`w-full px-3 py-2 rounded-xl text-xs resize-none ${styles.obsidianInput}`} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition">
                    Batal
                  </button>
                  <button type="submit" disabled={revLoading}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition disabled:opacity-50 ${styles.acquireButton}`}>
                    {revLoading ? "Mengirim..." : "Kirim Ulasan"}
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
        theme="keynote-obsidian"
        isDark={true}
      />
    </div>
  );
}
