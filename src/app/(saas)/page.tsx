"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Store,
  MessageCircle,
  BarChart3,
  BadgeCheck,
  Sparkles,
  RefreshCw,
  Flame,
  ChevronDown,
  Upload,
  Share2,
  Camera,
  Check,
  HelpCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { StoreRegistrationModal } from "@/components/saas/StoreRegistrationModal";
import { TemplateShowcase } from "@/components/saas/TemplateShowcase";

export default function SaaSlandingPage() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const pricingTiers = [
    {
      name: "Starter",
      labelBadge: "STARTER • PERINTIS",
      originalPrice: "Rp 350.000",
      price: "Rp 250.000",
      discountBadge: "HEMAT 28%",
      tagline: "Langkah Awal Konter Manual Jadi Katalog Online",
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
      labelBadge: "PRO • BISNIS MANDIRI",
      popularBadge: "PALING LARIS",
      originalPrice: "Rp 850.000",
      price: "Rp 600.000",
      discountBadge: "HEMAT 30%",
      tagline: "Solusi Lengkap Toko Berkembang: Bebas Curi Foto",
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
      labelBadge: "ADVANCE • KELAS SULTAN",
      popularBadge: "EKSKLUSIF",
      originalPrice: "Rp 1.500.000",
      price: "Rp 1.000.000",
      discountBadge: "HEMAT 33%",
      tagline: "Ekosistem Tanpa Batas untuk Jaringan Cabang",
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

  const faqs = [
    {
      q: "Apakah saya harus paham komputer atau koding?",
      a: "Sama sekali tidak. Anda hanya butuh smartphone. Masukkan foto dari kamera HP, ketik nama unit, harga, Battery Health, dan kondisi fisik. Dalam 30 detik produk langsung tayang di link web tokomu.",
    },
    {
      q: "Bagaimana cara pembeli bayar barangnya?",
      a: "Pembeli langsung menghubungi WhatsApp Anda dengan pesan otomatis rapi yang memuat nama unit & link spesifikasinya. Transaksi pembayaran, transfer langsung, maupun janjian COD di toko/konter sepenuhnya berlangsung antara Anda dan pembeli.",
    },
    {
      q: "Apakah foto HP dagangan saya aman dari pencurian?",
      a: "Sangat aman. Untuk paket Pro dan Advance, sistem kami otomatis memberi cap watermark nama atau logo tokomu melintang di atas foto setiap unit. Calo dan olshop penipu di Facebook/IG tidak bisa lagi mencuri foto etalasemu.",
    },
    {
      q: "Bagaimana pembeli mengajukan tukar tambah (trade-in)?",
      a: "Di web tokomu terdapat formulir taksiran tukar tambah interaktif. Calon buyer mengisi tipe HP lamanya, kondisi fisik, battery health, minus, dan harga yang diharapkan. Penawaran langsung tersimpan di sistem toko dan terkirim otomatis ke WhatsApp tokomu.",
    },
    {
      q: "Apakah ada potongan komisi dari setiap unit yang laku?",
      a: "0% komisi transaksi! GadgetBdg adalah software langganan flat per bulan. Seluruh margin keuntungan penjualan 100% milik toko Anda tanpa potongan sepeser pun.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* ── HEADER NAVIGATION ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shadow-blue-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-950">
              gadget<span className="text-blue-600">bdg</span>
              <span className="text-slate-400 font-medium text-xs ml-1">.com</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              4 Solusi Konter
            </a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">
              Cara Kerja
            </a>
            <a href="#showcase" className="hover:text-blue-600 transition-colors">
              Pilihan Template
            </a>
            <a href="#harga" className="hover:text-blue-600 transition-colors">
              Biaya Paket
            </a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">
              Tanya Jawab
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <a
              href="https://toko.gadgetbdg.com"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
            >
              Login Toko
            </a>
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              Buka Web Toko
            </button>
          </div>
        </div>
      </header>

      {/* ── 1. HERO SECTION (SPLIT 2-KOLOM YANG MENGGIGIT) ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Kolom Kiri: Copywriting Memikat & Direct Value */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs font-black shadow-xs">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>RAHASIA OMSET KONTER BEC &amp; ITC NAIK KELAS</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Tinggalkan Format Teks List WA yang Bikin Pusing.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Punya Web Toko HP Sendiri, Closing Rapi di WhatsApp.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                Calon pembeli bisa langsung cek <b>Battery Health</b>, <b>foto lecet fisik</b>, <b>status legalitas IMEI</b>, dan tawar tukar tambah secara transparan. Anda tidak perlu lagi lelah ketik spek berulang-ulang, tinggal terima chat pembeli serius!
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-6 sm:px-8 py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition text-sm sm:text-base"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>🚀 Buat Web Toko Sekarang (Cuma 5 Menit)</span>
                </button>
                <a
                  href="#showcase"
                  className="px-5 py-4 rounded-2xl font-bold text-slate-800 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition text-sm shadow-xs"
                >
                  <span>Lihat Contoh Web Toko Demo</span>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </a>
              </div>

              {/* Micro Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tanpa Koding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Auto-Watermark Anti-Maling Foto</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Support COD Bandung Raya</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Visual Perbandingan Konkret (Cara Lama vs Pakai GadgetBdg) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 relative">
                <div className="text-center pb-4 mb-4 border-b border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Kenyataan Pedagang HP Second
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    Mengapa Harus Pindah ke GadgetBdg?
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Sisi Merah: Cara Lama */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wide">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Cara Lama yang Melelahkan</span>
                    </div>
                    <ul className="text-xs text-rose-950/80 space-y-1.5 pl-5 list-disc font-medium leading-relaxed">
                      <li>Broadcast list teks WA panjang, calon buyer malas baca &amp; pusing.</li>
                      <li>Nanya berulang kali: <i>"Minus apa bang? BH berapa? IMEI aman gak?"</i></li>
                      <li>Foto etalase motret sendiri sering dicuri olshop bodong untuk nipu.</li>
                      <li>Penaksiran tukar tambah manual lewat chat, berantakan &amp; rawan lupa.</li>
                    </ul>
                  </div>

                  {/* Sisi Hijau: Pakai GadgetBdg */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Pakai Toko Online GadgetBdg</span>
                    </div>
                    <ul className="text-xs text-emerald-950 space-y-1.5 pl-5 list-disc font-bold leading-relaxed">
                      <li>Web profesional dengan logo tokomu sendiri, link siap ditaruh di bio IG/WA.</li>
                      <li>Kartu spesifikasi transparan: BH, IMEI, fisik, minus, langsung jelas.</li>
                      <li>Watermark otomatis logo tokomu: foto 100% aman anti-bajak.</li>
                      <li>Formulir taksiran Trade-In otomatis, draf spek langsung masuk ke WhatsApp toko.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-center">
                  <span className="text-[11px] text-slate-500 font-bold">
                    ⚡ Bergabung bersama puluhan konter gadget BEC, ITC, &amp; Balubur Bandung
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SEKSI 4 SOLUSI SAKIT KEPALA PEDAGANG ── */}
      <section id="fitur" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              SOLUSI MASALAH HARIAN TOKO
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Bukan Fitur Abstrak. Ini Senjata Menjawab Keraguan Pembeli.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Dirancang khusus dari pengalaman nyata pedagang HP bekas di sentra konter Indonesia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-blue-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2 leading-snug">
                  Katalog Transparan Khusus HP Second
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Lengkap dengan persentase <b>Battery Health</b>, legalitas <b>IMEI Kemenperin</b>, grade mulus, dan foto catatan minus lecet fisik. Menghemat waktu Anda menjawab chat berulang-ulang.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] font-black text-blue-600">
                ✓ Buyer yakin, closing lebih cepat
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2 leading-snug">
                  Otomatis Watermark Logo Toko
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Setiap upload foto dagangan langsung dari kamera HP, logo tokomu otomatis dicap rapi di atas foto. Bebas dari calo dan penipu medsos yang suka mencuri foto etalase konter.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] font-black text-emerald-600">
                ✓ Foto 100% aman anti-pencurian
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-purple-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-4">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2 leading-snug">
                  Formulir Terima Tukar Tambah / Beli Unit
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Pembeli yang mau jual atau tukar HP tinggal isi tipe, kondisi fisik, BH, dan minus di web tokomu. Draf penawaran langsung tersimpan dan otomatis terkirim rapi ke WhatsApp tokomu.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] font-black text-purple-600">
                ✓ Sumber stok trade-in makin lancar
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-pink-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-600/10 text-pink-600 flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2 leading-snug">
                  Bikin Gambar Story IG &amp; Status WA Sekali Klik
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed font-medium">
                  Tombol otomatis membuat poster ukuran 9:16 siap posting lengkap dengan banner promo 'Flash Sale' atau 'Siap COD BEC', lengkap dengan caption siap copas ke Facebook &amp; IG.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 text-[11px] font-black text-pink-600">
                ✓ Posting harian sat-set tanpa Canva
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SEKSI "3 LANGKAH MUDAH, GAK PAKE RIBET" ── */}
      <section id="cara-kerja" className="py-20 bg-slate-100/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              PANDUAN PEMULA
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              3 Langkah Mudah, Gak Pake Ribet
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Bisa langsung dipakai dari HP Anda sekarang juga tanpa perlu instal software rumit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                Ketik Nama Tokomu &amp; Pilih Template Keren
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tentukan subdomain gratis tokomu (contoh: <code>berkahcell.gadgetbdg.com</code>) dan pilih tampilan tema yang paling cocok dengan karakter brand tokomu.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                2
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                Upload Stok HP Bekas Langsung dari Kamera HP
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Foto unit fisik, masukkan harga, kapasitas memori, persentase BH, dan kondisi lecet. Logo toko otomatis tercap sebagai watermark resmi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
                3
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                Tempel Link Web Tokomu di Bio IG &amp; Status WhatsApp
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tiap ada buyer nanya "ready apa aja bang?", cukup kirim link web tokomu. Buyer bebas memilih unit dan klik tombol beli langsung ke WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SEKSI TEMPLATE SHOWCASE (INTERACTIVE SMARTPHONE ENGINE) ── */}
      <section id="showcase" className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
              SHOWCASE 6 ARKETIPE STOREFRONT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pilih Gaya yang Pas Buat Brand Tokomu
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              Dari gaya minimalis ala Apple Store, mode gelap gaming ROG, butik mewah emas, hingga gaya streetwear Tokyo. Coba interaksinya langsung di layar ponsel berikut:
            </p>
          </div>

          {/* Interactive Smartphone Showcase Component */}
          <TemplateShowcase />
        </div>
      </section>

      {/* ── 5. SEKSI PILIHAN PAKET DENGAN HARGA CORET (OPSI 2) ── */}
      <section id="harga" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              BIAYA LANGGANAN TRANSPARAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Investasi Terjangkau, Cukup Dari Untung 1 Unit HP
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Pilih paket yang paling pas untuk skala tokomu. Bisa upgrade atau ganti paket kapan saja tanpa biaya penalti.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white border-2 transition-all duration-200 ${
                  tier.highlight
                    ? "border-blue-600 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-600"
                    : "border-slate-200 shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black tracking-wider text-blue-600 uppercase">
                      {tier.labelBadge}
                    </span>
                    {tier.popularBadge && (
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                          tier.highlight
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-purple-600 text-white shadow-xs"
                        }`}
                      >
                        {tier.popularBadge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">{tier.description}</p>

                  {/* Price Anchoring (Harga Coret) */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-slate-400 line-through decoration-rose-500 decoration-2 text-sm font-semibold">
                      {tier.originalPrice}
                    </span>
                    <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                      {tier.discountBadge}
                    </span>
                  </div>

                  {/* Promo Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-slate-950">{tier.price}</span>
                    <span className="text-xs text-slate-500 font-bold">{tier.period}</span>
                  </div>

                  {/* Tagline Pemikat */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 font-semibold mb-6">
                    ✨ {tier.tagline}
                  </div>

                  <div className="space-y-3 mb-8">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className={`w-full py-3.5 rounded-xl font-black text-center text-sm transition shadow-sm ${
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

          {/* Zero Fee Guarantee Footer Callout */}
          <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
            <div className="text-xs font-black text-emerald-800 uppercase tracking-wide flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Jaminan Bebas Potongan Komisi (0% Transaction Fee)</span>
            </div>
            <p className="text-xs text-emerald-900 font-medium">
              Semua paket bebas biaya komisi per transaksi. Semua hasil penjualan HP second 100% milik tokomu seutuhnya.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. SEKSI FAQ KHUSUS PEDAGANG GADGET ── */}
      <section id="faq" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              PERTANYAAN SERING DIAJUKAN
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Tanya Jawab Pedagang Gadget
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Hal-hal yang paling sering ditanyakan oleh rekan-rekan konter sebelum bergabung.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-slate-200 bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base hover:bg-slate-100/70 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium border-t border-slate-200/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER TERPERCAYA ── */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-white font-black text-xl tracking-tight">gadgetbdg.com</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Platform katalog toko online &amp; manajemen stok khusus penjual smartphone second di sentra gadget Bandung (BEC, ITC, Balubur, &amp; Sukajadi).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold">
              <a href="https://toko.gadgetbdg.com" className="text-slate-300 hover:text-white transition">
                Portal Toko
              </a>
              <a href="https://admin.gadgetbdg.com" className="text-slate-300 hover:text-white transition">
                SaaS Admin
              </a>
              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20GadgetBdg,%20saya%20ingin%20konsultasi%20buka%20web%20toko"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WA: 0812-3456-7890</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © 2026 GadgetBdg • Ekosistem Toko Gadget Bandung. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Bandung, Jawa Barat, Indonesia</span>
            </div>
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
