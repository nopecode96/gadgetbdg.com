"use client";

import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Archive,
  Store,
  Sparkles,
  ArrowRight,
  Globe,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface PlanItem {
  id: string;
  name: string;
  labelBadge: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discountBadge?: string | null;
  popularBadge?: string | null;
  period: string;
  maxActiveProducts: number;
  maxAdmins: number;
  availableTemplatesCount: number;
  templateCooldownDays: number;
  templateChangeRule: string;
  hasWatermark: boolean;
  hasCustomDomain: boolean;
  customDomain: boolean;
  storeCount: number;
  isArchived: boolean;
}

export function PlansManagerClient({ initialPlans }: { initialPlans: PlanItem[] }) {
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <span>Paket Langganan SaaS (2-Tier Active)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Harmonisasi harga promo 2026: Starter (Rp 300.000) vs Pro (Rp 600.000). Paket Advance diarsipkan dari registrasi publik.
          </p>
        </div>

        <Link
          href="/super-admin/stores"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <Store className="w-4 h-4 text-emerald-400" />
          <span>Lihat Tenant per Paket</span>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-200 space-y-1">
          <p className="font-bold text-white">Struktur Skema 2 Paket Aktif Platform 2026</p>
          <p className="text-slate-300">
            Landing page publik dan formulir registrasi hanya menampilkan 2 paket utama: <b>Starter</b> (Rp 300rb/bln, limit 50 produk, hemat 40%) dan <b>Pro</b> (Rp 600rb/bln, produk unlimited, custom domain aktif). Toko pengguna paket <b>Advance</b> lama tetap memiliki akses penuh tanpa terganggu.
          </p>
        </div>
      </div>

      {/* Grid of Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialPlans.map((plan) => {
          const isStarter = plan.id === "STARTER";
          const isPro = plan.id === "PRO";
          const isAdvance = plan.id === "ADVANCE";

          return (
            <div
              key={plan.id}
              className={`rounded-2xl border flex flex-col justify-between transition relative overflow-hidden ${
                isPro
                  ? "bg-slate-900/90 border-indigo-500/50 shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-500/40"
                  : isAdvance
                  ? "bg-slate-950/60 border-slate-800/80 opacity-80"
                  : "bg-slate-900/60 border-slate-800 shadow-lg"
              }`}
            >
              {/* Highlight Badges */}
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      isPro
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md"
                        : isAdvance
                        ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    {isAdvance && <Archive className="w-3 h-3 text-amber-400" />}
                    {isPro && <Sparkles className="w-3 h-3 text-amber-300" />}
                    <span>{isAdvance ? "ARCHIVED (LEGACY)" : plan.popularBadge || plan.discountBadge || "AKTIF"}</span>
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    ID: <b>{plan.id}</b>
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>{plan.name}</span>
                    {isPro && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        REKOMENDASI
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {formatRupiah(plan.price)}
                    </span>
                    <span className="text-xs text-slate-500">{plan.period}</span>
                  </div>
                  {plan.originalPrice > plan.price && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="line-through text-slate-500 font-mono">
                        {formatRupiah(plan.originalPrice)}
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">
                        {plan.discountBadge || "Hemat 40%"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Key Spec Features */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      Kuota Produk:{" "}
                      <strong className="text-white font-mono">
                        {isStarter ? "Maksimal 50 Unit" : "Unlimited (Tanpa Batas)"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      Domain:{" "}
                      <strong className="text-white">
                        {isStarter
                          ? "Subdomain namatoko.gadgetbdg.com"
                          : "Custom Domain Toko (DNS CNAME / A Record)"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Watermark:{" "}
                      <strong className="text-white">
                        {plan.hasWatermark ? "Label GadgetBdg" : "Bebas Watermark (100% Brand Sendiri)"}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Pilihan Tema:{" "}
                      <strong className="text-white">
                        {plan.availableTemplatesCount} Desain Template
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer with Tenant Stats */}
              <div className="p-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Store className="w-4 h-4 text-slate-500" />
                  <span>
                    Digunakan: <b className="text-white font-mono">{plan.storeCount}</b> Toko
                  </span>
                </div>

                <Link
                  href={`/super-admin/stores?tier=${plan.id}`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 group"
                >
                  <span>Filter Toko</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
