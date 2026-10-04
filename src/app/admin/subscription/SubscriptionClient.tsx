"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CreditCard,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Building2,
  Users,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Lock,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface SubscriptionClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
    tier: "STARTER" | "PRO" | "ADVANCE" | string;
    planId: string;
    isActive: boolean;
    hasWatermark: boolean;
    subscriptionStartedAt: string | null;
    subscriptionExpiresAt: string | null;
    plan: any;
  };
  usage: {
    activeProductCount: number;
    totalProducts: number;
    staffCount: number;
    branchCount: number;
  };
  plans: any[];
  platformSetting: {
    supportWhatsapp?: string;
    enableBankTransfer?: boolean;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankAccountHolder?: string | null;
    qrisImageUrl?: string | null;
    qrisNmid?: string | null;
  } | null;
}

export function SubscriptionClient({
  store,
  usage,
  plans,
  platformSetting,
}: SubscriptionClientProps) {
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<any>(null);

  const currentPlan = store.plan;
  const isExpired =
    store.subscriptionExpiresAt !== null &&
    new Date(store.subscriptionExpiresAt).getTime() < Date.now();

  const daysRemaining = store.subscriptionExpiresAt
    ? Math.max(
        0,
        Math.ceil(
          (new Date(store.subscriptionExpiresAt).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const maxProducts = currentPlan?.maxActiveProducts >= 999999 ? "Tanpa Batas" : currentPlan?.maxActiveProducts || 15;
  const maxAdmins = currentPlan?.maxAdmins || 1;
  const supportWa = platformSetting?.supportWhatsapp || "62895389974414";

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Paket &amp; Status Langganan SaaS
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau sisa masa aktif katalog, batasan kuota fitur, dan petunjuk perpanjangan/upgrade paket resmi.
        </p>
      </div>

      {/* ── Active Subscription Status Card ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Paket {store.tier} Aktif</span>
              </span>
              {store.isActive && !isExpired && (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Aktif Beroperasi
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentPlan?.name || store.tier} Plan
            </h2>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {currentPlan?.description ||
                "Paket langganan katalog digital mandiri sentra konter HP second Bandung."}
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  Masa Aktif:{" "}
                  <b className="text-white">
                    {store.subscriptionExpiresAt
                      ? new Date(store.subscriptionExpiresAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Permanen / Trial"}
                  </b>
                </span>
              </div>
              {daysRemaining !== null && (
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {daysRemaining} Hari Lagi
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end justify-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Investasi Bulanan</div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatRupiah(currentPlan?.price || 0)}
              <span className="text-xs font-normal text-slate-400"> /bln</span>
            </div>
            <a
              href={`https://wa.me/${supportWa}?text=Halo%20Admin%20GadgetBdg,%20saya%20ingin%20perpanjang%20atau%20upgrade%20paket%20toko%20${encodeURIComponent(
                store.name
              )}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <span>Perpanjang / Hubungi Billing</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Live Quota & Usage Grid ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Pemakaian Kuota Realtime dari PostgreSQL
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Produk Aktif */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" /> Kuota Unit Aktif
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                {usage.activeProductCount} / {maxProducts}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {usage.activeProductCount} Unit
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{
                  width: `${
                    typeof maxProducts === "number"
                      ? Math.min((usage.activeProductCount / maxProducts) * 100, 100)
                      : 20
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Status AVAILABLE &amp; BOOKED terhitung kuota
            </p>
          </div>

          {/* Card 2: Akun Staf */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" /> Akun Staf &amp; Kasir
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                {usage.staffCount} / {maxAdmins}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {usage.staffCount} Akun
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{
                  width: `${Math.min((usage.staffCount / maxAdmins) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Termasuk akun utama Pemilik Toko (Owner)
            </p>
          </div>

          {/* Card 3: Cabang Fisik */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" /> Cabang Toko
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                {usage.branchCount} Cabang
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {usage.branchCount} Lokasi
            </div>
            <p className="text-[11px] text-slate-400 pt-3">
              Didukung integrasi Google Maps &amp; filter etalase
            </p>
          </div>
        </div>
      </div>

      {/* ── Official QRIS & Bank Transfer Info Card ── */}
      {platformSetting && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Metode Pembayaran Resmi Platform (QRIS &amp; Transfer)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Verifikasi Otomatis / Manual</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: QRIS Display */}
            {platformSetting.qrisImageUrl && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="w-32 h-32 rounded-xl bg-white p-2 border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                  <img
                    src={platformSetting.qrisImageUrl}
                    alt="QRIS Resmi Platform"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    QRIS Standar Nasional
                  </span>
                  <div className="font-bold text-slate-900">
                    NMID: {platformSetting.qrisNmid || "ID1026592057644"}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Scan via BCA Mobile, Livin Mandiri, GoPay, OVO, ShopeePay, atau DANA.
                  </p>
                </div>
              </div>
            )}

            {/* Right: Bank Transfer info if enabled */}
            <div className="space-y-2 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-blue-950 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Transfer Bank Alternatif:</span>
                </div>
                <div className="font-mono font-black text-sm">
                  {platformSetting.bankName || "BCA"} - {platformSetting.bankAccountNumber || "1234567890"}
                </div>
                <div className="text-[11px] text-blue-800">
                  a.n. {platformSetting.bankAccountHolder || "PT Gadget Bandung Solusindo"}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Setelah transfer, kirim bukti resi via WhatsApp untuk verifikasi instan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Compare All SaaS Plans ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Bandingkan Pilihan Paket Lainnya
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isCurrent = p.id === store.tier;
            return (
              <div
                key={p.id}
                className={`rounded-2xl p-5 border transition flex flex-col justify-between space-y-4 ${
                  isCurrent
                    ? "bg-blue-50/50 border-blue-500 shadow-md ring-1 ring-blue-500"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-xs"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {p.id}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Paket Anda Saat Ini
                      </span>
                    )}
                  </div>

                  <h4 className="font-black text-base text-slate-900">{p.name}</h4>
                  <div className="text-xl font-black text-slate-900">
                    {formatRupiah(p.price)}
                    <span className="text-xs font-normal text-slate-400"> /bln</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>

                  <div className="space-y-1.5 pt-2 text-xs border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Maks {p.maxActiveProducts >= 999999 ? "Tanpa Batas" : `${p.maxActiveProducts} Unit`} Produk</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.maxAdmins} Akun Staf / Kasir</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.availableTemplatesCount} Pilihan Template Storefront</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{p.hasCustomDomain ? "Dukungan Custom Domain (.com)" : "Subdomain Resmi (.gadgetbdg.com)"}</span>
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <a
                    href={`https://wa.me/${supportWa}?text=Halo%20Admin,%20saya%20ingin%20upgrade%20toko%20${encodeURIComponent(
                      store.name
                    )}%20ke%20paket%20${p.name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Upgrade ke {p.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
