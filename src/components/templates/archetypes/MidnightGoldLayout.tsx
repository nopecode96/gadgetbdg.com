"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Sparkles,
  Crown,
  ShieldCheck,
  Search,
  MessageCircle,
  Gem,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function MidnightGoldLayout({ store, products }: ArchetypeLayoutProps) {
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
      `Halo Concierge ${store.name}, saya berminat dengan koleksi butik:\n\n*${product.name}*\n• Harga: ${formatRupiah(
        product.price
      )}\n• Spek: ${product.ramRom}\n• Kondisi: ${product.condition}\n\nMohon info ketersediaan unit dan jadwal pengecekan toko.`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-[#080705] text-[#f7ecd6] font-serif selection:bg-amber-600 selection:text-black">
      {/* ── Top Gold Luxury Header ── */}
      <header className="sticky top-0 z-40 bg-[#080705]/95 backdrop-blur-md border-b border-amber-900/40 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 text-black flex items-center justify-center font-black shadow-md shadow-amber-500/20 overflow-hidden shrink-0 border border-amber-400/40">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <Crown className="w-4 h-4 text-black" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-wider text-amber-200 uppercase font-serif">
                  {store.name}
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
              <p className="text-[9px] text-amber-500/80 uppercase tracking-widest font-mono">
                📍 {store.address ? store.address.split(",")[0] : "BEC BANDUNG"} • HAUTE BOUTIQUE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["home", "list", "trade-in"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/20"
                    : "text-amber-300/60 hover:text-amber-200"
                }`}
              >
                {tab === "home" ? "Salon" : tab === "list" ? "Katalog" : "Concierge"}
              </button>
            ))}
            <a
              href={`https://wa.me/${(store.whatsapp || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black transition shadow-md shadow-amber-500/20"
              title="Concierge WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Boutique Canvas ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {activeTab === "home" && (
          <>
            {/* VIP Concierge Hero */}
            <div className="relative rounded-3xl p-8 sm:p-12 border border-amber-700/40 bg-gradient-to-b from-[#141009] via-[#0d0b07] to-[#080705] text-center space-y-5 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-xs font-sans font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pemeriksaan 100% Orisinalitas &amp; Garansi Personal</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black text-amber-100 tracking-tight leading-tight">
                  Koleksi Eksklusif.
                  <br />
                  <span className="italic font-light text-amber-400">
                    Nilai Tertinggi untuk Kepuasan Anda.
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-amber-200/70 max-w-lg mx-auto font-sans font-light leading-relaxed">
                  Kami mengkurasi smartphone second dalam kondisi paling prima di Bandung. Garansi mesin penuh, jaminan IMEI aman, dan pelayanan eksklusif VIP.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3 font-sans">
                <button
                  onClick={() => setActiveTab("list")}
                  className="px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 transition shadow-lg shadow-amber-500/20"
                >
                  Lihat Koleksi Lengkap
                </button>
              </div>
            </div>

            {/* Showcase Boutique Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-amber-200 flex items-center gap-2">
                  <Gem className="w-4 h-4 text-amber-400" />
                  <span>Koleksi Istimewa Hari Ini</span>
                </h3>
                <span className="text-xs font-mono text-amber-400/60 font-sans">
                  {products.length} Unit Terkurasi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-3xl p-5 border border-amber-900/40 bg-[#120f0a]/90 hover:border-amber-600 transition-all duration-300 space-y-4 shadow-xl flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="w-full h-52 rounded-2xl bg-black/80 border border-amber-950 p-4 flex items-center justify-center overflow-hidden relative">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <span className="text-xs text-amber-700 font-sans">Koleksi Butik</span>
                        )}

                        <span className="absolute top-3 left-3 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                          {p.brand}
                        </span>

                        {p.batteryHealth && (
                          <span className="absolute bottom-3 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/80 text-amber-300 border border-amber-700/60">
                            BH {p.batteryHealth}%
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-base text-amber-100 line-clamp-1 group-hover:text-amber-300 transition">
                          {p.name}
                        </h4>
                        <p className="text-xs text-amber-300/60 font-sans">
                          {p.ramRom} • {p.condition}
                        </p>
                        <div className="text-xl font-bold text-amber-400 font-mono pt-1">
                          {formatRupiah(p.price)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-950 flex items-center gap-2 font-sans">
                      <Link
                        href={`/${store.slug}/product/${p.id}`}
                        className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-amber-200 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 transition"
                      >
                        Detail Unit
                      </Link>
                      <a
                        href={getWaLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:from-amber-300 hover:to-amber-500 transition shadow-md"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Full List */}
        {activeTab === "list" && (
          <div className="space-y-6 font-sans">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari seri iPhone atau spesifikasi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#120f0a] border border-amber-900/60 text-amber-100 placeholder-amber-700 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                      selectedBrand === b
                        ? "bg-amber-500 text-black"
                        : "bg-[#120f0a] text-amber-400/60 border border-amber-900/60 hover:text-amber-200"
                    }`}
                  >
                    {b === "ALL" ? "Semua Seri" : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl p-4 border border-amber-900/40 bg-[#120f0a] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-amber-500 uppercase">{p.brand}</span>
                    <h4 className="font-bold text-sm text-amber-100 truncate">{p.name}</h4>
                    <p className="text-xs text-amber-300/60">{p.ramRom} • {p.condition}</p>
                    <div className="text-sm font-bold text-amber-400 font-mono pt-1">
                      {formatRupiah(p.price)}
                    </div>
                  </div>
                  <Link
                    href={`/${store.slug}/product/${p.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition shrink-0"
                  >
                    Inspect
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Trade-In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="midnight-gold" />
        )}
      </main>
    </div>
  );
}
