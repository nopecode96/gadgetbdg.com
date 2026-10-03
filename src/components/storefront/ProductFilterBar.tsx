"use client";

import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X, MessageCircle, RotateCcw, ArrowUpDown, ChevronDown } from "lucide-react";
import { ProductData } from "../templates/shared/types";

export type ProductCategory = "ALL" | "SMARTPHONE" | "TABLET" | "ACCESSORY" | "OTHER";
export type ProductGrade = "ALL" | "A+" | "A" | "B";
export type ProductSortOrder = "DEFAULT" | "PRICE_ASC" | "PRICE_DESC";

export interface ProductFilterState {
  searchQuery: string;
  category: ProductCategory;
  brand: string;
  grade: ProductGrade;
  sort: ProductSortOrder;
}

export interface ProductFilterBarProps {
  products: ProductData[];
  filterState: ProductFilterState;
  onFilterChange: (newState: ProductFilterState) => void;
  onReset: () => void;
  theme?: "minimal-clean" | "dark-gaming" | "keynote-obsidian" | "tokyo-street" | "cyber-hud" | "midnight-gold";
  isDark?: boolean;
  totalFilteredCount?: number;
}

export function categorizeProduct(p: ProductData): ProductCategory {
  const cat = (p.category || "").toUpperCase().trim();
  if (cat === "SMARTPHONE") return "SMARTPHONE";
  if (cat === "TABLET") return "TABLET";
  if (cat === "ACCESSORY" || cat === "AKSESORIS") return "ACCESSORY";
  if (cat === "OTHER" || cat === "SMARTWATCH" || cat === "LAINNYA") return "OTHER";

  // Heuristic detection based on title/name
  const name = (p.title || p.name || "").toLowerCase();
  if (name.includes("ipad") || name.includes("tab ") || name.includes("tablet") || name.includes("galaxy tab") || name.includes("pad ")) {
    return "TABLET";
  }
  if (
    name.includes("watch") ||
    name.includes("airpods") ||
    name.includes("buds") ||
    name.includes("case") ||
    name.includes("charger") ||
    name.includes("adaptor") ||
    name.includes("kabel") ||
    name.includes("pencil") ||
    name.includes("tws")
  ) {
    return "ACCESSORY";
  }
  return "SMARTPHONE";
}

export function matchProductGrade(p: ProductData, targetGrade: ProductGrade): boolean {
  if (targetGrade === "ALL") return true;

  const g = (p.grade || "").toUpperCase().trim();
  const c = (p.condition || "").toLowerCase();

  if (targetGrade === "A+") {
    return (
      g === "A+" ||
      g === "A_PLUS" ||
      c.includes("a+") ||
      c.includes("like new") ||
      c.includes("99%") ||
      c.includes("istimewa")
    );
  }

  if (targetGrade === "A") {
    return (
      g === "A" ||
      c.includes("mulus") ||
      c.includes("98%") ||
      c.includes("95%") ||
      c.includes("grade a")
    );
  }

  if (targetGrade === "B") {
    return (
      g === "B" ||
      c.includes("pemakaian") ||
      c.includes("90%") ||
      c.includes("minus") ||
      c.includes("dent") ||
      c.includes("grade b")
    );
  }

  return true;
}

export function filterAndSortProducts(
  products: ProductData[],
  filters: ProductFilterState
): ProductData[] {
  const q = filters.searchQuery.toLowerCase().trim();

  const filtered = products.filter((p) => {
    // 1. Search Query Match
    if (q) {
      const name = (p.title || p.name || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const storage = (p.storage || p.ramRom || "").toLowerCase();
      const ram = (p.ram || "").toLowerCase();
      const imei = (p.imeiStatus || "").toLowerCase();
      const matches =
        name.includes(q) ||
        brand.includes(q) ||
        storage.includes(q) ||
        ram.includes(q) ||
        imei.includes(q);

      if (!matches) return false;
    }

    // 2. Category Match
    if (filters.category !== "ALL") {
      const pCat = categorizeProduct(p);
      if (pCat !== filters.category) return false;
    }

    // 3. Brand Match
    if (filters.brand !== "ALL") {
      if ((p.brand || "").trim().toLowerCase() !== filters.brand.trim().toLowerCase()) {
        return false;
      }
    }

    // 4. Grade Match
    if (filters.grade !== "ALL") {
      if (!matchProductGrade(p, filters.grade)) {
        return false;
      }
    }

    return true;
  });

  // 5. Sorting
  if (filters.sort === "PRICE_ASC") {
    return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (filters.sort === "PRICE_DESC") {
    return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
  }

  return filtered;
}

export function ProductFilterBar({
  products,
  filterState,
  onFilterChange,
  onReset,
  theme = "minimal-clean",
  isDark = false,
  totalFilteredCount,
}: ProductFilterBarProps) {
  const [showBrandSheet, setShowBrandSheet] = useState(false);

  // Derive if theme is dark
  const isDarkEffective =
    isDark ||
    theme === "dark-gaming" ||
    theme === "keynote-obsidian" ||
    theme === "tokyo-street" ||
    theme === "cyber-hud" ||
    theme === "midnight-gold";

  // Dynamic available brands from in-stock products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        brands.add(p.brand.trim());
      }
    });
    return Array.from(brands).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      ALL: products.length,
      SMARTPHONE: 0,
      TABLET: 0,
      ACCESSORY: 0,
      OTHER: 0,
    };

    products.forEach((p) => {
      const cat = categorizeProduct(p);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return counts;
  }, [products]);

  const categories: { id: ProductCategory; label: string; icon: string }[] = [
    { id: "ALL", label: "Semua", icon: "📱" },
    { id: "SMARTPHONE", label: "Smartphone", icon: "📲" },
    { id: "TABLET", label: "Tablet", icon: "📟" },
    { id: "ACCESSORY", label: "Aksesoris", icon: "🎧" },
    { id: "OTHER", label: "Lainnya", icon: "⚡" },
  ];

  const grades: { id: ProductGrade; label: string }[] = [
    { id: "ALL", label: "Semua Grade" },
    { id: "A+", label: "A+ Like New" },
    { id: "A", label: "A Mulus" },
    { id: "B", label: "B Pemakaian" },
  ];

  const sortOptions: { id: ProductSortOrder; label: string }[] = [
    { id: "DEFAULT", label: "Rekomendasi" },
    { id: "PRICE_ASC", label: "Harga Terendah" },
    { id: "PRICE_DESC", label: "Harga Tertinggi" },
  ];

  const hasActiveFilters =
    filterState.searchQuery.trim() !== "" ||
    filterState.category !== "ALL" ||
    filterState.brand !== "ALL" ||
    filterState.grade !== "ALL" ||
    filterState.sort !== "DEFAULT";

  // Theme styling configurations
  const styles = useMemo(() => {
    switch (theme) {
      case "dark-gaming":
        return {
          wrapper: "bg-slate-950/90 border-slate-800 text-slate-100",
          inputBg: "bg-slate-900 border-slate-700/80 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-emerald-400/20",
          pillActive: "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 font-black",
          pillInactive: "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold",
          selectBg: "bg-slate-900 border-slate-800 text-emerald-400 focus:border-emerald-400",
          chipActive: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          chipInactive: "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700",
          badgeCount: "bg-slate-800 text-slate-300",
          badgeCountActive: "bg-slate-950/40 text-slate-950 font-bold",
          accentColor: "text-emerald-400",
        };
      case "keynote-obsidian":
        return {
          wrapper: "bg-[#090b10]/95 border-zinc-800/90 text-white",
          inputBg: "bg-zinc-900/90 border-zinc-700/80 text-white placeholder:text-zinc-500 focus:border-white focus:ring-white/10",
          pillActive: "bg-white text-zinc-950 border-white shadow-md font-black",
          pillInactive: "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 font-semibold",
          selectBg: "bg-zinc-900 border-zinc-800 text-white focus:border-zinc-500",
          chipActive: "bg-white/20 text-white border-white/40",
          chipInactive: "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700",
          badgeCount: "bg-zinc-800 text-zinc-300",
          badgeCountActive: "bg-zinc-950/30 text-zinc-950 font-bold",
          accentColor: "text-zinc-200",
        };
      case "tokyo-street":
        return {
          wrapper: "bg-zinc-950/95 border-zinc-800 text-white",
          inputBg: "bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-400 focus:ring-amber-400/20",
          pillActive: "bg-amber-400 text-zinc-950 border-amber-300 shadow-md font-black",
          pillInactive: "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 font-semibold",
          selectBg: "bg-zinc-900 border-zinc-800 text-amber-400 focus:border-amber-400",
          chipActive: "bg-amber-400/20 text-amber-300 border-amber-400/50",
          chipInactive: "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700",
          badgeCount: "bg-zinc-800 text-zinc-300",
          badgeCountActive: "bg-zinc-950/30 text-zinc-950 font-bold",
          accentColor: "text-amber-400",
        };
      case "cyber-hud":
        return {
          wrapper: "bg-[#050b14]/95 border-cyan-950/80 text-cyan-50",
          inputBg: "bg-[#091524] border-cyan-800/60 text-cyan-100 placeholder:text-cyan-600/70 focus:border-cyan-400 focus:ring-cyan-400/20",
          pillActive: "bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-400/30 font-black",
          pillInactive: "bg-[#0b1b30] text-cyan-300 border-cyan-900/80 hover:border-cyan-700 font-semibold",
          selectBg: "bg-[#091524] border-cyan-900/80 text-cyan-300 focus:border-cyan-400",
          chipActive: "bg-cyan-400/20 text-cyan-300 border-cyan-400/50",
          chipInactive: "bg-[#091524]/80 text-cyan-500 border-cyan-950 hover:border-cyan-800",
          badgeCount: "bg-cyan-950 text-cyan-400",
          badgeCountActive: "bg-slate-950/40 text-slate-950 font-bold",
          accentColor: "text-cyan-400",
        };
      case "midnight-gold":
        return {
          wrapper: "bg-[#080808]/95 border-amber-950/50 text-amber-50",
          inputBg: "bg-zinc-900/90 border-amber-900/50 text-white placeholder:text-amber-700/60 focus:border-amber-400 focus:ring-amber-400/20",
          pillActive: "bg-gradient-to-r from-amber-400 to-amber-300 text-zinc-950 border-amber-300 shadow-md font-black",
          pillInactive: "bg-zinc-900 text-amber-200/90 border-amber-950/80 hover:border-amber-900/60 font-semibold",
          selectBg: "bg-zinc-900 border-amber-950/80 text-amber-400 focus:border-amber-400",
          chipActive: "bg-amber-400/20 text-amber-300 border-amber-400/40",
          chipInactive: "bg-zinc-900/80 text-amber-500/80 border-amber-950 hover:border-amber-900",
          badgeCount: "bg-zinc-950 text-amber-400/80",
          badgeCountActive: "bg-zinc-950/30 text-zinc-950 font-bold",
          accentColor: "text-amber-400",
        };
      case "minimal-clean":
      default:
        return {
          wrapper: "bg-white/95 border-slate-200/90 text-slate-900",
          inputBg: "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-slate-900/10 focus:bg-white",
          pillActive: "bg-slate-950 text-white border-slate-950 shadow-xs font-black",
          pillInactive: "bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/80 font-semibold",
          selectBg: "bg-slate-100 border-slate-200 text-slate-800 focus:border-slate-900",
          chipActive: "bg-slate-950 text-white border-slate-950",
          chipInactive: "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300",
          badgeCount: "bg-slate-200/80 text-slate-600",
          badgeCountActive: "bg-white/30 text-white font-bold",
          accentColor: "text-blue-600",
        };
    }
  }, [theme]);

  return (
    <div className={`space-y-3.5 ${styles.wrapper}`}>
      {/* ── 1. REAL-TIME SEARCH BAR ── */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search
            className={`absolute left-3.5 w-4 h-4 pointer-events-none ${
              isDarkEffective ? "text-slate-400" : "text-slate-400"
            }`}
          />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                searchQuery: e.target.value,
              })
            }
            placeholder="Cari iPhone, Samsung, RAM, IMEI, atau kapasitas..."
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs font-medium border transition-all duration-200 outline-none ${styles.inputBg}`}
          />
          {filterState.searchQuery && (
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filterState,
                  searchQuery: "",
                })
              }
              className={`absolute right-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition ${
                isDarkEffective
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
              title="Hapus pencarian"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. HORIZONTAL CATEGORY TABS WITH COUNTERS ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
        {categories.map((cat) => {
          const isSelected = filterState.category === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filterState,
                  category: cat.id,
                })
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs shrink-0 border transition-all select-none duration-150 active:scale-95 ${
                isSelected ? styles.pillActive : styles.pillInactive
              }`}
            >
              <span>{cat.icon}</span>
              <span className="whitespace-nowrap">{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                  isSelected ? styles.badgeCountActive : styles.badgeCount
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── 3. QUICK FILTER ROW (BRAND DROPDOWN, GRADE PILLS, PRICE SORT) ── */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Brand Dropdown Selector */}
        <div className="relative inline-flex items-center">
          <select
            value={filterState.brand}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                brand: e.target.value,
              })
            }
            className={`appearance-none text-xs font-bold pl-3 pr-7 py-1.5 rounded-xl border cursor-pointer outline-none transition ${styles.selectBg}`}
          >
            <option value="ALL" className={isDarkEffective ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
              🏷️ Semua Brand ({availableBrands.length})
            </option>
            {availableBrands.map((b) => (
              <option
                key={b}
                value={b}
                className={isDarkEffective ? "bg-slate-900 text-white" : "bg-white text-slate-900"}
              >
                {b}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`w-3.5 h-3.5 absolute right-2 pointer-events-none opacity-60`}
          />
        </div>

        {/* Grade Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {grades.map((g) => {
            const isSelected = filterState.grade === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() =>
                  onFilterChange({
                    ...filterState,
                    grade: g.id,
                  })
                }
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 border transition-all select-none ${
                  isSelected ? styles.chipActive : styles.chipInactive
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {/* Price Sort Dropdown */}
        <div className="relative inline-flex items-center ml-auto">
          <select
            value={filterState.sort}
            onChange={(e) =>
              onFilterChange({
                ...filterState,
                sort: e.target.value as ProductSortOrder,
              })
            }
            className={`appearance-none text-xs font-bold pl-2.5 pr-7 py-1.5 rounded-xl border cursor-pointer outline-none transition ${styles.selectBg}`}
          >
            {sortOptions.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className={isDarkEffective ? "bg-slate-900 text-white" : "bg-white text-slate-900"}
              >
                {s.label}
              </option>
            ))}
          </select>
          <ArrowUpDown
            className="w-3.5 h-3.5 absolute right-2 pointer-events-none opacity-60"
          />
        </div>
      </div>

      {/* ── 4. FILTER SUMMARY & RESET ACTION ── */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-500/10">
        <span className={isDarkEffective ? "text-slate-400" : "text-slate-500"}>
          Menampilkan <strong className={isDarkEffective ? "text-white" : "text-slate-900"}>{totalFilteredCount ?? products.length}</strong> unit siap kirim
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 font-bold text-xs hover:underline text-rose-500 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filter</span>
          </button>
        )}
      </div>
    </div>
  );
}

export interface ProductEmptyStateProps {
  storeName: string;
  storeWhatsapp: string;
  onReset: () => void;
  isDark?: boolean;
}

export function ProductEmptyState({
  storeName,
  storeWhatsapp,
  onReset,
  isDark = false,
}: ProductEmptyStateProps) {
  const cleanWa = (storeWhatsapp || "628123456789").replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
    storeName
  )},%20saya%20mencari%20unit%20HP%20second%20tertentu%20yang%20belum%20muncul%20di%20katalog.%20Apakah%20bisa%20bantu%20cek%20stok%20gudang?`;

  return (
    <div
      className={`rounded-3xl p-6 sm:p-8 text-center border space-y-4 my-6 ${
        isDark
          ? "bg-slate-900/60 border-slate-800 text-slate-200"
          : "bg-slate-50/90 border-slate-200 text-slate-800"
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-inner ${
          isDark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-400 border border-slate-200"
        }`}
      >
        🔍
      </div>

      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className={`text-base font-black ${isDark ? "text-white" : "text-slate-950"}`}>
          Tidak ada unit HP yang cocok dengan filter Anda
        </h3>
        <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Coba longgarkan kata kunci pencarian, pilih brand lain, atau reset seluruh filter untuk melihat katalog lengkap.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onReset}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-150 active:scale-95 ${
            isDark
              ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Semua Filter</span>
        </button>

        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition duration-150 active:scale-95"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Titip Cari via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
