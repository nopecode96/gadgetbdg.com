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
  AlertTriangle,
  ArrowRight,
  Server,
  Layers,
} from "lucide-react";

export const revalidate = 0;

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
  const starterCount = stores.filter((s) => s.tier === "STARTER").length;
  const proCount = stores.filter((s) => s.tier === "PRO").length;
  const advanceCount = stores.filter((s) => s.tier === "ADVANCE").length;

  // Monthly Recurring Revenue (MRR) Calculation
  // STARTER: 200.000 / month, PRO: 500.000 / month, ADVANCE: 1.000.000 / month
  const mrr = starterCount * 200000 + proCount * 500000 + advanceCount * 1000000;

  const customDomainStores = stores.filter((s) => s.customDomain);

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
              Multi-tenant shared database PostgreSQL & Nginx dynamic proxy routing telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
            <div className="text-3xl font-black text-white">{stores.length}</div>
            <p className="text-[11px] text-emerald-400 font-medium">
              {activeStores.length} Toko Aktif ({stores.length - activeStores.length} Nonaktif)
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" /> Estimasi MRR
            </span>
            <div className="text-3xl font-black text-indigo-400">{formatRupiah(mrr)}</div>
            <p className="text-[11px] text-slate-400">Monthly Recurring Revenue</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" /> Total Unit HP Katalog
            </span>
            <div className="text-3xl font-black text-white">{productsCount} Unit</div>
            <p className="text-[11px] text-slate-400">Di seluruh database merchant</p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" /> Custom Domains
            </span>
            <div className="text-3xl font-black text-purple-400">{customDomainStores.length} Domain</div>
            <p className="text-[11px] text-slate-400">Paket Pro & Advance</p>
          </div>
        </div>

        {/* Tier Distribution & Architecture Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Distribusi Paket Berlangganan</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-700/60">
                <div>
                  <div className="font-bold text-slate-200">STARTER (Rp 200rb/bln)</div>
                  <div className="text-[11px] text-slate-400">Subdomain, 50 unit HP</div>
                </div>
                <div className="text-lg font-black text-white">{starterCount} Toko</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
                <div>
                  <div className="font-bold text-blue-300">PRO (Rp 500rb/bln)</div>
                  <div className="text-[11px] text-slate-400">Custom domain, 250 unit HP</div>
                </div>
                <div className="text-lg font-black text-blue-400">{proCount} Toko</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-purple-900/40">
                <div>
                  <div className="font-bold text-purple-300">ADVANCE (Rp 1jt/bln)</div>
                  <div className="text-[11px] text-slate-400">Unlimited HP, multi admin</div>
                </div>
                <div className="text-lg font-black text-purple-400">{advanceCount} Toko</div>
              </div>
            </div>
          </div>

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
                <p className="text-[11px] text-blue-400">SSL & Static Uploads Proxy</p>
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
                • Apex Domain `gadgetbdg.com` & `localhost:3001` ➔ Landing Page & SaaS Admin
              </p>
            </div>
          </div>
        </div>

        {/* Latest Registered Stores Table Preview */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white">Daftar Toko Terdaftar</h2>
            <Link
              href="/super-admin/stores"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Lihat Semua & Aksi Cepat →
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
                  <th className="px-4 py-3">Total Unit</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {stores.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-750 transition">
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-black">
                        {s.name.charAt(0)}
                      </div>
                      <span>{s.name}</span>
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
