import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { formatRupiah } from "@/lib/utils";
import {
  Store,
  DollarSign,
  TrendingUp,
  Smartphone,
  Globe,
  CheckCircle2,
  ArrowRight,
  Server,
  Layers,
  Users,
} from "lucide-react";

export const revalidate = 0;

// Harga resmi paket berlangganan (sinkron dengan TIER_LIMITS)
const TIER_PRICE = {
  STARTER: 250_000,
  PRO: 600_000,
  ADVANCE: 1_000_000,
};

export default async function SuperAdminDashboardPage() {
  const [stores, productsCount] = await Promise.all([
    prisma.store.findMany({
      include: {
        _count: {
          select: { products: true, tradeInOffers: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count(),
  ]);

  const activeStores = stores.filter((s) => s.isActive);
  const starterCount = activeStores.filter((s) => s.tier === "STARTER").length;
  const proCount = activeStores.filter((s) => s.tier === "PRO").length;
  const advanceCount = activeStores.filter((s) => s.tier === "ADVANCE").length;

  // MRR hanya dari toko AKTIF
  const mrr =
    starterCount * TIER_PRICE.STARTER +
    proCount * TIER_PRICE.PRO +
    advanceCount * TIER_PRICE.ADVANCE;

  const customDomainStores = stores.filter((s) => s.customDomain);
  const totalActive = activeStores.length;
  const totalStores = stores.length;

  // Progress bar percentages
  const pct = (n: number) =>
    totalStores > 0 ? Math.round((n / totalStores) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Platform Executive Metrics</span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                ALL-IN-ONE CONTAINER OK
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multi-tenant shared database PostgreSQL &amp; Nginx dynamic proxy routing telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/super-admin/sales-portal"
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/80 transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Portal Sales Partner</span>
            </Link>
            <Link
              href="/super-admin/stores"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <span>Kelola Toko ({stores.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-400" /> Total Toko Terdaftar
            </span>
            <div className="text-3xl font-black text-white">{totalStores}</div>
            <p className="text-[11px] text-emerald-400 font-medium">
              {totalActive} Aktif &nbsp;·&nbsp;
              <span className="text-rose-400">{totalStores - totalActive} Nonaktif</span>
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" /> Estimasi MRR Bulanan
            </span>
            <div className="text-3xl font-black text-indigo-400">{formatRupiah(mrr)}</div>
            <p className="text-[11px] text-slate-400">Dari {totalActive} toko aktif berlangganan</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" /> Total Unit HP Katalog
            </span>
            <div className="text-3xl font-black text-white">{productsCount} Unit</div>
            <p className="text-[11px] text-slate-400">Akumulasi seluruh toko merchant</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" /> Custom Domain Aktif
            </span>
            <div className="text-3xl font-black text-purple-400">{customDomainStores.length} Domain</div>
            <p className="text-[11px] text-slate-400">Paket Pro &amp; Advance</p>
          </div>
        </div>

        {/* Tier Distribution + Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier Distribution with progress bars */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Distribusi Paket Berlangganan</span>
            </h2>

            <div className="space-y-4">
              {/* STARTER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200">STARTER</span>
                    <span className="text-slate-500 ml-1.5">Rp 250rb/bln</span>
                  </div>
                  <span className="font-black text-white">
                    {starterCount}{" "}
                    <span className="text-slate-500 font-normal text-[10px]">
                      ({pct(stores.filter((s) => s.tier === "STARTER").length)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-all"
                    style={{ width: `${pct(stores.filter((s) => s.tier === "STARTER").length)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Maks 15 unit · 1 admin · 2 template</p>
              </div>

              {/* PRO */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-blue-300">PRO</span>
                    <span className="text-slate-500 ml-1.5">Rp 600rb/bln</span>
                  </div>
                  <span className="font-black text-blue-300">
                    {proCount}{" "}
                    <span className="text-slate-500 font-normal text-[10px]">
                      ({pct(stores.filter((s) => s.tier === "PRO").length)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct(stores.filter((s) => s.tier === "PRO").length)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Maks 30 unit · 3 admin · 10 template</p>
              </div>

              {/* ADVANCE */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-purple-300">ADVANCE</span>
                    <span className="text-slate-500 ml-1.5">Rp 1jt/bln</span>
                  </div>
                  <span className="font-black text-purple-300">
                    {advanceCount}{" "}
                    <span className="text-slate-500 font-normal text-[10px]">
                      ({pct(stores.filter((s) => s.tier === "ADVANCE").length)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${pct(stores.filter((s) => s.tier === "ADVANCE").length)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">Unlimited · 5 admin · 30 template</p>
              </div>
            </div>

            {/* MRR breakdown per tier */}
            <div className="pt-3 border-t border-slate-700/60 text-xs space-y-1">
              <p className="text-slate-400 font-semibold">Kontribusi MRR per Tier</p>
              <div className="flex justify-between text-slate-300">
                <span>Starter ({starterCount} toko)</span>
                <span className="font-bold">{formatRupiah(starterCount * TIER_PRICE.STARTER)}</span>
              </div>
              <div className="flex justify-between text-blue-300">
                <span>Pro ({proCount} toko)</span>
                <span className="font-bold">{formatRupiah(proCount * TIER_PRICE.PRO)}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Advance ({advanceCount} toko)</span>
                <span className="font-bold">{formatRupiah(advanceCount * TIER_PRICE.ADVANCE)}</span>
              </div>
              <div className="flex justify-between text-indigo-400 font-black border-t border-slate-700/50 pt-1 mt-1">
                <span>Total MRR</span>
                <span>{formatRupiah(mrr)}</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Status */}
          <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span>Status Infrastruktur All-in-One Container</span>
              </h2>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                ONLINE • HEALTHY
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 1: POSTGRESQL</span>
                <div className="font-bold text-slate-200">Port 5432 (Localhost)</div>
                <p className="text-[11px] text-emerald-400">Shared-DB Multi-Tenant</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 2: NEXT.JS APP</span>
                <div className="font-bold text-slate-200">Port 3001 (Internal)</div>
                <p className="text-[11px] text-indigo-400">Next.js 14 App Router</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 3: NGINX REVERSE PROXY</span>
                <div className="font-bold text-slate-200">Port 80 / 443 (Public)</div>
                <p className="text-[11px] text-blue-400">SSL &amp; Static Uploads Proxy</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multi-Tenancy Middleware Dynamic Routing:</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400">
                • Subdomain `*.gadgetbdg.com` ➔ `/app/[store]/...`<br />
                • Custom Domain `*.com` ➔ `/app/custom-domain/[domain]/...`<br />
                • Apex Domain `gadgetbdg.com` &amp; `localhost:3001` ➔ Landing Page &amp; SaaS Admin
              </p>
            </div>

            {/* Quick links to sub-pages */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                href="/super-admin/stores"
                className="flex items-center gap-2 p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-semibold hover:bg-indigo-900/60 transition"
              >
                <Users className="w-4 h-4" />
                <div>
                  <div className="font-bold">Manajemen Toko</div>
                  <div className="text-[10px] text-indigo-400">Atur tier &amp; status merchant</div>
                </div>
              </Link>
              <Link
                href="/super-admin/domains"
                className="flex items-center gap-2 p-3.5 rounded-xl bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-semibold hover:bg-purple-900/60 transition"
              >
                <Globe className="w-4 h-4" />
                <div>
                  <div className="font-bold">Custom Domain</div>
                  <div className="text-[10px] text-purple-400">Verifikasi DNS &amp; SSL</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Latest Registered Stores Table Preview */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Toko Terdaftar Terbaru</span>
            </h2>
            <Link
              href="/super-admin/stores"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Lihat Semua &amp; Aksi Cepat →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Nama Toko</th>
                  <th className="px-4 py-3">Slug / Subdomain</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Watermark</th>
                  <th className="px-4 py-3">Total Unit</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stores.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-750 transition">
                    <td className="px-4 py-3 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-black shrink-0">
                          {s.name.charAt(0)}
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {s.slug}.gadgetbdg.com
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.tier === "ADVANCE"
                            ? "bg-purple-900/60 text-purple-300 border border-purple-700/50"
                            : s.tier === "PRO"
                            ? "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{s.templateId}</td>
                    <td className="px-4 py-3">
                      {s.hasWatermark ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          ✓ Aktif
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {s._count.products} Unit HP
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isActive
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {s.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
