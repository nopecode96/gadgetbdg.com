"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Sparkles,
  Search,
  MessageCircle,
  ArrowUpRight,
  ShieldCheck,
  BatteryCharging,
  Layers,
  ArrowRight,
  Star,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { trackWhatsAppClickAction } from "@/lib/actions";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function TokyoEditorialLayout({ store, products }: ArchetypeLayoutProps) {
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
      `Halo ${store.name}, saya berminat dengan kurasi unit:\n\n*${product.name}*\n• Harga: ${formatRupiah(
        product.price
      )}\n• Spek: ${product.ramRom}\n• Kondisi: ${product.condition}\n\nApakah masih ready untuk COD?`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] text-[#1c1a17] font-sans selection:bg-[#d94823] selection:text-white">
      {/* ── Infinite Text Marquee ── */}
      <div className="bg-[#1c1a17] text-[#f4f1ea] py-2 overflow-hidden text-xs font-black uppercase tracking-widest border-b border-[#dfd8cc]">
        <div className="flex gap-12 animate-marquee whitespace-nowrap">
          <span>// TOKYO TECH ARCHIVE //</span>
          <span>CURATED MOBILE INVENTORY 2026</span>
          <span>AUTHENTIC HARDWARE ONLY</span>
          <span>BANDUNG ELECTRONIC CENTER</span>
          <span>TESTED &amp; VERIFIED //</span>
        </div>
      </div>

      {/* ── Editorial Header ── */}
      <header className="sticky top-0 z-40 bg-[#f4f1ea]/90 backdrop-blur-md border-b border-[#dfd8cc] px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Store Real Logo / Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#1c1a17] text-[#f4f1ea] flex items-center justify-center font-black text-xs shrink-0 overflow-hidden border border-[#dfd8cc]">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                store.name.slice(0, 2).toUpperCase()
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tighter uppercase text-[#1c1a17]">
                  {store.name}
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
              <p className="text-[10px] text-[#736c62] font-semibold flex items-center gap-1">
                📍 {store.address ? store.address.split(",")[0] : "BEC Lt. 1, Bandung"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(["home", "list", "trade-in"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                  activeTab === tab
                    ? "bg-[#1c1a17] text-[#f4f1ea]"
                    : "text-[#736c62] hover:text-[#1c1a17]"
                }`}
              >
                {tab === "home" ? "Editorial" : tab === "list" ? "Index" : "Exchange"}
              </button>
            ))}
            <a
              href={`https://wa.me/${(store.whatsapp || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-full bg-[#d94823] text-white hover:bg-[#bc3b1a] transition shadow-xs"
              title="Chat WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Magazine Grid Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {activeTab === "home" && (
          <>
            {/* Asymmetrical Magazine Cover Story */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-[#1c1a17] text-[#f4f1ea] rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 shadow-xl">
                <div className="space-y-3">
                  <div className="inline-block bg-[#d94823] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                    CURATED DROP
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter leading-none">
                    STREET TECH.
                    <br />
                    PRE-OWNED.
                    <br />
                    FLAWLESS.
                  </h2>
                </div>

                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <p className="text-xs text-zinc-400 font-medium leading-relaxed max-w-md">
                    Eksplorasi visual unit smartphone second grade premium. Diperiksa teliti oleh teknisi profesional sebelum masuk kurasi etalase.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveTab("list")}
                      className="px-5 py-2.5 rounded-full font-black text-xs uppercase bg-[#d94823] text-white hover:bg-[#bc3b1a] transition tracking-wider flex items-center gap-1.5"
                    >
                      <span>Buka Index Stok</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setActiveTab("trade-in")}
                      className="px-5 py-2.5 rounded-full font-bold text-xs uppercase border border-zinc-700 text-white hover:bg-zinc-900 transition tracking-wider"
                    >
                      Tukar Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* High-Resolution Lead Unit Hero Card */}
              {products[0] && (
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#dfd8cc] flex flex-col justify-between shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d94823]">
                      // COVER UNIT
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-[#f4f1ea] px-2 py-0.5 rounded-full">
                      {products[0].condition}
                    </span>
                  </div>

                  <div className="w-full aspect-square rounded-2xl bg-[#f4f1ea] p-4 flex items-center justify-center overflow-hidden">
                    {products[0].images?.[0] ? (
                      <img
                        src={products[0].images[0]}
                        alt={products[0].name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">Photo Unavailable</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-[#1c1a17] uppercase tracking-tight truncate">
                      {products[0].name}
                    </h3>
                    <p className="text-xs text-[#736c62]">{products[0].ramRom}</p>
                    <div className="text-2xl font-black text-[#1c1a17] pt-1">
                      {formatRupiah(products[0].price)}
                    </div>
                  </div>

                  <Link
                    href={`/${store.slug}/product/${products[0].id}`}
                    className="w-full py-2.5 rounded-full font-black text-xs uppercase bg-[#1c1a17] text-white hover:bg-[#d94823] transition flex items-center justify-center gap-1 tracking-wider"
                  >
                    <span>Inspect Unit</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Editorial Showcase Gallery (Grid of Curated Units) */}
            <div className="space-y-6">
              <div className="flex items-baseline justify-between border-b-2 border-[#1c1a17] pb-3">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  INVENTORY ARCHIVE
                </h3>
                <span className="text-xs font-mono font-bold text-[#736c62]">
                  {products.length} CATALOGUED ITEMS
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.slice(1).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl p-5 border border-[#dfd8cc] hover:border-[#1c1a17] transition-all duration-300 space-y-4 shadow-sm group"
                  >
                    <div className="w-full h-48 rounded-2xl bg-[#f4f1ea] p-3 flex items-center justify-center overflow-hidden relative">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <span className="text-xs text-[#736c62]">No Image</span>
                      )}

                      <span className="absolute top-2 left-2 text-[9px] font-black uppercase bg-[#1c1a17] text-white px-2 py-0.5 rounded-full tracking-wider">
                        {p.brand}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-mono text-[#736c62]">
                        <span>{p.ramRom}</span>
                        {p.batteryHealth && <span className="font-bold">BH {p.batteryHealth}%</span>}
                      </div>
                      <h4 className="font-black text-sm text-[#1c1a17] uppercase tracking-tight line-clamp-1">
                        {p.name}
                      </h4>
                      <div className="text-base font-black text-[#d94823] pt-1">
                        {formatRupiah(p.price)}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-[#dfd8cc]/60">
                      <Link
                        href={`/${store.slug}/product/${p.id}`}
                        className="flex-1 py-2 text-center rounded-full font-black text-[11px] uppercase bg-[#f4f1ea] hover:bg-[#1c1a17] hover:text-white transition tracking-wider"
                      >
                        Inspect
                      </Link>
                      <a
                        href={getWaLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-full bg-[#d94823] text-white hover:bg-[#bc3b1a] transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736c62]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari katalog atau brand..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-[#dfd8cc] text-[#1c1a17] text-xs focus:outline-none focus:border-[#1c1a17]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition whitespace-nowrap ${
                      selectedBrand === b
                        ? "bg-[#1c1a17] text-white"
                        : "bg-white text-[#736c62] border border-[#dfd8cc] hover:text-[#1c1a17]"
                    }`}
                  >
                    {b === "ALL" ? "All Series" : b}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-[#dfd8cc] flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <span className="text-[9px] font-black uppercase text-[#d94823] tracking-widest">
                      {p.brand}
                    </span>
                    <h4 className="font-black text-sm text-[#1c1a17] truncate">{p.name}</h4>
                    <p className="text-xs text-[#736c62]">{p.ramRom} • {p.condition}</p>
                    <div className="text-sm font-black text-[#1c1a17] pt-0.5">{formatRupiah(p.price)}</div>
                  </div>
                  <Link
                    href={`/${store.slug}/product/${p.id}`}
                    className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase bg-[#1c1a17] text-white hover:bg-[#d94823] transition shrink-0"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Trade-In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="tokyo-editorial" />
        )}
      </main>
    </div>
  );
}
