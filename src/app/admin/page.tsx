import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { formatRupiah } from "@/lib/utils";
import {
  Package,
  RefreshCw,
  Share2,
  Smartphone,
  DollarSign,
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeStore = stores[0];

  const [products, offers] = await Promise.all([
    activeStore
      ? prisma.product.findMany({
          where: { storeId: activeStore.id },
          orderBy: { createdAt: "desc" },
        })
      : [],
    activeStore
      ? prisma.tradeInOffer.findMany({
          where: { storeId: activeStore.id },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  const availableCount = products.filter((p) => p.status === "AVAILABLE").length;
  const bookedCount = products.filter((p) => p.status === "BOOKED").length;
  const soldCount = products.filter((p) => p.status === "SOLD").length;
  const totalActiveStock = availableCount + bookedCount;

  // Kalkulasi total estimasi omset dari unit yang SOLD
  const estimatedTurnover = products
    .filter((p) => p.status === "SOLD")
    .reduce((acc, curr) => acc + curr.price, 0);

  // Nilai stok yang sedang aktif (AVAILABLE + BOOKED)
  const activeStockValue = products
    .filter((p) => p.status === "AVAILABLE" || p.status === "BOOKED")
    .reduce((acc, curr) => acc + curr.price, 0);

  // Top 5 Unit paling diminati berdasarkan hitungan klik WhatsApp (clickCount)
  const mostWantedProducts = [...products]
    .sort((a, b) => ((b as any).clickCount || 0) - ((a as any).clickCount || 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNav currentSlug={activeStore?.slug} />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Store Profile Card */}
        {activeStore && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                {activeStore.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{activeStore.name}</h1>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                    Tier: {activeStore.tier}
                  </span>
                  {activeStore.hasWatermark && (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Watermark Aktif
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeStore.address}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
                  <span>
                    Template Aktif: <b className="text-slate-900 font-mono">{activeStore.templateId}</b>
                  </span>
                  <span>•</span>
                  <span>
                    WhatsApp: <b className="text-slate-900">{activeStore.whatsapp}</b>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/${activeStore.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
              >
                <span>Lihat Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* 4 Kartu Metrik Utama: [📦 Stok Aktif] [💰 Estimasi Omset Terjual] [🔥 Paling Diminati] [🔄 Leads Trade-In] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Stok Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" /> 📦 Stok Aktif
            </span>
            <div className="text-2xl font-black text-slate-900">{totalActiveStock} Unit</div>
            <p className="text-[11px] text-slate-400">
              {availableCount} Available • {bookedCount} Booked ({formatRupiah(activeStockValue)})
            </p>
          </div>

          {/* 2. Estimasi Omset Terjual */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> 💰 Estimasi Omset Terjual
            </span>
            <div className="text-2xl font-black text-emerald-600">{formatRupiah(estimatedTurnover)}</div>
            <p className="text-[11px] text-slate-400">
              Total dari {soldCount} unit berstatus SOLD
            </p>
          </div>

          {/* 3. Paling Diminati (Leads & Top Unit) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" /> 🔥 Paling Diminati
            </span>
            <div className="text-2xl font-black text-amber-600 truncate">
              {mostWantedProducts[0]?.name?.split(" ")[0] || "Semua"} {mostWantedProducts[0]?.name?.split(" ")[1] || "Unit"}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {(mostWantedProducts[0] as any)?.clickCount || 0}x klik minat beli via WA
            </p>
          </div>

          {/* 4. Leads Trade-In */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-purple-600" /> 🔄 Leads Trade-In
            </span>
            <div className="text-2xl font-black text-purple-600">{offers.length} Pengajuan</div>
            <p className="text-[11px] text-slate-400">Siap ditaksir & dinego via WhatsApp</p>
          </div>
        </div>

        {/* Section Top 5 Unit Paling Diminati */}
        {mostWantedProducts.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h2 className="font-bold text-sm text-slate-900">Top 5 Unit HP Paling Banyak Diminati Calon Pembeli</h2>
              </div>
              <span className="text-[11px] text-slate-400">Berdasarkan Klik Tombol Beli WA</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {mostWantedProducts.map((p, idx) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{p.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {p.ramRom} • {p.condition} • Status: <b className="text-slate-700">{p.status}</b>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-bold text-slate-900">{formatRupiah(p.price)}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                      {(p as any).clickCount || 0} Klik WA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Menu Hub */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/products"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
              Manajemen Stok Unit
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tambah unit HP second baru, update harga, kelola spesifikasi detail (BH, IMEI, minus), dan toggle status.
            </p>
          </Link>

          <Link
            href="/admin/trade-in"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition">
              Inbox Tukar Tambah
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cek penawaran HP customer, lihat foto & kondisi minus, dan balas otomatis via WhatsApp dengan template siap pakai.
            </p>
          </Link>

          <Link
            href="/admin/social-tools"
            className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-pink-400 transition space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-105 transition">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 group-hover:text-pink-600 transition">
              Generator Caption & Poster Story
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Buat poster story 9:16 dengan watermark nama toko, pilihan badge promo instan, dan caption marketplace siap copas.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
