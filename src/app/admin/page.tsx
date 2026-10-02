import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { formatRupiah } from "@/lib/utils";
import { Package, RefreshCw, Share2, Smartphone, DollarSign, TrendingUp, Store } from "lucide-react";

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
  const inventoryValue = products
    .filter((p) => p.status === "AVAILABLE")
    .reduce((acc, curr) => acc + curr.price, 0);

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
                </div>
                <p className="text-xs text-slate-500 mt-1">{activeStore.address}</p>
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
                  <span>Template Aktif: <b className="text-slate-900">{activeStore.templateId}</b></span>
                  <span>•</span>
                  <span>WhatsApp: <b className="text-slate-900">{activeStore.whatsapp}</b></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/${activeStore.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm"
              >
                Lihat Storefront Publik ↗
              </Link>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-600" /> Unit Tersedia
            </span>
            <div className="text-2xl font-black text-slate-900">{availableCount} Unit</div>
            <p className="text-[11px] text-slate-400">Siap dijual di katalog</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Nilai Stok Aktif
            </span>
            <div className="text-2xl font-black text-emerald-600">{formatRupiah(inventoryValue)}</div>
            <p className="text-[11px] text-slate-400">Estimasi aset inventaris</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-amber-600" /> Leads Trade-In
            </span>
            <div className="text-2xl font-black text-amber-600">{offers.length} Customer</div>
            <p className="text-[11px] text-slate-400">Menunggu taksir harga</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-600" /> Unit Terjual
            </span>
            <div className="text-2xl font-black text-purple-600">{soldCount} Unit</div>
            <p className="text-[11px] text-slate-400">{bookedCount} Unit sedang di-booking</p>
          </div>
        </div>

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
              Generator Caption Medsos
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Salin caption 1-klik yang dioptimasi khusus untuk Facebook Marketplace dan Instagram Feed/Reels.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
