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
  ExternalLink,
  MapPin,
  AlertTriangle,
  TrendingDown,
  Wallet,
  Calculator,
  Coins,
  Lock,
  Unlock,
  Users,
  Percent,
  QrCode,
  Star,
  Share2,
} from "lucide-react";
import { StoreRegistrationModal } from "@/components/saas/StoreRegistrationModal";
import { TemplateShowcase } from "@/components/saas/TemplateShowcase";
import type { LandingPageData } from "@/lib/actions/homepage-actions";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function LandingClient({ initialData }: { initialData: LandingPageData }) {
  const { settings, plans, featuredStores } = initialData;

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<"STARTER" | "PRO" | "ADVANCE">("PRO");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [calcUnits, setCalcUnits] = useState<number>(15);

  const calcAvgPrice = 5_000_000;
  const calcOmset = calcUnits * calcAvgPrice;
  const calcMarketplaceFee = Math.round(calcOmset * 0.07);
  const calcGadgetBdgFee = 600_000; // Paket PRO flat
  const calcSavings = calcMarketplaceFee - calcGadgetBdgFee;

  function handleOpenRegister(tierId: "STARTER" | "PRO" | "ADVANCE" = "PRO") {
    setSelectedTier(tierId);
    setIsRegisterOpen(true);
  }

  const cleanWhatsapp = settings.supportWhatsapp.replace(/\D/g, "");
  const currentYear = new Date().getFullYear();

  // Tier metadata mapping
  const tierConfig: Record<string, {
    labelBadge: string;
    popularBadge?: string;
    highlight: boolean;
    ctaText: string;
    discountBadge: string;
    tagline: string;
    features: string[];
  }> = {
    STARTER: {
      labelBadge: "STARTER • PERINTIS",
      highlight: false,
      ctaText: "Mulai Paket Starter",
      discountBadge: "HEMAT 28%",
      tagline: "Katalog Online PWA Praktis Pengganti Linktree",
      features: [
        "Subdomain Toko: namatoko.gadgetbdg.com",
        "0% Potongan Komisi Transaksi (Keuntungan 100% Milik Toko)",
        "Akses Semua Template Desain Modern (PWA Mobile)",
        "Modul Tukar Tambah / Trade-In Otomatis ke WhatsApp",
        "Watermark Otomatis Logo Toko Anti-Maling",
        "Cetak QR Code Meja Kasir (Katalog Web & Review Google)",
        "Kartu Inspeksi Fisik & Battery Health (BH) Transparan",
      ],
    },
    PRO: {
      labelBadge: "PRO • REKOMENDASI",
      popularBadge: "PALING POPULER",
      highlight: true,
      ctaText: "Pilih Paket Pro (Paling Populer)",
      discountBadge: "HEMAT 33%",
      tagline: "Toko Online Bonafide dengan Domain Brand Sendiri",
      features: [
        "Semua Fitur di Paket Starter +",
        "Custom Domain Sendiri (namatoko.com / namatoko.id)",
        "Tampilan Lebih Terpercaya & Bonafide di Bio IG & Google Search",
        "Dukungan SSL Gratis & Setup Domain Dibantu Tim Sampai Beres",
        "Prioritas Server & Dukungan VIP WhatsApp",
      ],
    },
  };

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
              {settings.platformName.toLowerCase().replace(".com", "")}
              <span className="text-blue-600">.com</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm font-bold text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">
              3 Pilar Utama
            </a>
            <a href="#qr-kasir" className="hover:text-blue-600 transition-colors">
              QR Meja Kasir
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
              href={`https://wa.me/${cleanWhatsapp}?text=Halo%20Admin%20${encodeURIComponent(settings.platformName)},%20saya%20tertarik%20buka%20toko%20online`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Chat WA</span>
            </a>
            <Link
              href="/login"
              className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
            >
              Login Toko
            </Link>
            <button
              onClick={() => handleOpenRegister("PRO")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition"
            >
              Buka Web Toko
            </button>
          </div>
        </div>
      </header>

      {/* ── 1. HERO SECTION DINAMIS DARI DATABASE ── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-blue-50/60 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Kolom Kiri: Copywriting Memikat */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-800 text-xs font-black shadow-xs">
                <span>🚀 UPGRADE LINKTREE BIO SOSMED KAMU</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
                Stop Bikin Pembeli Pusing dengan Linktree Kosong. Ubah Jadi Web Katalog HP Siap Closing!
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                Cukup pasang 1 link katalog di bio Instagram, TikTok, Facebook, dan status WA. Pembeli langsung tahu stok unit ready, cek foto asli &amp; BH tanpa spam chat tanya stok, dan deal instan ke WhatsApp toko Anda.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => handleOpenRegister("PRO")}
                  className="px-6 sm:px-7 py-4 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition text-sm sm:text-base shrink-0"
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Bikin Web Katalog Toko (Mulai Gratis/Demo)</span>
                </button>
                <div className="flex items-center gap-2.5">
                  <a
                    href="#showcase"
                    className="px-5 py-4 rounded-2xl font-bold text-slate-800 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition text-sm shadow-xs"
                  >
                    <span>Lihat Contoh Katalog PWA</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </a>
                </div>
              </div>

              {/* Micro Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-4 text-xs font-extrabold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1 Link untuk Semua Bio Medsos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Format PWA Tanpa Koding</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transaksi 100% Bebas Komisi</span>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Visual Perbandingan Konkret */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/90 relative">
                <div className="text-center pb-3.5 mb-3.5 border-b border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    MASALAH JUALAN HP DI SOSMED
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1.5">
                    Kenapa Harus Ganti Linktree &amp; Multi-Posting?
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {/* KOTAK MERAH */}
                  <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2 text-rose-700 font-black text-xs uppercase tracking-wide">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>CARA LAMA (LINKTREE &amp; MULTI-POSTING)</span>
                    </div>
                    <ul className="text-xs text-rose-950 space-y-1.5 pl-4 list-disc font-medium leading-relaxed">
                      <li>Pasang Linktree cuma isi teks kaku: calon pembeli bingung mau cari unit HP apa.</li>
                      <li>Capek bikin konten &amp; posting manual berkali-kali ke Feeds, Reels, TikTok, FB, &amp; Story WA.</li>
                      <li>HP panas melayani spam chat berulang: &quot;ready tipe apa min?&quot;, &quot;BH berapa?&quot;, &quot;minta foto asli dong&quot;.</li>
                      <li>Barang sudah laku (sold out) tapi lupa dihapus di postingan lama, bikin pembeli kecewa.</li>
                    </ul>
                  </div>

                  {/* KOTAK HIJAU */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-wide">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>PAKAI 1 LINK KATALOG GADGETBDG</span>
                    </div>
                    <ul className="text-xs text-emerald-950 space-y-1.5 pl-4 list-disc font-bold leading-relaxed">
                      <li>Cukup 1 link di semua bio medsos: langsung tampil seperti aplikasi toko HP modern &amp; interaktif.</li>
                      <li>Spek transparan: pembeli bisa cek foto asli, kondisi fisik, Battery Health, &amp; legalitas IMEI mandiri.</li>
                      <li>Sekali upload atau tandai &quot;TERJUAL&quot; di admin, etalase otomatis terbarui tanpa harus repost.</li>
                      <li>Tombol beli langsung meluncur ke WhatsApp kasir lengkap dengan ringkasan unit pilihan buyer.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 text-center">
                  <span className="text-[11px] sm:text-xs text-emerald-700 font-black">
                    ⚡ Solusi Pintar Toko HP • Stop Capek Multi-Posting
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1.5. SECTION KOMPARASI TAJAM: TOKO HIJAU & ORANGE VS WEB TOKO GADGETBDG ── */}
      <section id="komparasi" className="relative overflow-hidden py-16 sm:py-20 lg:py-28 bg-slate-950 text-slate-100 border-b border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
          {/* 1. Badge & Headline Utama */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs sm:text-sm font-black tracking-wide uppercase shadow-sm">
              <span>⚠️ REALITA PEDAGANG GADGET 2026</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.2]">
              Jual HP Untung Rp500 Ribu, Dipotong Admin Rp550 Ribu.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-emerald-400">
                Anda Jualan Buat Siapa?
              </span>
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
              Niat untung malah buntung di Toko Hijau &amp; Orange karena potongan admin makin liar. Mau lari ke FB Marketplace? Malah pusing ketemu penipu e-cash dan tukang PHP. Saatnya punya toko online sendiri!
            </p>
          </div>

          {/* 2. Kartu Komparasi 2 Kolom Kontras Tajam */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* 🔴 KOLOM KIRI: JUALAN DI TEMPAT LAIN */}
            <div className="rounded-3xl bg-slate-900/90 border-2 border-rose-500/30 p-5 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 px-3.5 py-1.5 bg-rose-500/20 text-rose-300 text-[11px] font-black uppercase rounded-bl-2xl border-l border-b border-rose-500/30">
                Sering Tekor &amp; Capek Hati
              </div>

              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-rose-500/15 text-rose-400 text-xs font-black mb-2">
                    <TrendingDown className="w-4 h-4 text-rose-500" />
                    <span>JUALAN DI TEMPAT LAIN</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    Toko Hijau, Toko Orange &amp; FB Marketplace
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                    Kerja banting tulang, uang terpotong banyak, dan pusing ngadepin penipu.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Poin 1: Toko Hijau & Orange */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-lg shrink-0 mt-0.5">💸</span>
                    <div>
                      <div className="font-black text-rose-200">Toko Hijau &amp; Toko Orange</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        <b className="text-rose-400">Dipotong 6% – 10%+ per transaksi.</b> Jual iPhone 15 juta, duit Anda dipotong Rp1 juta lebih cuma buat biaya admin &amp; layanan!
                      </p>
                    </div>
                  </div>

                  {/* Poin 2: Uang Ditahan */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-lg shrink-0 mt-0.5">⏳</span>
                    <div>
                      <div className="font-black text-rose-200">Uang Ditahan Berhari-hari</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Dana nyangkut di aplikasi. Kalau ada pembeli nakal ngajuin komplain retur, uang bisa dibekukan sepihak.
                      </p>
                    </div>
                  </div>

                  {/* Poin 3: Perang Banting Harga */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-lg shrink-0 mt-0.5">🥊</span>
                    <div>
                      <div className="font-black text-rose-200">Perang Banting Harga</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Di bawah postingan Anda, aplikasi sengaja nampilin toko sebelah yang jual lebih murah Rp20 ribu.
                      </p>
                    </div>
                  </div>

                  {/* Poin 4: FB Marketplace Sarang Penipu */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-lg shrink-0 mt-0.5">🎭</span>
                    <div>
                      <div className="font-black text-rose-200">FB Marketplace Sarang Penipu</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Penuh calon pembeli fiktif, modus bukti transfer palsu/e-cash, dan tukang PHP yang ngajak COD tapi ngilang.
                      </p>
                    </div>
                  </div>

                  {/* Poin 5: Kontak Pembeli Hilang */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                    <span className="text-lg shrink-0 mt-0.5">❌</span>
                    <div>
                      <div className="font-black text-rose-200">Kontak Pembeli Hilang</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Anda dilarang simpan nomor WA pelanggan. Pembeli selamanya jadi milik aplikasi, bukan langganan Anda.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-rose-400 font-bold">
                <span>⚠️ Hasil Akhir:</span>
                <span>Capek packing, untung tipis, rawan kena tipu</span>
              </div>
            </div>

            {/* 🟢 KOLOM KANAN: JUALAN DI WEB TOKO SENDIRI (GADGETBDG) */}
            <div className="rounded-3xl bg-slate-900/90 border-2 border-emerald-500/60 p-5 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden ring-4 ring-emerald-500/10">
              <div className="absolute top-0 right-0 px-3.5 py-1.5 bg-emerald-500 text-slate-950 text-[11px] font-black uppercase rounded-bl-2xl shadow-md">
                100% Cuan Utuh Masuk Kantong
              </div>

              <div className="space-y-5">
                <div className="border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-black mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>JUALAN DI WEB TOKO SENDIRI</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    Platform Mandiri GadgetBdg
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300 font-medium mt-1">
                    Cuan utuh, tanpa perantara, bebas potongan, dan kendali 100% di tangan Anda.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Poin 1: Potongan 0% */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">💰</span>
                    <div>
                      <div className="font-black text-emerald-200">Potongan 0% (Nol Rupiah)</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Jual Rp10 juta, uang masuk rekening utuh Rp10 juta. <b className="text-emerald-400">Tidak ada potongan admin sepeser pun.</b>
                      </p>
                    </div>
                  </div>

                  {/* Poin 2: Duit Langsung Cair */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">⚡</span>
                    <div>
                      <div className="font-black text-emerald-200">Duit Langsung Cair Detik Itu Juga</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Pembeli transfer langsung ke rekening toko Anda atau bayar cash pas COD di konter. Uang langsung aman di kasir.
                      </p>
                    </div>
                  </div>

                  {/* Poin 3: 100% Panggung Milik Anda */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">👑</span>
                    <div>
                      <div className="font-black text-emerald-200">100% Panggung Milik Anda</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Tidak ada iklan kompetitor. Pembeli cuma fokus lihat stok barang Anda tanpa distraksi banting harga toko sebelah.
                      </p>
                    </div>
                  </div>

                  {/* Poin 4: Bebas Penipu & Terpercaya */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">🛡️</span>
                    <div>
                      <div className="font-black text-emerald-200">Bebas Penipu &amp; Terpercaya</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Link katalog toko Anda terlihat profesional dan terverifikasi, bikin pembeli serius langsung percaya transfer DP atau mampir ke konter.
                      </p>
                    </div>
                  </div>

                  {/* Poin 5: Data Pelanggan 100% Milik Anda */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">📱</span>
                    <div>
                      <div className="font-black text-emerald-200">Data Pelanggan 100% Milik Anda</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Nomor WhatsApp pembeli langsung masuk ke kontak HP kasir. Mudah diajak repeat order atau tukar tambah kapan saja.
                      </p>
                    </div>
                  </div>

                  {/* Poin 6: Biaya Ringan & Pasti */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-lg shrink-0 mt-0.5">☕</span>
                    <div>
                      <div className="font-black text-emerald-200">Biaya Ringan &amp; Pasti</div>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">
                        Cuma sewa sistem flat mulai Rp250.000/bulan. <b className="text-emerald-400">Cukup dari keuntungan jual 1 unit HP bekas sebulan.</b>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>⚡ Hasil Nyata:</span>
                <span>Brand toko kuat, pembeli loyal, uang langsung aman di kasir</span>
              </div>
            </div>
          </div>

          {/* 3. KARTU KALKULATOR PENGHEMATAN (BAHASA SEDERHANA) */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/70 border-2 border-blue-500/40 p-5 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black mb-2">
                    <Calculator className="w-4 h-4 text-blue-400" />
                    <span>KALKULATOR MARGIN PEDAGANG</span>
                  </div>
                  <h3 className="text-xl sm:text-3xl font-black text-white">
                    Hitungan Waras: Jual {calcUnits} Unit HP Sebulan (Omset {formatRupiah(calcOmset)})
                  </h3>
                </div>

                {/* Preset Tombol Penjualan */}
                <div className="flex items-center gap-2">
                  {[10, 15, 25, 40].map((units) => (
                    <button
                      key={units}
                      onClick={() => setCalcUnits(units)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                        calcUnits === units
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400"
                          : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      {units} Unit{units === 15 ? " ★" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Komputasi 2 Box Kontras: Box Merah vs Box Hijau */}
              <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Box Merah: Potongan Toko Hijau / Orange */}
                <div className="p-5 sm:p-6 rounded-2xl bg-rose-950/30 border-2 border-rose-500/30 space-y-2">
                  <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💸</span>
                    <span>Potongan Toko Hijau / Orange:</span>
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-rose-400">
                    Melayang ±{formatRupiah(calcMarketplaceFee)}
                  </div>
                  <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                    Duit amblas cuma buat bayar biaya admin, gratis ongkir ekstra &amp; komisi aplikasi yang makin naik terus.
                  </p>
                </div>

                {/* Box Hijau: Langganan GadgetBdg */}
                <div className="p-5 sm:p-6 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 space-y-2">
                  <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💰</span>
                    <span>Langganan GadgetBdg (Paket PRO):</span>
                  </div>
                  <div className="text-2xl sm:text-4xl font-black text-emerald-400">
                    Cuma {formatRupiah(calcGadgetBdgFee)} Flat
                  </div>
                  <p className="text-xs text-emerald-200/80 leading-relaxed font-medium">
                    Biaya sewa sistem flat per bulan. Bebas jual berapa ratus unit pun, keuntungan 100% tetap masuk kantong Anda.
                  </p>
                </div>
              </div>

              {/* Pesan Bawah Banner Penghematan */}
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="text-base sm:text-xl font-black text-emerald-300">
                    👉 Setiap bulan Anda hemat {formatRupiah(calcSavings)}!
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Duitnya bisa dipakai bayar sewa konter atau nambah stok unit HP baru.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenRegister("PRO")}
                  className="px-6 py-3.5 rounded-xl font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-xl shadow-emerald-500/20 transition text-xs sm:text-sm shrink-0 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Amankan Duit Saya</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. TOMBOL AKSI (CTA) */}
          <div className="text-center space-y-3 pt-2">
            <button
              onClick={() => handleOpenRegister("PRO")}
              className="inline-flex items-center justify-center gap-3 px-7 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-white bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 transition text-base sm:text-lg hover:scale-[1.02] transform duration-200"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Bikin Web Toko Saya Sekarang (Bebas Potongan 0%)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-xs sm:text-sm text-slate-400 font-bold tracking-wide">
              Setup beres dalam 5 menit • Langsung terima orderan ke WhatsApp kasir
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. SEKSI 3 PILAR MANFAAT ── */}
      <section id="fitur" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              3 PILAR UTAMA KATALOG
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              3 Alasan Kenapa Konter HP Modern Tinggalkan Linktree Biasa
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Solusi cerdas mengubah traffic medsos menjadi transaksi closing instan tanpa drama chat berkepanjangan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Pilar 1 */}
            <div className="p-7 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-blue-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                  1 Link untuk Semua Bio Sosmed
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Pasang di bio IG, TikTok, FB, dan status WA. Begitu diklik langsung terbuka katalog responsif format PWA layaknya aplikasi mobile toko resmi tanpa download.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs font-black text-blue-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Format PWA Mobile Eksklusif</span>
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="p-7 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-emerald-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                  Bebas Spam Tanya Stok &amp; Kondisi
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Pembeli bisa filter merk, rentang harga, dan grade mulus sendiri. Anda hanya melayani pembeli yang sudah siap transfer atau siap datang ke toko.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs font-black text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Closing Cepat via WhatsApp Kasir</span>
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="p-7 rounded-3xl bg-slate-50 border-2 border-slate-200 hover:border-purple-500 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug">
                  Watermark &amp; Anti-Bajak Foto Otomatis
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Upload foto langsung dari kamera HP, otomatis dicap logo toko Anda. Stok aman dari olshop penipu &amp; calo yang suka maling foto katalog konter fisik.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/80 text-xs font-black text-purple-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span>Foto 100% Terproteksi Logo Toko</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SEKSI 3 LANGKAH MUDAH ── */}
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
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md relative space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-snug">
                Ketik Nama Tokomu &amp; Pilih Template Keren
              </h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Tentukan subdomain tokomu (contoh: <code>tokomu.gadgetbdg.com</code>) dan pilih tampilan tema yang paling cocok dengan karakter brand tokomu.
              </p>
            </div>

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

      {/* ── 3.5. SEKSI CETAK AKRILIK QR CODE MEJA KASIR ── */}
      <section id="qr-kasir" className="py-20 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full">
              FITUR EKSKLUSIF OFFLINE-TO-ONLINE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Cetak Akrilik QR Code Meja Kasir
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              Hubungkan Pembeli Offline ke Katalog Online Anda. Pengunjung walk-in konter bisa scan QR di meja kasir untuk cek stok terkini dan memberikan rating bintang 5 Google Maps.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            {/* Kolom Kiri: 2 Penjelasan Fitur QR */}
            <div className="lg:col-span-7 space-y-6">
              {/* QR 1 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 hover:border-blue-500 transition duration-300 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wide text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                      Katalog Web Instan
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      QR Code 1: Cek Stok Katalog Lengkap
                    </h3>
                  </div>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Scan untuk cek stok katalog lengkap &amp; update harga harian. Pengunjung toko tinggal arahkan kamera HP untuk menjelajahi seluruh etalase unit ready, perbandingan spesifikasi, dan cek minus fisik tanpa harus menunggu staf kasir membuka etalase kaca.
                </p>
              </div>

              {/* QR 2 */}
              <div className="p-6 sm:p-7 rounded-3xl bg-slate-800/80 border-2 border-slate-700 hover:border-amber-500 transition duration-300 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wide text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      Reputasi Toko Melejit
                    </span>
                    <h3 className="text-lg font-black text-white mt-1">
                      QR Code 2: Review Bintang 5 Google Maps
                    </h3>
                  </div>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Scan untuk ajak pembeli beri review bintang 5 di Google Maps toko secara instan setelah deal. Dongkrak reputasi dan posisi ranking toko Anda di pencarian lokal Google secara otomatis.
                </p>
              </div>
            </div>

            {/* Kolom Kanan: Visual Stand Akrilik Meja Kasir */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-blue-500/40 shadow-2xl text-center space-y-5">
                {/* Header Mockup Stand Akrilik */}
                <div className="pb-3 border-b border-slate-700/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    STAND MEJA KASIR AKRILIK
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-white uppercase tracking-tight">
                    {settings.platformName.toUpperCase()} STORE
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Scan Langsung Dari Kamera Ponsel Anda
                  </p>
                </div>

                {/* 2 Mock QR Cards */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-between shadow-lg">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2 mb-2">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
                      Cek Stok Web
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Update Tiap Hari</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-between shadow-lg">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2 mb-2">
                      <QrCode className="w-full h-full text-slate-900" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-0.5">
                      Review Google ⭐
                    </span>
                    <span className="text-[9px] text-slate-500 font-bold">Bintang 5 &amp; Ulasan</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Siap Cetak PDF Ukuran A6 / Akrilik Meja</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SEKSI TEMPLATE SHOWCASE ── */}
      <section id="showcase" className="py-20 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
              SHOWCASE STOREFRONT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Pilih Gaya yang Pas Buat Brand Tokomu
            </h2>
            <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              Dari gaya minimalis, mode gaming dark, hingga butik mewah. Coba interaksinya langsung di layar ponsel berikut:
            </p>
          </div>

          <TemplateShowcase />
        </div>
      </section>

      {/* ── 5. SEKSI PILIHAN PAKET DINAMIS DARI DATABASE ── */}
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

          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {plans
              .filter((p) => p.id === "STARTER" || p.id === "PRO")
              .map((plan) => {
                const cfg = tierConfig[plan.id] || {
                  labelBadge: `${plan.name.toUpperCase()} PLAN`,
                  highlight: plan.id === "PRO",
                  popularBadge: plan.id === "PRO" ? "PALING POPULER" : undefined,
                  ctaText: `Pilih Paket ${plan.name}`,
                  discountBadge: "PROMO",
                  tagline: "Paket langganan katalog digital terpercaya",
                  features: [],
                };

                return (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white border-2 transition-all duration-200 ${
                      cfg.highlight
                        ? "border-blue-600 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-600"
                        : "border-slate-200 shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-black tracking-wider text-blue-600 uppercase">
                          {cfg.labelBadge}
                        </span>
                        {cfg.popularBadge && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                            {cfg.popularBadge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mb-5 leading-relaxed font-medium">
                        {plan.description || (plan.id === "PRO" ? "Solusi toko online bonafide dengan domain brand sendiri." : "Katalog online PWA praktis pengganti linktree.")}
                      </p>

                      {/* Price Anchoring */}
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-slate-400 line-through decoration-rose-500 decoration-2 text-sm font-semibold">
                          {formatRupiah(plan.originalPrice || plan.price * 1.4)}
                        </span>
                        <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-bold px-2 py-0.5 rounded-full">
                          {cfg.discountBadge}
                        </span>
                      </div>

                      {/* Active Promo Price */}
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-black text-slate-950 font-mono">
                          {formatRupiah(plan.price)}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/ bulan</span>
                      </div>

                      {/* Tagline */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-700 font-semibold mb-6">
                        ✨ {cfg.tagline}
                      </div>

                      {/* Features list */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>
                            Kapasitas <b>{plan.maxActiveProducts >= 9999 ? "Unlimited" : `s/d ${plan.maxActiveProducts}`} Unit HP Ready</b>
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <span>Akses <b>{plan.maxAdmins} Akun Admin Toko</b></span>
                        </div>
                        {cfg.features.map((feat, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  <button
                    onClick={() => handleOpenRegister(plan.id as any)}
                    className={`w-full py-3.5 rounded-xl font-black text-center text-sm transition shadow-sm ${
                      cfg.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {cfg.ctaText}
                  </button>
                </div>
              );
            })}
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

      {/* ── 7. FOOTER TERPERCAYA DINAMIS ── */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-14 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-white font-black text-xl tracking-tight">{settings.platformName}</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {settings.tagline} di wilayah {settings.cityCoverage}. Kelola katalog smartphone second &amp; trade-in modern tanpa ribet koding.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-bold">
              <Link href="/login" className="text-slate-300 hover:text-white transition">
                Portal Toko
              </Link>
              <Link href="/super-admin" className="text-slate-300 hover:text-white transition">
                SaaS Admin
              </Link>
              <a
                href={`https://wa.me/${cleanWhatsapp}?text=Halo%20Admin%20${encodeURIComponent(settings.platformName)},%20saya%20ingin%20konsultasi%20buka%20web%20toko`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Konsultasi WA: +{cleanWhatsapp}</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © {currentYear} {settings.platformName} • {settings.bankAccountHolder}. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>{settings.cityCoverage}, Indonesia</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Onboarding Wizard Modal */}
      <StoreRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        initialTier={selectedTier}
        plans={plans as any}
        paymentSetting={{
          enableBankTransfer: settings.enableBankTransfer,
          bankName: settings.bankName,
          bankAccountNumber: settings.bankAccountNumber,
          bankAccountHolder: settings.bankAccountHolder,
          qrisImageUrl: settings.qrisImageUrl,
          qrisNmid: settings.qrisNmid,
          supportWhatsapp: settings.supportWhatsapp,
        }}
      />
    </div>
  );
}
