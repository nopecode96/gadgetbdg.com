"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Smartphone,
  MapPin,
} from "lucide-react";
import { StoreData, ProductData } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { ProductCard } from "./ProductCard";

interface StoreListViewProps {
  store: StoreData;
  products: ProductData[];
  selectedBrand?: string;
  onBrandChange?: (brand: string) => void;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  theme?: string;
}

export function StoreListView({
  store,
  products,
  selectedBrand: initialBrand = "ALL",
  onBrandChange,
  initialCategory = "Semua Unit",
  onCategoryChange,
  theme,
}: StoreListViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const displayProducts = Array.isArray(products) ? products : [];

  const [search, setSearch] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(initialCategory);
  const [brand, setBrand] = useState(initialBrand);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [selectedRam, setSelectedRam] = useState<string>("ALL");
  const [selectedStorage, setSelectedStorage] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Sync when initialCategory prop changes
  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategoryFilter(initialCategory);
    }
  }, [initialCategory]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategoryFilter(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };

  // Extract unique brands
  const allBrands = ["ALL", ...Array.from(new Set(displayProducts.map((p) => p.brand).filter(Boolean)))];

  // Store branches
  const storeBranches = store.branches && store.branches.length > 1 ? store.branches : [];

  // Filter application
  const filteredProducts = useMemo(() => {
    return displayProducts.filter((p) => {
      if (!p) return false;

      // 0. Top Category Bar Filter (Semua Unit, iPhone, Android, Gaming / Flagship)
      if (activeCategoryFilter && activeCategoryFilter !== "Semua Unit") {
        const brandLower = (p.brand || "").toLowerCase();
        const nameLower = (p.name || "").toLowerCase();

        if (activeCategoryFilter === "iPhone") {
          const isApple = brandLower === "apple" || nameLower.includes("iphone");
          if (!isApple) return false;
        } else if (activeCategoryFilter === "Android") {
          const isAndroid = brandLower !== "apple" && !nameLower.includes("iphone");
          if (!isAndroid) return false;
        } else if (
          activeCategoryFilter === "Gaming / Flagship" ||
          activeCategoryFilter === "Gaming" ||
          activeCategoryFilter === "Gaming / FPS"
        ) {
          const isGaming =
            brandLower.includes("rog") ||
            brandLower.includes("iqoo") ||
            brandLower.includes("poco") ||
            nameLower.includes("rog") ||
            nameLower.includes("iqoo") ||
            nameLower.includes("poco") ||
            nameLower.includes("gaming") ||
            nameLower.includes("ultra") ||
            nameLower.includes("pro max");
          if (!isGaming) return false;
        } else if (activeCategoryFilter === "Budget < 3 Jt") {
          if (Number(p.price || 0) > 3000000) return false;
        } else if (activeCategoryFilter === "Mulus 99%") {
          const cond = (p.condition || "").toUpperCase();
          const isLikeNew =
            cond === "LIKE_NEW" ||
            cond.includes("MULUS") ||
            cond.includes("99%") ||
            cond.includes("98%") ||
            cond.includes("LIKE NEW");
          if (!isLikeNew) return false;
        }
      }

      // 1. Text search
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.ramRom || "").toLowerCase().includes(q) ||
        (p.imeiStatus || "").toLowerCase().includes(q) ||
        (p.branch?.name || "").toLowerCase().includes(q);

      // 2. Brand
      const matchBrand = brand === "ALL" || p.brand === brand;

      // 2.5. Branch
      const matchBranch =
        selectedBranchId === "ALL" ||
        p.branchId === selectedBranchId ||
        p.branch?.id === selectedBranchId;

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

      return matchSearch && matchBrand && matchBranch && matchPrice && matchRam && matchStorage && matchCondition;
    });
  }, [
    displayProducts,
    activeCategoryFilter,
    search,
    brand,
    selectedBranchId,
    priceRange,
    selectedRam,
    selectedStorage,
    selectedCondition,
  ]);

  function resetFilters() {
    setSearch("");
    setActiveCategoryFilter("Semua Unit");
    setBrand("ALL");
    setSelectedBranchId("ALL");
    setPriceRange("ALL");
    setSelectedRam("ALL");
    setSelectedStorage("ALL");
    setSelectedCondition("ALL");
    if (onBrandChange) onBrandChange("ALL");
    if (onCategoryChange) onCategoryChange("Semua Unit");
  }

  const hasActiveFilters =
    activeCategoryFilter !== "Semua Unit" ||
    brand !== "ALL" ||
    selectedBranchId !== "ALL" ||
    priceRange !== "ALL" ||
    selectedRam !== "ALL" ||
    selectedStorage !== "ALL" ||
    selectedCondition !== "ALL" ||
    search.trim().length > 0;

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* ── TOP BILAH FILTER LENGKAP (Sticky Category Filter Bar) ── */}
      <div className="sticky top-[61px] z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3">
        {/* Scrollable Horizontal Pill Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["Semua Unit", "iPhone", "Android", "Gaming / Flagship"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none ${
                activeCategoryFilter === cat
                  ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs scale-102"
                  : isDark
                  ? "bg-slate-900 text-slate-300 font-semibold border border-slate-800 hover:border-slate-700"
                  : "bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Counter & Status Filter */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <span>Menampilkan {filteredProducts.length} unit HP</span>
          {activeCategoryFilter !== "Semua Unit" && (
            <button
              type="button"
              onClick={() => handleCategorySelect("Semua Unit")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="p-4 pt-0 space-y-4">
        {/* 1. Search Bar & Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari iPhone, Samsung, RAM, IMEI..."
              className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                isDark
                  ? "bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500"
                  : "bg-white border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-blue-500 shadow-sm"
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className={`p-2.5 rounded-xl border font-bold flex items-center gap-1.5 transition shrink-0 ${
            showFilterPanel || hasActiveFilters
              ? isDark
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                : "bg-blue-50 text-blue-700 border-blue-400"
              : isDark
              ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm"
          }`}
          title="Filter Lengkap"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span
              className={`w-2 h-2 rounded-full ${isDark ? "bg-emerald-400" : "bg-blue-600"}`}
            />
          )}
        </button>
      </div>

      {/* 1.5. Branch Filter Pills (Shown if Store has multiple branches) */}
      {storeBranches.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              onClick={() => setSelectedBranchId("ALL")}
              className={`px-3 py-1 rounded-full font-bold tracking-wide shrink-0 transition flex items-center gap-1 border ${
                selectedBranchId === "ALL"
                  ? isDark
                    ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                    : "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : isDark
                  ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>Semua Lokasi ({displayProducts.length})</span>
            </button>

            {storeBranches.map((branch) => {
              const branchCount = displayProducts.filter(
                (p) => p.branchId === branch.id || p.branch?.id === branch.id
              ).length;
              return (
                <button
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  className={`px-3 py-1 rounded-full font-bold tracking-wide shrink-0 transition flex items-center gap-1 border ${
                    selectedBranchId === branch.id
                      ? isDark
                        ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                        : "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : isDark
                      ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
                  }`}
                >
                  <MapPin className="w-3 h-3 text-blue-400" />
                  <span>
                    {branch.name} {branch.isMain ? "(Pusat)" : ""} ({branchCount})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Brand Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {allBrands.map((b) => (
          <button
            key={b}
            onClick={() => {
              setBrand(b);
              if (onBrandChange) onBrandChange(b);
            }}
            className={`px-3 py-1.5 rounded-full font-bold tracking-wide shrink-0 transition border ${
              brand === b
                ? isDark
                  ? `${colors.accent} text-slate-950 border-transparent shadow`
                  : "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                : isDark
                ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
                : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {b === "ALL" ? "Semua Merk" : b}
          </button>
        ))}
      </div>

      {/* 3. Collapsible Advanced Filter Drawer/Card */}
      {showFilterPanel && (
        <div
          className={`p-4 rounded-2xl border space-y-3.5 animate-fade-in shadow-sm ${
            isDark ? "bg-slate-950/80 border-slate-800" : "bg-neutral-50 border-neutral-200"
          }`}
        >
          <div className="flex items-center justify-between border-b border-neutral-200/60 dark:border-slate-800 pb-2">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter Detail Spesifikasi</span>
            </span>
            <button
              onClick={resetFilters}
              className={`text-[11px] font-semibold hover:underline ${
                isDark ? "text-emerald-400" : "text-blue-600"
              }`}
            >
              Reset Semua
            </button>
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
          <button onClick={resetFilters} className={`text-[11px] hover:underline ${colors.accentText}`}>
            Reset Filter
          </button>
        )}
      </div>

      {/* 5. 2-Column Mobile-First Product Grid with Modular ProductCard */}
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
              isDark ? `${colors.accent} text-slate-950` : "bg-neutral-900 text-white"
            }`}
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              store={store}
              themeConfig={themeConfig}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
