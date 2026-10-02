"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  BatteryCharging,
  ShieldCheck,
  MessageCircle,
  X,
  SlidersHorizontal,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { StoreData, ProductData } from "./types";
import { formatRupiah } from "@/lib/utils";

interface StoreListViewProps {
  store: StoreData;
  products: ProductData[];
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  theme?: "minimal-clean" | "dark-gaming";
}

export function StoreListView({
  store,
  products,
  selectedBrand: initialBrand = "ALL",
  onBrandChange,
  theme = "minimal-clean",
}: StoreListViewProps) {
  const isDark = theme === "dark-gaming";
  const displayProducts = Array.isArray(products) ? products : [];

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState(initialBrand);
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [selectedRam, setSelectedRam] = useState<string>("ALL");
  const [selectedStorage, setSelectedStorage] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Extract unique brands
  const allBrands = ["ALL", ...Array.from(new Set(displayProducts.map((p) => p.brand).filter(Boolean)))];

  // Filter application
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      if (!p) return false;

      // 1. Text search
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.ramRom || "").toLowerCase().includes(q) ||
        (p.imeiStatus || "").toLowerCase().includes(q);

      // 2. Brand
      const matchBrand = brand === "ALL" || p.brand === brand;

      // 3. Price range
      let matchPrice = true;
      if (priceRange === "<3m") matchPrice = p.price < 3000000;
      else if (priceRange === "3m-7m") matchPrice = p.price >= 3000000 && p.price <= 7000000;
      else if (priceRange === "7m-12m") matchPrice = p.price > 7000000 && p.price <= 12000000;
      else if (priceRange === ">12m") matchPrice = p.price > 12000000;

      // 4. RAM
      const matchRam = selectedRam === "ALL" || (p.ramRom || "").toLowerCase().includes(selectedRam.toLowerCase());

      // 5. Storage
      const matchStorage = selectedStorage === "ALL" || (p.ramRom || "").toLowerCase().includes(selectedStorage.toLowerCase());

      // 6. Condition
      const matchCondition =
        selectedCondition === "ALL" || (p.condition || "").toLowerCase().includes(selectedCondition.toLowerCase());

      return matchSearch && matchBrand && matchPrice && matchRam && matchStorage && matchCondition;
    });
  }, [displayProducts, search, brand, priceRange, selectedRam, selectedStorage, selectedCondition]);

  function resetFilters() {
    setSearch("");
    setBrand("ALL");
    setPriceRange("ALL");
    setSelectedRam("ALL");
    setSelectedStorage("ALL");
    setSelectedCondition("ALL");
    if (onBrandChange) onBrandChange("ALL");
  }

  const hasActiveFilters =
    brand !== "ALL" ||
    priceRange !== "ALL" ||
    selectedRam !== "ALL" ||
    selectedStorage !== "ALL" ||
    selectedCondition !== "ALL" ||
    search !== "";

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* 1. Search Bar + Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari iPhone, Samsung, RAM/ROM..."
            className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 transition ${
              isDark
                ? "bg-slate-950 text-slate-100 placeholder:text-slate-500 border border-slate-700/80 focus:ring-emerald-500"
                : "bg-neutral-100 text-neutral-800 placeholder:text-neutral-400 border border-neutral-200 focus:ring-blue-600"
            }`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
            hasActiveFilters
              ? isDark
                ? "bg-emerald-500 text-slate-950 border-emerald-400"
                : "bg-blue-600 text-white border-blue-600"
              : isDark
              ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750"
              : "bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* 2. Brand Horizontal Scroll Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {allBrands.map((b) => (
          <button
            key={b}
            onClick={() => {
              setBrand(b);
              if (onBrandChange) onBrandChange(b);
            }}
            className={`px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition border ${
              brand === b
                ? isDark
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                  : "bg-neutral-900 text-white border-neutral-900"
                : isDark
                ? "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                : "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
            }`}
          >
            {b === "ALL" ? "Semua Merk" : b}
          </button>
        ))}
      </div>

      {/* 3. Expandable Multi-Dimensional Filter Drawer */}
      {showFilterPanel && (
        <div
          className={`rounded-2xl p-4 border text-xs space-y-3.5 animate-fade-in ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-neutral-50 border-neutral-200"
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 border-neutral-200 dark:border-slate-800">
            <span className="font-bold">Filter Lanjutan</span>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-[11px] font-bold text-rose-500 hover:underline">
                Reset Semua
              </button>
            )}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 dark:text-slate-400 mb-1.5">
              Rentang Harga
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { label: "Semua", val: "ALL" },
                { label: "< 3 Juta", val: "<3m" },
                { label: "3jt - 7jt", val: "3m-7m" },
                { label: "7jt - 12jt", val: "7m-12m" },
                { label: "> 12 Juta", val: ">12m" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setPriceRange(item.val)}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition ${
                    priceRange === item.val
                      ? isDark
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                        : "bg-blue-50 text-blue-700 border-blue-400"
                      : isDark
                      ? "bg-slate-900 border-slate-800 text-slate-400"
                      : "bg-white border-neutral-200 text-neutral-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* RAM & Storage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-slate-400 mb-1.5">
                Kapasitas RAM
              </label>
              <select
                value={selectedRam}
                onChange={(e) => setSelectedRam(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs border focus:outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                }`}
              >
                <option value="ALL">Semua RAM</option>
                <option value="4GB">4GB</option>
                <option value="6GB">6GB</option>
                <option value="8GB">8GB</option>
                <option value="12GB">12GB</option>
                <option value="16GB">16GB</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 dark:text-slate-400 mb-1.5">
                Kapasitas Storage
              </label>
              <select
                value={selectedStorage}
                onChange={(e) => setSelectedStorage(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs border focus:outline-none ${
                  isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-neutral-200 text-neutral-900"
                }`}
              >
                <option value="ALL">Semua Storage</option>
                <option value="64GB">64GB</option>
                <option value="128GB">128GB</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 4. Results Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-neutral-500 dark:text-slate-400">
          Katalog ({filteredProducts.length} Unit)
        </span>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-[11px] text-blue-600 dark:text-emerald-400 hover:underline">
            Reset Filter
          </button>
        )}
      </div>

      {/* 5. 2-Column Mobile-First Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 dark:bg-slate-950/60 rounded-3xl border border-dashed border-neutral-300 dark:border-slate-800 p-6 space-y-2">
          <Smartphone className="w-10 h-10 text-neutral-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-sm">Tidak ada unit HP yang cocok</h3>
          <p className="text-xs text-neutral-500 dark:text-slate-400">
            Coba ubah kata kunci pencarian atau reset filter yang dipilih.
          </p>
          <button
            onClick={resetFilters}
            className={`mt-2 px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              isDark ? "bg-emerald-500 text-slate-950" : "bg-neutral-900 text-white"
            }`}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => {
            const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://gadgetbdg.com";
            const productUrl = `${currentOrigin}/${store.slug}#${p.id}`;
            const waMessage = encodeURIComponent(
              `Halo ${store.name}, saya berminat dengan unit ini:\n\n` +
                `*${p.name}*\n` +
                `• Spek: ${p.ramRom}\n` +
                `• Harga: ${formatRupiah(p.price)}\n` +
                `• Kondisi: ${p.condition}\n` +
                `• Status IMEI: ${p.imeiStatus}\n` +
                (p.batteryHealth ? `• Battery Health: ${p.batteryHealth}%\n` : "") +
                (p.minusNotes ? `• Catatan: ${p.minusNotes}\n` : "") +
                `\nLink: ${productUrl}\n\nApakah unit ini masih ready kak?`
            );

            return (
              <div
                key={p.id}
                id={p.id}
                className={`rounded-2xl p-3 border transition flex flex-col justify-between space-y-2.5 ${
                  isDark
                    ? "bg-slate-950/70 border-slate-800 hover:border-emerald-500/40"
                    : "bg-white border-neutral-200 hover:border-blue-300 shadow-sm"
                }`}
              >
                <div>
                  {/* Thumbnail Image with Watermark */}
                  <div className="aspect-square rounded-xl bg-neutral-100 dark:bg-slate-900 overflow-hidden relative border border-neutral-200/50 dark:border-slate-800 mb-2">
                    {p.images && p.images.length > 0 ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
                        No Pic
                      </div>
                    )}

                    {/* Condition badge */}
                    <span
                      className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${
                        isDark ? "bg-emerald-500 text-slate-950" : "bg-neutral-900 text-white"
                      }`}
                    >
                      {p.condition.slice(0, 10)}
                    </span>

                    {/* Store Watermark on Image */}
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[8px] font-mono px-1 py-0.5 rounded opacity-80">
                      @{store.slug}
                    </div>
                  </div>

                  {/* Brand & Name */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-blue-600"}`}>
                    {p.brand}
                  </span>
                  <h3 className="font-bold text-xs line-clamp-1 leading-snug">{p.name}</h3>

                  {/* Price */}
                  <div className={`font-black text-sm mt-0.5 ${isDark ? "text-emerald-400 font-mono" : "text-blue-700"}`}>
                    {formatRupiah(p.price)}
                  </div>
                  <div className={`text-[10px] ${isDark ? "text-slate-400 font-mono" : "text-neutral-500"}`}>
                    {p.ramRom}
                  </div>

                  {/* Badges: BH & IMEI */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.batteryHealth !== null && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <BatteryCharging className="w-2.5 h-2.5 text-amber-600" />
                        <span>BH {p.batteryHealth}%</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-700 dark:text-slate-300">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[85px]">{p.imeiStatus}</span>
                    </span>
                  </div>
                </div>

                {/* Direct WA Order Button */}
                <a
                  href={`https://wa.me/${cleanWa}?text=${waMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-1.5 rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition ${
                    isDark
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <MessageCircle className="w-3 h-3 fill-current" />
                  <span>Order WA</span>
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
