"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Sparkles,
  Search,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  BatteryCharging,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { StoreAboutView } from "../shared/StoreAboutView";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function KeynoteObsidianLayout({ store, products }: ArchetypeLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("ALL");

  const filtered = products.filter((p) => {
    const matchBrand = selectedBrand === "ALL" || p.brand === selectedBrand;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.ramRom.toLowerCase().includes(search.toLowerCase());
    return matchBrand && matchSearch;
  });

  const featured = products[0];
  const brands = ["ALL", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  function getWaLink(product: ProductData) {
    let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    const msg = encodeURIComponent(
      `Halo ${store.name}, saya berminat dengan unit Apple/Flagship:\n*${product.name}* (${formatRupiah(
        product.price
      )})\n\nApakah masih available?`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Dynamic Island Floating Notification Header */}
      <header className="sticky top-3 z-40 max-w-md mx-auto px-4">
        <div className="bg-black/80 border border-zinc-800/80 backdrop-blur-xl rounded-full px-4 py-2.5 flex items-center justify-between shadow-2xl ring-1 ring-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-extrabold text-xs tracking-tight text-white truncate">
              {store.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTab("home")}
              className={`px-3 py-1 rounded-full transition ${
                activeTab === "home" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Event
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1 rounded-full transition ${
                activeTab === "list" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Stok
            </button>
            <button
              onClick={() => setActiveTab("trade-in")}
              className={`px-3 py-1 rounded-full transition ${
                activeTab === "trade-in" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Trade-In
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-24 space-y-12">
        {activeTab === "home" && (
          <>
            {/* Ambient Spotlight Hero */}
            <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-black text-center space-y-6 shadow-2xl">
              {/* Radial Spotlight glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-72 bg-white/10 blur-[100px] pointer-events-none rounded-full" />

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/60 text-zinc-300 text-[11px] font-medium border border-zinc-700/60 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-zinc-200" />
                <span>Special Keynote Reveal 2026</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  Elegansi Titik Puncak.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-600">
                    Koleksi Second Grade A+
                  </span>
                </h1>
                <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto font-light leading-relaxed">
                  Setiap unit diuji melalui 30 titik diagnostik mesin, baterai terverifikasi asli, dan garansi IMEI resmi seumur hidup.
                </p>
              </div>

              {/* Featured Showcase Unit Horizontal */}
              {featured && (
                <div className="pt-4 max-w-xl mx-auto">
                  <div className="relative group rounded-3xl p-5 border border-zinc-800 bg-[#0e0e12]/90 hover:border-zinc-600 transition-all duration-500 shadow-2xl">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="w-48 h-48 rounded-2xl bg-black/60 p-3 flex items-center justify-center relative overflow-hidden shrink-0 border border-zinc-800/50">
                        {featured.images?.[0] ? (
                          <img
                            src={featured.images[0]}
                            alt={featured.name}
                            className="w-full h-full object-contain transform group-hover:scale-110 transition duration-700"
                          />
                        ) : (
                          <span className="text-zinc-600 text-xs">Flagship Unit</span>
                        )}
                        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded-full">
                          FLAGSHIP PICK
                        </span>
                      </div>

                      <div className="text-left space-y-2 flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {featured.brand}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-snug truncate">
                          {featured.name}
                        </h3>
                        <p className="text-xs text-zinc-400">
                          {featured.ramRom} • {featured.condition}
                          {featured.batteryHealth ? ` • BH ${featured.batteryHealth}%` : ""}
                        </p>
                        <div className="text-xl font-black text-white pt-1">
                          {formatRupiah(featured.price)}
                        </div>

                        <div className="pt-2 flex items-center gap-2">
                          <Link
                            href={`/${store.slug}/product/${featured.id}`}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition"
                          >
                            Detail Lengkap
                          </Link>
                          <a
                            href={getWaLink(featured)}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Showcase Grid Horizontal Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Daftar Unit Terkini</span>
                  <span className="text-xs font-mono text-zinc-500">({products.length})</span>
                </h2>
                <button
                  onClick={() => setActiveTab("list")}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>Buka Semua</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.slice(1, 7).map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl p-4 border border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-600 transition flex items-center gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-black p-2 border border-zinc-800 shrink-0 flex items-center justify-center overflow-hidden">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <span className="text-zinc-600 text-[9px]">No Pic</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold">{p.brand}</span>
                        {p.batteryHealth && (
                          <span className="text-[10px] text-amber-400 font-mono">BH {p.batteryHealth}%</span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-white truncate">{p.name}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{p.ramRom} • {p.condition}</p>
                      <div className="text-sm font-extrabold text-white pt-0.5">
                        {formatRupiah(p.price)}
                      </div>
                    </div>

                    <Link
                      href={`/${store.slug}/product/${p.id}`}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition shrink-0"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Full List */}
        {activeTab === "list" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari iPhone, spesifikasi, atau RAM..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                      selectedBrand === b
                        ? "bg-white text-black"
                        : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {b === "ALL" ? "Semua Brand" : b}
                  </button>
                ))}
              </div>
            </div>

            {/* List Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-4 border border-zinc-800 bg-zinc-950/70 hover:border-zinc-600 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-16 h-16 rounded-xl bg-black p-1.5 border border-zinc-800 shrink-0 flex items-center justify-center">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-zinc-600 text-[9px]">No Pic</span>
                      )}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">{p.brand}</span>
                      <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400">{p.ramRom} • {p.condition}</p>
                      <div className="text-xs font-black text-white">{formatRupiah(p.price)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/${store.slug}/product/${p.id}`}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Trade In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="keynote-obsidian" />
        )}
      </main>
    </div>
  );
}
