import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";
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
  AlertCircle,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  // requireStoreOwnerOrStaff validates session, store.isActive, and subscription
  const ctx = await requireStoreOwnerOrStaff();
  const { store, limits, usage, permissions } = ctx;

  const [products, offers] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tradeInOffer.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const availableCount = products.filter((p) => p.status === "AVAILABLE").length;
  const bookedCount = products.filter((p) => p.status === "BOOKED").length;
  const soldCount = products.filter((p) => p.status === "SOLD").length;
  const totalActiveStock = availableCount + bookedCount;

  const estimatedTurnover = products
    .filter((p) => p.status === "SOLD")
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  const activeStockValue = products
    .filter((p) => p.status === "AVAILABLE" || p.status === "BOOKED")
    .reduce((acc, curr) => acc + Number(curr.price), 0);

  const mostWantedProducts = [...products]
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, 5);

  const remainingQuotaDisplay =
    limits.maxActiveProducts === Infinity
      ? "Tak terbatas"
      : `${usage.remainingProductQuota} sisa`;

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      {/* Quota alert if running low */}
      {permissions.canAddProduct === false && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">Kuota Produk Aktif Penuh</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Paket <b>{store.tier}</b> mendukung maks{" "}
              <b>{limits.maxActiveProducts}</b> produk aktif. Ubah status produk ke SOLD
              atau upgrade paket untuk menambah lebih banyak unit.
            </p>
          </div>
        </div>
      )}

      {/* Store Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-14 h-14 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-md"
              style={{ backgroundColor: store.primaryColor }}
            >
              {store.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900">{store.name}</h1>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                {store.tier}
              </span>
              {store.hasWatermark && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Watermark On
                </span>
              )}
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Kuota: {remainingQuotaDisplay}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{store.address}</p>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
              <span>
                Template: <b className="text-slate-900 font-mono">{store.templateId}</b>
              </span>
              <span>•</span>
              <span>
                WA: <b className="text-slate-900">{store.whatsapp}</b>
              </span>
              {store.subscriptionExpiresAt && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Aktif s/d{" "}
                    <b className="text-slate-900">
                      {new Date(store.subscriptionExpiresAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </b>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${store.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
          >
            <span>Lihat Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-blue-600" /> 📦 Stok Aktif
          </span>
          <div className="text-2xl font-black text-slate-900">{totalActiveStock} Unit</div>
          <p className="text-[11px] text-slate-400">
            {availableCount} Available • {bookedCount} Booked ({formatRupiah(activeStockValue)})
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> 💰 Estimasi Omset Terjual
          </span>
          <div className="text-2xl font-black text-emerald-600">{formatRupiah(estimatedTurnover)}</div>
          <p className="text-[11px] text-slate-400">Total dari {soldCount} unit berstatus SOLD</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> 🔥 Paling Diminati
          </span>
          <div className="text-2xl font-black text-amber-600 truncate">
            {mostWantedProducts[0]?.name?.split(" ")[0] || "Semua"}{" "}
            {mostWantedProducts[0]?.name?.split(" ")[1] || "Unit"}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {mostWantedProducts[0]?.clickCount || 0}x klik minat beli via WA
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-purple-600" /> 🔄 Leads Trade-In
          </span>
          <div className="text-2xl font-black text-purple-600">{offers.length} Pengajuan</div>
          <p className="text-[11px] text-slate-400">Siap ditaksir &amp; dinego via WhatsApp</p>
        </div>
      </div>

      {/* Top 5 Most Wanted */}
      {mostWantedProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900">Top 5 Unit HP Paling Banyak Diminati</h2>
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
                      {p.ramRom} • {p.condition} • Status:{" "}
                      <b className="text-slate-700">{p.status}</b>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-bold text-slate-900">{formatRupiah(p.price)}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                    {p.clickCount || 0} Klik WA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Menu */}
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
            Tambah unit HP second baru, update harga, kelola spesifikasi detail (BH, IMEI, minus),
            dan toggle status.
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
            Cek penawaran HP customer, lihat foto &amp; kondisi minus, dan balas otomatis via WhatsApp.
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
            Generator Caption &amp; Poster Story
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Buat poster story 9:16 dengan watermark nama toko, pilihan badge promo instan, dan caption
            marketplace siap copas.
          </p>
        </Link>
      </div>
    </div>
  );
}
