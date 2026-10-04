"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Table,
  Search,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  BatteryCharging,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Info,
  MapPin,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { trackWhatsAppClickAction } from "@/lib/actions";
import { getProductDetailUrl } from "@/lib/product-slug";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function CleanLedgerLayout({ store, products }: ArchetypeLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("ALL");
  const [selectedBranchId, setSelectedBranchId] = useState("ALL");
  const [filterCondition, setFilterCondition] = useState("ALL");

  const storeBranches = store.branches && store.branches.length > 1 ? store.branches : [];

  const filtered = products.filter((p) => {
    const matchBrand = selectedBrand === "ALL" || p.brand === selectedBrand;
    const matchBranch =
      selectedBranchId === "ALL" ||
      p.branchId === selectedBranchId ||
      p.branch?.id === selectedBranchId;
    const matchCondition = filterCondition === "ALL" || p.condition.includes(filterCondition);
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.ramRom.toLowerCase().includes(search.toLowerCase()) ||
      p.imeiStatus.toLowerCase().includes(search.toLowerCase()) ||
      (p.branch?.name || "").toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchBranch && matchCondition && matchSearch;
  });

  const brands = ["ALL", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  function getWaLink(product: ProductData) {
    let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    const msg = encodeURIComponent(
      `Halo ${store.name}, saya berminat dengan unit di ledger:\n\n*${product.name}*\n• Harga: ${formatRupiah(
        product.price
      )}\n• Spek: ${product.ramRom}\n• IMEI: ${product.imeiStatus}\n\nApakah masih ready?`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* ── Modern Terminal Ledger Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                {store.name}
              </h1>
              <p className="text-[10px] text-slate-500 font-mono">
                DATA LEDGER // INVENTORY RESMI BANDUNG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["home", "trade-in"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tab === "home" ? "Ledger Stok" : "Tukar Tambah"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Ledger Content Canvas ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-20">
        {activeTab === "home" && (
          <>
            {/* Quick Filter & Instant Search Terminal Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Pencarian cepat: iPhone 13, BH, RAM, atau status IMEI..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                        selectedBrand === b
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {b === "ALL" ? "Semua Brand" : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch Location Pills */}
              {storeBranches.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-100 pt-2.5">
                  <button
                    onClick={() => setSelectedBranchId("ALL")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                      selectedBranchId === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Semua Lokasi ({products.length})</span>
                  </button>
                  {storeBranches.map((br) => {
                    const cnt = products.filter(
                      (p) => p.branchId === br.id || p.branch?.id === br.id
                    ).length;
                    return (
                      <button
                        key={br.id}
                        onClick={() => setSelectedBranchId(br.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                          selectedBranchId === br.id
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span>
                          {br.name} {br.isMain ? "(Pusat)" : ""} ({cnt})
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                <span>Ditemukan: {filtered.length} unit siap transaksi</span>
                <span className="text-emerald-700 font-bold">100% GARANSI TOKO TERDAFTAR</span>
              </div>
            </div>

            {/* Dense Horizontal Rows Ledger (PADAT INFORMASI) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  Tidak ada unit yang sesuai pencarian.
                </div>
              ) : (
                filtered.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left: Thumbnail & High-Density Specs */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <span className="text-slate-400 text-[10px]">No Pic</span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                            {p.brand}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 truncate">
                            {p.name}
                          </h3>
                        </div>

                        {/* Specs Pill Line */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          {p.branch && (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                              <MapPin className="w-2.5 h-2.5" /> {p.branch.name}
                            </span>
                          )}
                          <span className="font-semibold text-slate-800">{p.ramRom}</span>
                          <span>•</span>
                          <span className="text-slate-600">{p.condition}</span>
                          <span>•</span>
                          <span className="text-slate-600">{p.imeiStatus}</span>
                          {p.batteryHealth && (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 text-[10px]">
                              <BatteryCharging className="w-3 h-3" /> BH {p.batteryHealth}%
                            </span>
                          )}
                        </div>

                        {p.minusNotes && (
                          <p className="text-[11px] text-amber-700 italic flex items-center gap-1">
                            <span>Minus:</span> {p.minusNotes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Price & CTA Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <div className="text-xs text-slate-400 font-mono uppercase">Harga Pas / COD</div>
                        <div className="text-base sm:text-lg font-black text-slate-950 font-mono">
                          {formatRupiah(p.price)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={getProductDetailUrl(store.slug, p, store.isTenantHost)}
                          className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                          Detail
                        </Link>
                        <a
                          href={getWaLink(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat WA</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Tab 2: Trade-In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="clean-ledger" />
        )}
      </main>
    </div>
  );
}
