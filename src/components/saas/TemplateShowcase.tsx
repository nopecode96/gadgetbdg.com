"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone, ExternalLink, CheckCircle2, Sparkles, Zap, ShieldCheck } from "lucide-react";

export function TemplateShowcase() {
  const [activeTab, setActiveTab] = useState<"minimal-clean" | "dark-gaming">("minimal-clean");

  return (
    <section id="showcase" className="py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Live Interactive Preview
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Pilihan Desain Website Toko Anda
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Dirancang khusus dengan rasio tampilan mobile-first (PWA), siap dipasang nama toko, logo, dan katalog HP Anda dalam hitungan detik.
          </p>

          {/* Template Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 mt-8 shadow-inner">
            <button
              onClick={() => setActiveTab("minimal-clean")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activeTab === "minimal-clean"
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>1. Minimal Clean (Berkah Cell)</span>
            </button>
            <button
              onClick={() => setActiveTab("dark-gaming")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
                activeTab === "dark-gaming"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>2. Dark Gaming (Gamers Gadget)</span>
            </button>
          </div>
        </div>

        {/* Interactive Device Mockup Frame */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-5xl mx-auto">
          {/* Smartphone Hardware Frame */}
          <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[640px] w-[320px] sm:w-[350px] shadow-2xl">
            {/* Top speaker & notch */}
            <div className="w-[140px] h-[18px] bg-gray-800 top-0 left-1/2 -translate-x-1/2 absolute rounded-b-[1rem] z-30 flex items-center justify-center">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Side buttons */}
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg" />
            <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg" />
            <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg" />

            {/* Screen Content Iframe Container */}
            <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white relative">
              <iframe
                key={activeTab}
                src={activeTab === "minimal-clean" ? "/berkahcell" : "/gamersgadget"}
                title="Live Storefront Preview"
                className="w-full h-full border-none no-scrollbar"
                loading="lazy"
              />
            </div>
          </div>

          {/* Details & Live Action Panel */}
          <div className="w-full lg:max-w-md space-y-6 text-slate-800">
            {activeTab === "minimal-clean" ? (
              <div className="space-y-4 animate-fade-in">
                <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                  TEMPLATE: MINIMAL CLEAN
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Tampilan Elegan Reseller Apple & Flagship
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fokus pada foto unit asli, kejelasan kondisi fisik, dan transparansi status IMEI (Resmi iBox / Kemenperin). Mengedepankan kesan toko profesional dan terpercaya.
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Latar belakang netral dengan badge Battery Health kontras.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Formulir taksir tukar tambah HP instan ke WhatsApp.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pencarian tipe HP & filter brand otomatis.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/berkahcell"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-md transition"
                  >
                    <span>Coba Live Demo Berkah Cell di Tab Baru</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-800">
                  TEMPLATE: DARK GAMING CYBER
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Nuansa Gelap Agresif untuk HP High-FPS & Gaming
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kombinasi latar hitam pekat dan aksen neon hijau emerald. Dirancang khusus untuk memikat komunitas gamer mobile di Bandung yang mencari ROG Phone, POCO F-series, dan iQOO.
                </p>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Desain cyberpunk neon dengan label hardware tested.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tombol order direct chat bernuansa gaming rig.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Ramah baterai smartphone OLED dengan dark mode penuh.</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/gamersgadget"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition"
                  >
                    <span>Coba Live Demo Gamers Gadget di Tab Baru</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
