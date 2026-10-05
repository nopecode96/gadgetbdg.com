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
  Receipt,
  FileText,
  Check,
  XCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface PaymentRow {
  id: string;
  tier: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
}

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
  payments?: PaymentRow[];
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
  payments = [],
  platformSetting,
}: SubscriptionClientProps) {
  const currentPlan = store.plan;
  const isStarter = store.tier === "STARTER";
  const isPro = store.tier === "PRO";

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

  // 2 Paket Baru: Starter Rp 300rb, Pro Rp 600rb
  const promoPrice = isStarter ? 300000 : 600000;
  const originalPrice = isStarter ? 500000 : 1000000;
  const maxProductsLimit = isStarter ? 50 : "Tanpa Batas (Unlimited)";
  const maxAdmins = isStarter ? 1 : 3;
  const supportWa = platformSetting?.supportWhatsapp || "62895389974414";

  // WA text perpanjangan invoice promo
  const renewalWaMessage = encodeURIComponent(
    `Halo Admin Billing GadgetBdg,\n\n` +
      `Saya ingin memperpanjang paket *${store.tier}* untuk toko *${store.name}* (${store.slug}.gadgetbdg.com) ` +
      `dengan harga promo *${formatRupiah(promoPrice)}/bulan*.\n\n` +
      `Mohon kirimkan invoice dan instruksi pembayaran resmi. Terima kasih!`
  );

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Paket &amp; Status Langganan Toko
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Pantau sisa masa aktif katalog, kuota produk aktif, dan invoice perpanjangan paket resmi.
        </p>
      </div>

      {/* ── Active Subscription Status Card ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
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
              {isExpired && (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Kedaluwarsa
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentPlan?.name || store.tier} Plan
            </h2>

            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {isStarter
                ? "Katalog online PWA praktis pengganti Linktree dengan limit hingga 50 produk aktif."
                : "Solusi toko online bonafide dengan produk tanpa batas (unlimited) dan custom domain brand sendiri."}
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
                <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-md border ${
                  daysRemaining <= 5
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse"
                    : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                }`}>
                  {daysRemaining} Hari Lagi
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end justify-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">Harga Promo Perpanjangan</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-400 line-through text-xs font-semibold decoration-rose-500">
                {formatRupiah(originalPrice)}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {formatRupiah(promoPrice)}
              </span>
              <span className="text-xs font-normal text-slate-400">/bln</span>
            </div>
            <a
              href={`https://wa.me/${supportWa}?text=${renewalWaMessage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <span>💳 Bayar / Minta Invoice Resmi</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Live Quota & Usage Grid ── */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Status Kuota Realtime Database Toko
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Produk Aktif (Limit 50 vs Unlimited) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" /> Kuota Produk Aktif
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                {usage.activeProductCount} / {isStarter ? 50 : "∞"}
              </span>
            </div>
            <div className="text-xl font-black text-slate-900">
              {usage.activeProductCount} / {isStarter ? "50 Unit" : "Unlimited"}
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isStarter && usage.activeProductCount >= 50
                    ? "bg-rose-500"
                    : isStarter && usage.activeProductCount >= 40
                    ? "bg-amber-500"
                    : "bg-blue-600"
                }`}
                style={{
                  width: `${
                    isStarter
                      ? Math.min((usage.activeProductCount / 50) * 100, 100)
                      : 25
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              {isStarter
                ? "Paket Starter: Maksimal 50 item produk aktif"
                : "Paket Pro: Bebas tambah produk tanpa batas (Unlimited)"}
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
              {isStarter ? "Maksimal 1 akun (Pemilik)" : "Maksimal 3 akun staf kasir"}
            </p>
          </div>

          {/* Card 3: Domain Toko */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" /> Alamat Web Toko
              </span>
              <span className="text-[11px] font-bold text-slate-700">
                {isPro ? "Custom Domain" : "Subdomain"}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 truncate font-mono">
              {store.slug}.gadgetbdg.com
            </div>
            <p className="text-[11px] text-slate-400 pt-2">
              {isPro
                ? "Dukungan custom domain toko sendiri aktif"
                : "Toko Starter menggunakan subdomain resmi GadgetBdg"}
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

            {/* Right: Bank Transfer info */}
            <div className="space-y-2 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-blue-950 space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Transfer Bank Resmi:</span>
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

      {/* ── 2 Pilihan Paket Aktif: Starter vs Pro ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Pilihan Skema Paket Baru
            </h3>
            <p className="text-xs text-slate-500">
              Tingkatkan kapasitas toko Anda sesuai perputaran stok konter HP Anda.
            </p>
          </div>
          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
            PROMO 2026 • HEMAT 40%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: STARTER */}
          <div
            className={`rounded-3xl p-6 sm:p-7 border-2 transition flex flex-col justify-between space-y-5 ${
              isStarter
                ? "bg-blue-50/40 border-blue-600 shadow-xl shadow-blue-600/10 ring-2 ring-blue-600"
                : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  STARTER • PERINTIS
                </span>
                {isStarter && (
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    Paket Anda Saat Ini
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-black text-xl text-slate-900">Starter Plan</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Katalog online PWA praktis pengganti Linktree untuk pedagang HP pemula.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-xs font-semibold decoration-rose-500">
                    Rp 500.000
                  </span>
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2 py-0.2 rounded-full">
                    HEMAT 40%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-950 font-mono">
                  Rp 300.000
                  <span className="text-xs font-normal text-slate-500 font-sans"> / bulan</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 text-xs border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kapasitas Hingga <b>50 Unit Produk Aktif</b></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subdomain Resmi: <code>namatoko.gadgetbdg.com</code></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0% Potongan Komisi Transaksi</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cetak QR Code Meja Kasir (Katalog &amp; Review)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Modul Trade-In &amp; Kontak WhatsApp Langsung</span>
                </div>
              </div>
            </div>

            {isStarter ? (
              <a
                href={`https://wa.me/${supportWa}?text=${renewalWaMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                <span>Perpanjang Paket Starter (Rp 300rb)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="w-full py-2.5 rounded-xl text-center text-xs text-slate-400 font-medium bg-slate-50 border border-slate-200">
                Paket di bawah tier Anda saat ini
              </div>
            )}
          </div>

          {/* Card 2: PRO */}
          <div
            className={`rounded-3xl p-6 sm:p-7 border-2 transition flex flex-col justify-between space-y-5 relative ${
              isPro
                ? "bg-indigo-50/40 border-indigo-600 shadow-xl shadow-indigo-600/10 ring-2 ring-indigo-600"
                : "bg-white border-blue-500 shadow-lg hover:shadow-xl"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  PRO • REKOMENDASI
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                  PALING POPULER
                </span>
              </div>

              <div>
                <h4 className="font-black text-xl text-slate-900">Pro Plan</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Solusi toko online bonafide dengan domain brand sendiri dan kapasitas produk tanpa batas.
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-xs font-semibold decoration-rose-500">
                    Rp 1.000.000
                  </span>
                  <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black px-2 py-0.2 rounded-full">
                    HEMAT 40%
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-950 font-mono">
                  Rp 600.000
                  <span className="text-xs font-normal text-slate-500 font-sans"> / bulan</span>
                </div>
              </div>

              <div className="space-y-2 pt-3 text-xs border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kapasitas Produk <b>Tanpa Batas (Unlimited)</b></span>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Custom Domain Sendiri (<code>namatoko.com</code>)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dukungan Hingga 3 Akun Staf / Kasir Toko</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prioritas Server &amp; Layanan VIP WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SSL Gratis &amp; Dibantu Tim Sampai Live</span>
                </div>
              </div>
            </div>

            {isPro ? (
              <a
                href={`https://wa.me/${supportWa}?text=${renewalWaMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <span>Perpanjang Paket Pro (Rp 600rb)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <a
                href={`https://wa.me/${supportWa}?text=${encodeURIComponent(
                  `Halo Admin GadgetBdg, saya ingin upgrade toko *${store.name}* ke *Paket PRO (Rp 600.000/bln)* untuk mendapatkan produk unlimited & custom domain. Mohon bantu prosesnya!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl font-black text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Upgrade ke Paket Pro Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Riwayat Pembayaran (Payment History) ── */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Riwayat Pembayaran &amp; Invoice Langganan
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">{payments.length} Transaksi</span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            Belum ada catatan pembayaran langganan untuk toko ini.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Mobile View: Adaptive Card List */}
            <div className="block sm:hidden space-y-3">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : p.status === "REJECTED"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {p.status === "APPROVED" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : p.status === "REJECTED" ? (
                        <XCircle className="w-3 h-3 text-rose-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{p.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <div className="font-bold text-slate-800">Paket {p.tier}</div>
                    <div className="font-mono font-black text-slate-900">{formatRupiah(p.amount)}</div>
                  </div>

                  {p.receiptUrl && (
                    <div className="pt-1 border-t border-slate-200/60 text-right">
                      <a
                        href={p.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
                      >
                        <span>Lihat Bukti Transfer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View: Clean Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Paket</th>
                    <th className="py-2.5 px-3">Nominal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {new Date(p.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{p.tier}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : p.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {p.status === "APPROVED" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : p.status === "REJECTED" ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{p.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {p.receiptUrl ? (
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1 font-bold text-[11px]"
                          >
                            <span>Lihat Resi</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
