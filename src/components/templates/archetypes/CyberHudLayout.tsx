"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Activity,
  Zap,
  Terminal,
  Cpu,
  Search,
  MessageCircle,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function CyberHudLayout({ store, products }: ArchetypeLayoutProps) {
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

  const brands = ["ALL", ...Array.from(new Set(products.map((p) => p.brand).filter(Boolean)))];

  function getWaLink(product: ProductData) {
    let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    const msg = encodeURIComponent(
      `[CYBER HUD ORDER] Halo ${store.name}, saya berminat dengan unit High-FPS:\n\n• Unit: ${product.name}\n• RAM/Storage: ${product.ramRom}\n• Harga: ${formatRupiah(
        product.price
      )}\n\nStatus stok masih ready di store BEC?`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-cyan-100 font-mono selection:bg-cyan-500 selection:text-black">
      {/* ── Top Running Marquee Ticker ── */}
      <div className="bg-cyan-950/80 border-b border-cyan-800/80 py-1.5 px-4 overflow-hidden text-[11px] flex items-center gap-4 text-cyan-400">
        <span className="bg-cyan-500 text-black px-1.5 py-0.2 rounded font-black text-[9px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" /> LIVE TELEMETRY
        </span>
        <div className="flex gap-8 animate-marquee whitespace-nowrap font-bold">
          <span>// TOKO: {store.name.toUpperCase()} //</span>
          <span>// STATUS: 100% ONLINE SIAP COD BANDUNG //</span>
          <span>// GARANSI IMEI SEUMUR HIDUP //</span>
          <span>// TOTAL UNIT READY: {products.length} UNIT //</span>
        </div>
      </div>

      {/* ── HUD Nav Header ── */}
      <header className="sticky top-0 z-40 bg-[#05070a]/90 backdrop-blur-md border-b border-cyan-900/60 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-cyan-950 border border-cyan-500 text-cyan-400 flex items-center justify-center font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              &gt;_
            </div>
            <div>
              <div className="font-black text-sm text-cyan-100 tracking-wider">
                {store.name}
              </div>
              <div className="text-[9px] text-cyan-500 flex items-center gap-1 font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                CONSOLE READY • KASIR BEC
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["home", "list", "trade-in"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded border text-xs uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-cyan-500 text-black border-cyan-400 font-black shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "bg-cyan-950/40 text-cyan-400 border-cyan-900/60 hover:border-cyan-600"
                }`}
              >
                {tab === "home" ? "HQ HUD" : tab === "list" ? "INVENTORY" : "TRADE-IN"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Canvas ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {activeTab === "home" && (
          <>
            {/* Hyper-Performance Hero Banner */}
            <div className="relative rounded-2xl p-6 sm:p-8 border border-cyan-700/60 bg-gradient-to-r from-[#030914] via-[#08182b] to-[#030914] shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-[10px] text-cyan-300 font-bold uppercase">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  HIGH-SPEC &amp; GAMING MACHINE STOCK
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                  READY-TO-FIGHT GADGETS.
                </h1>

                <p className="text-xs text-cyan-300/80 leading-relaxed font-sans font-medium">
                  Katalog HP performa tinggi, flagship teruji tanpa thermal throttling. Semua unit lolos sensor stres test hardware &amp; battery integrity.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab("list")}
                    className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.5)] transition flex items-center gap-1.5"
                  >
                    <span>EXPLORE STOK</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab("trade-in")}
                    className="px-4 py-2 rounded bg-transparent border border-cyan-600 text-cyan-300 hover:bg-cyan-950 font-bold text-xs uppercase tracking-wider transition"
                  >
                    TAKSIR HP LAMA
                  </button>
                </div>
              </div>

              {/* Decorative Tech Grid Lines */}
              <div className="absolute top-2 right-2 text-[9px] text-cyan-800 font-mono select-none pointer-events-none">
                SYS_VER: 2026.4 // CYBER_HUD_OK
              </div>
            </div>

            {/* Inventory HUD Grid with Chamfered Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-900/60 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-black uppercase text-cyan-100">
                    DIAGNOSED INVENTORY LIST
                  </span>
                </div>
                <span className="text-xs text-cyan-500 font-bold">
                  {products.length} UNITS SYNCED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-cyan-900/60 bg-[#09111c]/90 hover:border-cyan-400 transition-all duration-300 p-4 space-y-3 group shadow-md"
                  >
                    {/* Visual Card Image */}
                    <div className="w-full h-40 rounded bg-[#03060a] border border-cyan-950 flex items-center justify-center p-2 relative overflow-hidden group-hover:border-cyan-800 transition">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <span className="text-cyan-800 text-xs">// NO_PREVIEW //</span>
                      )}

                      <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500 text-cyan-300">
                        {p.brand}
                      </span>

                      {p.batteryHealth && (
                        <span className="absolute bottom-2 right-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" /> BH {p.batteryHealth}%
                        </span>
                      )}
                    </div>

                    {/* Title & Spec HUD Bars */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm text-cyan-100 line-clamp-1 group-hover:text-cyan-300 transition">
                        {p.name}
                      </h3>

                      {/* Visual Spec Meter Bar */}
                      <div className="space-y-1 text-[10px] text-cyan-400">
                        <div className="flex justify-between">
                          <span>STORAGE: {p.ramRom}</span>
                          <span className="text-emerald-400">{p.condition}</span>
                        </div>
                        <div className="w-full h-1 bg-cyan-950 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-4/5 animate-pulse" />
                        </div>
                      </div>

                      {p.minusNotes && (
                        <div className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-900/60 p-1.5 rounded truncate">
                          MINUS: {p.minusNotes}
                        </div>
                      )}
                    </div>

                    {/* Price & Action Button */}
                    <div className="pt-2 border-t border-cyan-900/40 flex items-center justify-between">
                      <div className="text-base font-black text-cyan-300">
                        {formatRupiah(p.price)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/${store.slug}/product/${p.id}`}
                          className="px-2.5 py-1.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 hover:bg-cyan-900 text-xs font-bold transition"
                        >
                          SPEC
                        </Link>
                        <a
                          href={getWaLink(p)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black transition"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Full List */}
        {activeTab === "list" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="QUERY DATABASE: NAMA, BRAND, ATAU STORAGE..."
                  className="w-full pl-10 pr-4 py-2.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-100 placeholder-cyan-700 text-xs focus:outline-none focus:border-cyan-400 uppercase"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition whitespace-nowrap ${
                      selectedBrand === b
                        ? "bg-cyan-500 text-black border border-cyan-400"
                        : "bg-cyan-950/40 text-cyan-500 border border-cyan-900 hover:text-cyan-300"
                    }`}
                  >
                    {b === "ALL" ? "ALL-BRANDS" : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-cyan-900/60 bg-[#09111c] p-3.5 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] text-cyan-500 font-bold uppercase">{p.brand}</span>
                      <h4 className="font-bold text-xs text-white line-clamp-1">{p.name}</h4>
                    </div>
                    <span className="text-xs font-black text-cyan-300">{formatRupiah(p.price)}</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 font-sans">
                    {p.ramRom} • {p.condition}
                  </div>
                  <Link
                    href={`/${store.slug}/product/${p.id}`}
                    className="block w-full text-center py-1.5 rounded bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 text-xs font-bold uppercase transition"
                  >
                    VIEW HARDWARE DETAILS
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Trade-In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="cyber-hud" />
        )}
      </main>
    </div>
  );
}
