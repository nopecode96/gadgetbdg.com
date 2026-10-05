import Link from "next/link";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { formatRupiah } from "@/lib/utils";
import { getSuperAdminDashboardMetricsAction } from "@/lib/actions/super-admin-actions";
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
  Users,
} from "lucide-react";

export const revalidate = 0;

export default async function SuperAdminDashboardPage() {
  const metrics = await getSuperAdminDashboardMetricsAction();

  const {
    totalRegisteredStores,
    totalActiveStores,
    totalInactiveStores,
    dynamicMRR,
    totalRealizedRevenue,
    totalCatalogUnits,
    totalCustomDomains,
    planDistributions,
    recentStores,
    dbHealthy,
    dbLatencyMs,
  } = metrics;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Platform Executive Metrics</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  dbHealthy
                    ? "bg-emerald-950 text-emerald-400 border-emerald-800/80"
                    : "bg-rose-950 text-rose-400 border-rose-800/80"
                }`}
              >
                {dbHealthy ? `DATABASE CONNECTED (${dbLatencyMs}ms)` : "DATABASE ERROR"}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Data telemetri real-time 100% langsung dari database PostgreSQL multi-tenant.
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
              <span>Kelola Toko ({totalRegisteredStores})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Toko */}
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-400" /> Total Toko Terdaftar
            </span>
            <div className="text-3xl font-black text-white">{totalRegisteredStores}</div>
            <p className="text-[11px] text-emerald-400 font-medium">
              {totalActiveStores} Aktif &nbsp;·&nbsp;
              <span className="text-rose-400">{totalInactiveStores} Nonaktif</span>
            </p>
          </div>

          {/* Card 2: Estimasi MRR */}
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-indigo-400" /> Estimasi MRR Bulanan
            </span>
            <div className="text-3xl font-black text-indigo-400">{formatRupiah(dynamicMRR)}</div>
            <p className="text-[11px] text-slate-400 truncate">
              {totalActiveStores} toko aktif · Realisasi: {formatRupiah(totalRealizedRevenue)}
            </p>
          </div>

          {/* Card 3: Total Unit HP */}
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" /> Total Unit HP Katalog
            </span>
            <div className="text-3xl font-black text-white">{totalCatalogUnits} Unit</div>
            <p className="text-[11px] text-slate-400">Akumulasi seluruh unit di etalase</p>
          </div>

          {/* Card 4: Custom Domain */}
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl shadow-sm space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-400" /> Custom Domain Aktif
            </span>
            <div className="text-3xl font-black text-purple-400">{totalCustomDomains} Domain</div>
            <p className="text-[11px] text-slate-400">Domain kustom merchant terhubung</p>
          </div>
        </div>

        {/* Tier Distribution + Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tier Distribution with dynamic progress bars */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Distribusi Toko Aktif Berlangganan</span>
            </h2>

            <div className="space-y-4">
              {planDistributions
                .filter((p) => p.planId === "STARTER" || p.planId === "PRO")
                .map((plan) => {
                  const isAdvance = false;
                const isPro = plan.planId === "PRO";
                const barColor = isAdvance
                  ? "bg-purple-500"
                  : isPro
                  ? "bg-blue-500"
                  : "bg-slate-400";
                const textColor = isAdvance
                  ? "text-purple-300"
                  : isPro
                  ? "text-blue-300"
                  : "text-slate-200";

                return (
                  <div key={plan.planId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className={`font-bold ${textColor}`}>
                          {plan.name.toUpperCase()}
                        </span>
                        <span className="text-slate-500 ml-1.5 font-mono">
                          {formatRupiah(plan.price)}
                          {plan.period}
                        </span>
                      </div>
                      <span className={`font-black ${textColor}`}>
                        {plan.activeStoreCount}{" "}
                        <span className="text-slate-500 font-normal text-[10px]">
                          ({plan.storeCountPercentage}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all`}
                        style={{ width: `${plan.storeCountPercentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Maks {plan.maxActiveProducts >= 999999 ? "Unlimited" : plan.maxActiveProducts} unit ·{" "}
                      {plan.maxAdmins} admin · {plan.availableTemplatesCount} template
                    </p>
                  </div>
                );
              })}
            </div>

            {/* MRR breakdown per tier */}
            <div className="pt-3 border-t border-slate-700/60 text-xs space-y-1.5">
              <p className="text-slate-400 font-semibold">Kontribusi Nominal &amp; Porsi MRR</p>
              {planDistributions
                .filter((p) => p.planId === "STARTER" || p.planId === "PRO")
                .map((plan) => {
                  const isAdvance = false;
                const isPro = plan.planId === "PRO";
                const textColor = isAdvance
                  ? "text-purple-300"
                  : isPro
                  ? "text-blue-300"
                  : "text-slate-300";

                return (
                  <div
                    key={`contrib-${plan.planId}`}
                    className={`flex justify-between items-center ${textColor}`}
                  >
                    <span>
                      {plan.name} ({plan.activeStoreCount} toko)
                    </span>
                    <span className="font-bold">
                      {formatRupiah(plan.revenue)}{" "}
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({plan.mrrPercentage}%)
                      </span>
                    </span>
                  </div>
                );
              })}

              <div className="flex justify-between text-indigo-400 font-black border-t border-slate-700/50 pt-1.5 mt-1">
                <span>Total MRR Platform</span>
                <span>{formatRupiah(dynamicMRR)}</span>
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
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  dbHealthy
                    ? "text-emerald-400 bg-emerald-950/70 border-emerald-800/80"
                    : "text-rose-400 bg-rose-950/70 border-rose-800/80"
                }`}
              >
                {dbHealthy ? "ONLINE • HEALTHY" : "DEGRADED"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 1: POSTGRESQL</span>
                <div className="font-bold text-slate-200">Port 5432 (Localhost)</div>
                <p
                  className={`text-[11px] font-medium flex items-center gap-1 ${
                    dbHealthy ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {dbHealthy ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> CONNECTED / HEALTHY ({dbLatencyMs}ms)
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3 h-3" /> DISCONNECTED
                    </>
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 2: NEXT.JS APP</span>
                <div className="font-bold text-slate-200">Port 3001 (Internal)</div>
                <p className="text-[11px] text-indigo-400 font-medium">Next.js 14 App Router</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/60 space-y-1">
                <span className="text-slate-400 font-mono text-[10px]">DAEMON 3: NGINX REVERSE PROXY</span>
                <div className="font-bold text-slate-200">Port 80 / 443 (Public)</div>
                <p className="text-[11px] text-blue-400 font-medium">SSL &amp; Static Uploads Proxy</p>
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
                • Apex Domain `gadgetbdg.com` &amp; `localhost` ➔ Landing Page &amp; SaaS Admin
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

        {/* 5 Toko Pendaftar Terbaru */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>5 Toko Pendaftar Terbaru</span>
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
                  <th className="px-4 py-3">Subdomain</th>
                  <th className="px-4 py-3">Pemilik</th>
                  <th className="px-4 py-3">Tier / Paket</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Watermark</th>
                  <th className="px-4 py-3">Total Unit</th>
                  <th className="px-4 py-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentStores.map((s) => (
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
                    <td className="px-4 py-3 text-slate-300">
                      {s.owner ? (
                        <div>
                          <div className="font-medium text-white">{s.owner.name}</div>
                          <div className="text-[10px] text-slate-500">{s.owner.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500">–</span>
                      )}
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
                        {s.planName}
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
                      {s.productCount} Unit HP
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
