"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Plus,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react";
import { StoreData, ReviewData } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";
import { submitStoreReviewAction } from "@/lib/actions/review-actions";

interface StoreAboutViewProps {
  store: StoreData;
  theme?: string;
  isMockup?: boolean;
}

export function StoreAboutView({ store, theme, isMockup = false }: StoreAboutViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const [reviews, setReviews] = useState<ReviewData[]>(store.reviews || []);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [purchasedUnit, setPurchasedUnit] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  const defaultMapsLink =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address || `${store.name} Bandung`
    )}`;

  const branches = store.branches || [];

  // Hitung rata-rata rating
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "4.9";

  const allowCustomerReviews = store.tier !== "STARTER";

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isMockup) {
      alert("Mode mockup preview: ulasan ulasan tidak disimpan ke server.");
      setShowModal(false);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitStoreReviewAction({
      storeId: store.id,
      customerName,
      rating,
      comment,
      purchasedUnit: purchasedUnit || undefined,
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      setReviews([res.review, ...reviews]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowModal(false);
        setCustomerName("");
        setPurchasedUnit("");
        setComment("");
        setRating(5);
      }, 1500);
    } else {
      setSubmitError(res.error || "Gagal mengirimkan ulasan.");
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs font-sans pb-10">
      {/* ── 1. HEADER & COVER FISIK TOKO ── */}
      <div className={`rounded-3xl overflow-hidden relative border ${colors.borderContainer} shadow-lg`}>
        <div className="aspect-16/9 w-full bg-slate-800 relative">
          <img
            src={
              store.storeImage ||
              store.bannerUrl ||
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"
            }
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Merchant Bandung</span>
              </span>
            </div>
            <h2 className="text-xl font-black leading-tight tracking-tight mt-0.5 text-white">{store.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-black text-xs ml-1 text-white">{averageRating}</span>
              </div>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-300 font-medium">
                {totalReviews > 0 ? `${totalReviews} Ulasan Pembeli` : "Spesialis HP Second Original"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. KONTAK CEPAT WHATSAPP ── */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm">
            <MessageCircle className="w-4 h-4 text-emerald-500 fill-current" />
            <span>Kontak &amp; Hotline Kasir</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Fast Response
          </span>
        </div>

        <p className={`text-xs ${colors.textSecondary}`}>
          Ingin cek stok fisik unit di etalase, minta video 3uTools, atau negosiasi sebelum mampir ke konter? Chat kami sekarang.
        </p>

        <a
          href={
            isMockup
              ? "#"
              : `https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                  store.name
                )},%20saya%20ingin%20tanya%20stok%20HP%20second`
          }
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            if (isMockup) e.preventDefault();
          }}
          className="w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Chat Kasir Toko via WhatsApp</span>
        </a>
      </div>

      {/* ── 3. JAM OPERASIONAL TOKO ── */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className={`flex items-center justify-between border-b pb-2.5 ${colors.cardBorder}`}>
          <div className="flex items-center gap-2 font-black text-sm">
            <Clock className={`w-4 h-4 ${colors.accentText}`} />
            <span>Jam Operasional Toko</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Buka Sekarang
          </span>
        </div>

        <div className={`text-xs ${colors.textSecondary}`}>
          <p className="font-semibold text-slate-800 dark:text-slate-100">
            {store.operationalHours || "Setiap Hari: 10:00 - 20:30 WIB"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5">
            Melayani COD konter, tukar tambah, dan pengiriman kurir instan Bandung Raya.
          </p>
        </div>
      </div>

      {/* ── 4. ALAMAT FISIK & PETUNJUK ARAH (GOOGLE MAPS) ── */}
      {branches.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-black text-sm px-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Cabang Resmi Toko ({branches.length})</span>
          </div>

          <div className="space-y-2.5">
            {branches.map((b) => {
              const bMaps =
                b.mapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  b.address || `${store.name} ${b.name}`
                )}`;
              let bCleanWa = (b.phone || store.whatsapp || "").replace(/\D/g, "");
              if (bCleanWa.startsWith("0")) bCleanWa = "62" + bCleanWa.slice(1);

              return (
                <div
                  key={b.id}
                  className={`rounded-3xl p-4 border space-y-2.5 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{b.name}</span>
                    </div>
                    {b.isMain && (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                        PUSAT
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : colors.textSecondary}`}>{b.address}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={isMockup ? "#" : bMaps}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isMockup) e.preventDefault();
                      }}
                      className="flex-1 py-2 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Petunjuk Arah</span>
                    </a>

                    <a
                      href={
                        isMockup
                          ? "#"
                          : `https://wa.me/${bCleanWa}?text=Halo%20${encodeURIComponent(
                              store.name
                            )}%20${encodeURIComponent(b.name)},%20apakah%20stok%20tersedia?`
                      }
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isMockup) e.preventDefault();
                      }}
                      className="px-3.5 py-2 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1 text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" />
                      <span>WA</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-3xl p-4 border space-y-3 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
        >
          <div className={`flex items-center gap-2 font-black text-sm border-b pb-2.5 ${colors.cardBorder}`}>
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Alamat Fisik Markas Toko</span>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : colors.textSecondary}`}>
            {store.address || "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung"}
          </p>

          <a
            href={isMockup ? "#" : defaultMapsLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              if (isMockup) e.preventDefault();
            }}
            className="w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Petunjuk Arah (Google Maps)</span>
          </a>
        </div>
      )}

      {/* ── 5. GARANSI & JAMINAN TRANSAKSI ── */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center gap-2 font-black text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>Garansi &amp; Jaminan Transaksi</span>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className={isDark ? "text-slate-300" : colors.textSecondary}>
              <b className={colors.textPrimary}>Garansi Toko Resmi:</b> {store.warrantyPolicy || "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup."}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className={isDark ? "text-slate-300" : colors.textSecondary}>
              <b className={colors.textPrimary}>Bebas Blokir IMEI Seumur Hidup:</b> Semua unit berstatus resmi iBox, SEIN, atau terdaftar Kemenperin/Bea Cukai.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className={isDark ? "text-slate-300" : colors.textSecondary}>
              <b className={colors.textPrimary}>Gratis Pindah Data di Konter:</b> Didampingi kasir berpengalaman untuk transfer WhatsApp, foto, dan akun iCloud/Google.
            </p>
          </div>
        </div>
      </div>

      {/* ── 6. SECTION REPUTASI & ULASAN PEMBELI ── */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-xs ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Reputasi &amp; Ulasan Pembeli</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              ★ {averageRating}
            </span>

            {allowCustomerReviews && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tulis Ulasan</span>
              </button>
            )}
          </div>
        </div>

        {/* Daftar Review */}
        {reviews.length > 0 ? (
          <div className="space-y-2.5 pt-1">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-3 rounded-2xl border ${colors.cardBorder} ${isDark ? "bg-slate-900/60" : "bg-white"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  {rev.purchasedUnit && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md truncate max-w-[140px] ${
                      isDark
                        ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/60"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}>
                      Unit: {rev.purchasedUnit}
                    </span>
                  )}
                </div>
                <p className={`text-xs italic leading-relaxed ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}>
                  &ldquo;{rev.comment}&rdquo;
                </p>
                <span className={`text-[10px] block mt-1.5 font-bold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  — {rev.customerName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-4 rounded-2xl text-center space-y-1.5 border border-dashed ${
            isDark
              ? "bg-slate-900/40 border-slate-700 text-slate-400"
              : "bg-neutral-50 border-slate-200 text-slate-500"
          }`}>
            <p className="text-xs">
              Belum ada ulasan untuk toko ini. Jadilah pembeli pertama yang memberikan testimoni!
            </p>
            {allowCustomerReviews && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className={`mt-1 text-xs font-bold hover:underline inline-flex items-center gap-1 ${
                  isDark ? "text-emerald-400 hover:text-emerald-300" : "text-blue-600"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tulis Ulasan Pembeli Sekarang</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL INTERAKTIF: TULIS ULASAN ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm text-slate-950 dark:text-white">Tulis Ulasan Pembeli</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-xs">Terima kasih! Ulasan Anda berhasil dikirim.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                {submitError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Rating Bintang */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bintang Penilaian *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="p-1 text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            starVal <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black text-slate-900 dark:text-white ml-2">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                {/* Nama Pembeli */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Anda *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Farhan R. (Dago)"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Unit HP yang Dibeli */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unit HP yang Dibeli (Opsional)
                  </label>
                  <input
                    type="text"
                    value={purchasedUnit}
                    onChange={(e) => setPurchasedUnit(e.target.value)}
                    placeholder="Contoh: iPhone 13 128GB Midnight"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Komentar */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ulasan & Pengalaman Belanja *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda belanja di konter ini..."
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
