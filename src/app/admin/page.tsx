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
  Flame,
  Clock,
  ExternalLink,
  AlertCircle,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export const revalidate = 0;

// Helper to format condition / grade cleanly
function formatConditionBadge(condition?: string | null, grade?: string | null): string {
  if (grade && grade.trim()) {
    return grade;
  }
  if (!condition || !condition.trim()) {
    return "Grade A";
  }

  const raw = condition.trim();
  const MAP: Record<string, string> = {
    SECOND_LIKE_NEW: "Grade A+ (Like New)",
    SECOND_MULUS: "Grade A (Sangat Mulus)",
    SECOND_FULLSET: "Grade B+ (Pemakaian Wajar)",
    SECOND_MINUS: "Minus Fisik / Fungsi",
    BRAND_NEW_SEIN: "Baru Segel (BNIB)",
    BARU_BNIB: "Baru Segel (BNIB)",
    BEKAS_MULUS: "Grade A (Mulus)",
  };

  if (MAP[raw]) return MAP[raw];

  // If already clean like "Grade A" or "Bekas (Mulus)"
  if (raw.toLowerCase().includes("grade") || raw.toLowerCase().includes("mulus") || raw.toLowerCase().includes("baru")) {
    return raw;
  }

  // Format enum like SOME_ENUM_NAME to Title Case
  return raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function AdminDashboardPage() {
  // requireStoreOwnerOrStaff validates session, store.isActive, and subscription
  const ctx = await requireStoreOwnerOrStaff();
  const { store, limits, usage, permissions } = ctx;

  // Query metrics and data from PostgreSQL
  const [
    products,
    pendingLeads,
    totalLeads,
    totalReviewsCount,
    recentTradeIns,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    }),
    Promise.all([
      prisma.tradeInLead.count({ where: { storeId: store.id, status: "PENDING" } }),
      prisma.tradeInOffer.count({ where: { storeId: store.id, status: "PENDING" } }),
    ]).then(([leads, offers]) => leads + offers),
    Promise.all([
      prisma.tradeInLead.count({ where: { storeId: store.id } }),
      prisma.tradeInOffer.count({ where: { storeId: store.id } }),
    ]).then(([leads, offers]) => leads + offers),
    prisma.storeReview.count({
      where: { storeId: store.id },
    }),
    prisma.tradeInLead.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const pendingLeadsCount = pendingLeads;
  const totalLeadsCount = totalLeads;

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

  // Top 5 most wanted sorted by clickCount descending, then createdAt descending
  const mostWantedProducts = [...products]
    .sort((a, b) => {
      const clickDiff = (b.clickCount || 0) - (a.clickCount || 0);
      if (clickDiff !== 0) return clickDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5);

  const remainingQuotaDisplay =
    limits.maxActiveProducts === Infinity
      ? "Tak terbatas"
      : `${usage.remainingProductQuota} sisa`;

  // Public storefront URL
  const storefrontUrl = `/${store.slug}`;

  // Most wanted top 1 title
  const top1Product = mostWantedProducts[0];
  const top1Title =
    top1Product?.title ||
    top1Product?.name ||
    (top1Product?.brand ? `${top1Product.brand} Smartphone` : "Semua Unit");

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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {store.logoUrl ? (
            <img
              src={store.logoUrl}
              alt={store.name}
              className="w-14 h-14 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-sm"
              style={{ backgroundColor: store.primaryColor || "#2563eb" }}
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
                Template: <b className="text-slate-900 font-mono">{store.templateId || (store as any).template || "minimal-clean"}</b>
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
            href={storefrontUrl}
            target="_blank"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-xs flex items-center gap-1.5"
          >
            <span>Lihat Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Stok Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-blue-600" /> 📦 Stok Aktif
          </span>
          <div className="text-2xl font-black text-slate-900">{totalActiveStock} Unit</div>
          <p className="text-[11px] text-slate-400">
            {availableCount} Tersedia • {bookedCount} Booked ({formatRupiah(activeStockValue)})
          </p>
        </div>

        {/* Metric 2: Estimasi Omset Terjual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" /> 💰 Estimasi Omset Terjual
          </span>
          <div className="text-2xl font-black text-emerald-600">{formatRupiah(estimatedTurnover)}</div>
          <p className="text-[11px] text-slate-400">Total dari {soldCount} unit berstatus SOLD</p>
        </div>

        {/* Metric 3: Paling Diminati */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> 🔥 Paling Diminati
          </span>
          <div className="text-lg font-black text-amber-600 truncate" title={top1Title}>
            {top1Title}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {top1Product?.clickCount || 0}x klik minat beli via WA
          </p>
        </div>

        {/* Metric 4: Leads Trade-In */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4 text-purple-600" /> 🔄 Leads Trade-In
          </span>
          <div className="text-2xl font-black text-purple-600">
            {pendingLeadsCount} <span className="text-xs font-medium text-slate-400">Pending</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {totalLeadsCount} total penawaran tukar tambah
          </p>
        </div>
      </div>

      {/* Top 5 Most Wanted */}
      {mostWantedProducts.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900">Top 5 Unit HP Paling Banyak Diminati</h2>
            </div>
            <span className="text-[11px] text-slate-400">Berdasarkan Minat Beli WA</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {mostWantedProducts.map((p, idx) => {
              const displayTitle =
                p.title ||
                p.name ||
                (p.brand ? `${p.brand} Smartphone` : "Unit Smartphone");

              const conditionLabel = formatConditionBadge(p.condition, p.grade);
              const ramRomDisplay =
                p.ramRom ||
                (p.storage ? `${p.ram ? `${p.ram} / ` : ""}${p.storage}` : "");

              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{displayTitle}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                        {ramRomDisplay && <span>{ramRomDisplay} •</span>}
                        <span className="font-medium text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded text-[10px]">
                          {conditionLabel}
                        </span>
                        <span>•</span>
                        <span>
                          Status:{" "}
                          <b
                            className={
                              p.status === "AVAILABLE"
                                ? "text-emerald-600"
                                : p.status === "BOOKED"
                                ? "text-amber-600"
                                : "text-slate-600"
                            }
                          >
                            {p.status}
                          </b>
                        </span>
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
              );
            })}
          </div>
        </div>
      )}

      {/* Section: Leads Tukar Tambah & Ulasan Terbaru dari Database PostgreSQL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Leads Terbaru */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-sm text-slate-900">Leads Tukar Tambah Terbaru</h2>
            </div>
            <Link
              href="/admin/trade-ins"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Lihat Semua ({totalLeadsCount})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {recentTradeIns.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Belum ada pengajuan tukar tambah atau jual HP masuk.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentTradeIns.map((lead) => (
                <div key={lead.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{lead.customerName}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lead.deviceModel} • <span className="text-purple-700 font-medium">{lead.condition}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      lead.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : lead.status === "DEAL"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Ringkasan Ulasan Pembeli */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-slate-900">Reputasi &amp; Ulasan Pembeli</h2>
            </div>
            <Link
              href="/admin/reviews"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Kelola Ulasan ({totalReviewsCount})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-600 font-medium">Total Testimoni Tersimpan:</span>
              <span className="text-sm font-black text-slate-900">{totalReviewsCount} Ulasan</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Testimoni pembeli langsung di-render pada tab &quot;Toko&quot; di etalase publik dan kartu Google Review.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-400 transition space-y-3"
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
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-400 transition space-y-3"
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
          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-pink-400 transition space-y-3"
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
