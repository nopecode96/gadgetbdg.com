"use client";

import React from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Building2,
  Share2,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AdvancePaywallCardProps {
  featureTitle?: string;
  featureDescription?: string;
  currentTier?: string;
  storeName?: string;
}

export function AdvancePaywallCard({
  featureTitle = "Generator Konten Story 9:16 & Subdomain Khusus Cabang",
  featureDescription = "Fitur Eksklusif Paket Advance: Generator Konten Story 9:16 & Subdomain Khusus Cabang hanya tersedia untuk pengguna paket Advance. Tingkatkan paket Anda untuk membuka fitur otomatisasi promosi dan multi-cabang tanpa batas.",
  currentTier = "STARTER",
  storeName,
}: AdvancePaywallCardProps) {
  const billingWaUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(
    `Halo Admin GadgetBdg, saya ingin upgrade langganan toko ${
      storeName ? `"${storeName}"` : ""
    } (Paket saat ini: ${currentTier}) ke Paket ADVANCE untuk mengaktifkan Fitur Generator Story 9:16 & Subdomain Multi-Cabang.`
  )}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/90 p-6 sm:p-10 shadow-xl">
      {/* Decorative gradient glow circles */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl" />

      <div className="relative z-10 max-w-3xl space-y-6">
        {/* Badge & Lock Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm">
            <Lock className="h-3.5 w-3.5" />
            <span>Fitur Eksklusif Paket Advance</span>
          </span>
          <span className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-bold text-slate-700">
            Tier Anda Saat Ini: <b className="text-slate-900">{currentTier}</b>
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {featureTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            {featureDescription}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">
                Story Card 9:16 Canvas HD
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Unduh poster promosi resolusi tinggi 1080x1920 siap posting Instagram Story, TikTok, & WhatsApp status sekali klik.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">
                Subdomain Multi-Cabang Mandiri
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight">
                Alamat katalog mandiri per outlet (contoh: <code>bec.tokoberkah.com</code>) dengan routing hotline WA kasir cabang langsung.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
          <a
            href={billingWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Upgrade ke Advance via WhatsApp Platform</span>
          </a>

          <Link
            href="/admin/subscription"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>Lihat Rincian Paket & Billing</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
