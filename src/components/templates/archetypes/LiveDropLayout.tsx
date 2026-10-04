"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import {
  Flame,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { StoreData, ProductData, StoreTabType } from "../shared/types";
import { StoreTradeInView } from "../shared/StoreTradeInView";
import { trackWhatsAppClickAction } from "@/lib/actions";
import { getProductDetailUrl } from "@/lib/product-slug";

interface ArchetypeLayoutProps {
  store: StoreData;
  products: ProductData[];
}

export function LiveDropLayout({ store, products }: ArchetypeLayoutProps) {
  const [activeTab, setActiveTab] = useState<StoreTabType>("home");
  const [activeImageMap, setActiveImageMap] = useState<Record<string, number>>({});

  function getWaLink(product: ProductData) {
    let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    const msg = encodeURIComponent(
      `[LIVE DROP DROP] Halo ${store.name}, saya mau ambil unit ini dari feed:\n\n*${product.name}*\n• Harga: ${formatRupiah(
        product.price
      )}\n• Spek: ${product.ramRom}\n• Kondisi: ${product.condition}\n\nUnit masih ready untuk di-checkout?`
    );
    return `https://wa.me/${cleanWa}?text=${msg}`;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#fe2c55]">
      {/* ── Top Reels Header ── */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-neutral-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fe2c55] animate-ping" />
            <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>{store.name}</span>
              <span className="text-[9px] bg-[#fe2c55] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                LIVE FEED
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {(["home", "trade-in"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === tab
                    ? "bg-[#fe2c55] text-white"
                    : "bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                {tab === "home" ? "Feed Drops" : "Tukar Tambah"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Mobile 9:16 Vertical Cards Feed ── */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-8 pb-28">
        {activeTab === "home" && (
          <>
            {/* Live Dropped Inventory Stream */}
            <div className="space-y-6">
              {products.map((p, idx) => {
                const currentImgIdx = activeImageMap[p.id] || 0;
                const images = p.images?.length > 0 ? p.images : ["/images/items/iphone-15-pro.png"];

                return (
                  <div
                    key={p.id}
                    className="relative rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-col"
                    style={{ minHeight: "520px" }}
                  >
                    {/* Media Container 9:16 Feel */}
                    <div className="relative flex-1 bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center p-4 overflow-hidden">
                      <img
                        src={images[currentImgIdx]}
                        alt={p.name}
                        className="w-full h-80 object-contain drop-shadow-2xl transition duration-300"
                      />

                      {/* Top Badges Overlay */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="bg-[#fe2c55] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          <span>DROP #{idx + 1}</span>
                        </span>

                        <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                          {p.condition}
                        </span>
                      </div>

                      {/* Snap Thumbnail Dots if > 1 image */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                          {images.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={() =>
                                setActiveImageMap((prev) => ({ ...prev, [p.id]: dotIdx }))
                              }
                              className={`w-2 h-2 rounded-full transition ${
                                currentImgIdx === dotIdx ? "bg-[#fe2c55] scale-125" : "bg-neutral-500"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Sticky CTA */}
                    <div className="p-5 bg-gradient-to-t from-black via-black/90 to-transparent space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            {p.brand}
                          </span>
                          {p.batteryHealth && (
                            <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800">
                              BH {p.batteryHealth}%
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-white leading-tight mt-1">{p.name}</h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {p.ramRom} • {p.imeiStatus}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {formatRupiah(p.price)}
                        </span>
                        <Link
                          href={getProductDetailUrl(store.slug, p, store.isTenantHost)}
                          className="text-xs text-neutral-400 hover:text-white underline"
                        >
                          Cek Spek Lengkap →
                        </Link>
                      </div>

                      {/* High-Conversion WhatsApp Claim Button */}
                      <a
                        href={getWaLink(p)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#fe2c55] hover:bg-[#e0264b] text-white shadow-lg shadow-[#fe2c55]/30 flex items-center justify-center gap-2 transition animate-pulse"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>AMBIL VIA WHATSAPP SEKARANG</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Tab 2: Trade In */}
        {activeTab === "trade-in" && (
          <StoreTradeInView store={store} theme="live-drop" />
        )}
      </main>
    </div>
  );
}
