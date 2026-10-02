"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Store,
  MessageCircle,
  BarChart3,
  BadgeCheck,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { StoreRegistrationModal } from "@/components/saas/StoreRegistrationModal";
import { TemplateShowcase } from "@/components/saas/TemplateShowcase";

export default function SaaSlandingPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const pricingTiers = [
    {
      name: "Starter",
      badge: "Cocok untuk Pemula",
      price: "Rp 250.000",
      period: "/ bulan",
      description: "Solusi hemat untuk toko HP pemula / konter personal yang ingin katalog online rapi.",
      features: [
        "Subdomain [toko].gadgetbdg.com",
        "Katalog s/d 15 Unit HP Aktif",
        "Akses 1 Akun Admin Toko",
        "Pilihan 2 Template Storefront (Clean & Dark)",
        "Label Spesifikasi HP Bekas (BH, IMEI, Minus)",
        "Direct WhatsApp Order Button",
        "Formulir Pengajuan Tukar Tambah (Trade-In)",
        "Mobile-First Responsive PWA View",
      ],
      highlight: false,
      ctaText: "Mulai Paket Starter",
    },
    {
      name: "Pro",
      badge: "Paling Populer",
      price: "Rp 600.000",
      period: "/ bulan",
      description: "Untuk konter HP aktif BEC / Bandung yang ingin scale-up penjualan & branding.",
      features: [
        "Semua fitur Starter",
        "Dukungan Custom Domain (.com / .id)",
        "Katalog s/d 30 Unit HP Aktif",
        "Akses hingga 3 Akun Admin/Kasir",
        "Pilihan 10 Template Premium",
        "Ganti Template 1x per 30 Hari",
        "Watermark Foto Otomatis Logo Toko",
        "Prioritas Listing di Direktori GadgetBdg",
      ],
      highlight: true,
      ctaText: "Pilih Paket Pro",
    },
    {
      name: "Advance",
      badge: "Grosir / Multi-Cabang",
      price: "Rp 1.000.000",
      period: "/ bulan",
      description: "Kapasitas tanpa batas untuk juragan HP second dengan perputaran stok masif & multi-cabang.",
      features: [
        "Semua fitur Pro",
        "Kapasitas Stok UNLIMITED (Tanpa Batas)",
        "5 Akun Akses per Cabang (Multi-Branch)",
        "Pilihan 30 Template Storefront",
        "Bebas Ganti Template Kapan Saja",
        "Watermark Foto Otomatis Logo Toko",
        "Dedicated Server Support & Setup Bantuan",
        "Integrasi & Prioritas Update Fitur",
      ],
      highlight: false,
      ctaText: "Pilih Paket Advance",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              gadget<span className="text-blue-600">bdg</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              Fitur Toko
            </a>
            <a href="#showcase" className="hover:text-blue-600 transition-colors">
              Showcase Template
            </a>
            <a href="#harga" className="hover:text-blue-600 transition-colors">
              Harga Paket
            </a>
            <a
              href="https://toko.gadgetbdg.com"
              className="hover:text-blue-600 transition-colors font-semibold"
            >
              Login Toko
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://toko.gadgetbdg.com"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              Masuk
            </a>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition"
            >
              Buka Web Toko
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-blue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-6">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            Dibuat Khusus Komunitas & Toko HP Bekas Bandung (BEC, Balubur, ITC, Sukajadi)
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-950 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Bikin Web Toko HP Bekas <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Cuma 5 Menit, Closing Cepat di WA
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Tinggalkan format broadcast teks panjang yang bikin pusing calon pembeli. Tampilkan katalog rapi dengan
            spesifikasi detail: <b>Battery Health</b>, <b>Status IMEI</b>, <b>Kondisi Fisik</b>, dan <b>Catatan Minus</b>{" "}
            secara transparan.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" /> Buka Web Toko Baru (5 Menit) <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/berkahcell"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              Demo: Berkah Cell (Minimal)
            </Link>
            <Link
              href="/gamersgadget"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
            >
              Demo: Gamers Gadget (Dark)
            </Link>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tanpa Biaya Setup
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Form Tukar Tambah Terpadu
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Support Custom Domain
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="fitur" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Fitur yang Dirancang Khusus Penjual HP Bekas
            </h2>
            <p className="mt-3 text-slate-600">
              Bukan toko online umum. Setiap elemen dirancang untuk menjawab keraguan calon buyer gadget second.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Katalog Spesial HP Second</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Tampilkan persentase Battery Health, status IMEI Kemenperin, kondisi fisik, dan catatan minus secara transparan untuk meminimalisir komplain.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Cegah Foto Dicuri Kompetitor</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Proteksi watermark otomatis nama toko di atas foto unit HP untuk paket Pro & Advance. Foto fisik motret sendiri tetap aman dari pencurian.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-pink-400 transition">
              <div className="w-12 h-12 rounded-xl bg-pink-600/10 text-pink-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Generator Story Siap Posting</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Download poster story 9:16 HD 1-klik dengan watermark dan preset promo Flash Sale / Promo Gajian, lengkap dengan caption siap copas ke Facebook & IG.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-400 transition">
              <div className="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-5">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Form Tukar Tambah Direct WA</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Calon pembeli bisa input tipe HP lama mereka dan kondisi minus untuk ditaksir harga secara cepat langsung masuk ke WhatsApp tokomu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Template Showcase */}
      <TemplateShowcase />

      {/* Pricing Section */}
      <section id="harga" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pilihan Paket Berlangganan
            </h2>
            <p className="mt-3 text-slate-600">
              Pilih paket yang paling pas untuk skala tokomu. Bisa upgrade atau downgrade kapan saja.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between p-8 rounded-3xl bg-white border ${
                  tier.highlight
                    ? "border-blue-600 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-600"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-slate-900">{tier.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        tier.highlight ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mb-6">{tier.description}</p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-slate-950">{tier.price}</span>
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  </div>

                  <div className="space-y-3.5 mb-8">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition shadow-sm ${
                    tier.highlight
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {tier.ctaText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-400" />
            <span className="text-white font-bold tracking-tight">gadgetbdg.com</span>
            <span className="text-xs text-slate-500 ml-2">© 2026 Bandung Gadget Ecosystem</span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a href="https://toko.gadgetbdg.com" className="hover:text-white transition">
              Portal Toko
            </a>
            <a href="https://admin.gadgetbdg.com" className="hover:text-white transition">
              SaaS Admin
            </a>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Bantuan WA
            </a>
          </div>
        </div>
      </footer>

      {/* Onboarding Wizard Modal */}
      <StoreRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
}
