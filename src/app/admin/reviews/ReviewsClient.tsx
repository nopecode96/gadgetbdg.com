"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Trash2,
  Building2,
  AlertCircle,
  CheckCircle2,
  Store,
  Lock,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { createStoreReviewAction, deleteStoreReviewAction } from "@/lib/actions/review-actions";
import { TIER_LIMITS } from "@/lib/constants/pricing";
import type { StoreTier } from "@prisma/client";

interface ReviewItem {
  id: string;
  storeId: string;
  branchId: string | null;
  branchName: string | null;
  customerName: string;
  rating: number;
  comment: string;
  purchasedUnit: string | null;
  reviewDate: string;
  createdAt: string;
}

interface BranchItem {
  id: string;
  name: string;
  slug: string;
  isMain: boolean;
}

interface ReviewsClientProps {
  storeId: string;
  storeName: string;
  tier: string;
  initialReviews: ReviewItem[];
  branches: BranchItem[];
}

export function ReviewsClient({
  storeId,
  storeName,
  tier,
  initialReviews,
  branches,
}: ReviewsClientProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [unitBought, setUnitBought] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [branchId, setBranchId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const isStarter = tier === "STARTER";
  const tierConfig = TIER_LIMITS[tier as StoreTier] || TIER_LIMITS.STARTER;
  const maxReviews = tierConfig.maxReviews;

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (selectedBranchFilter === "ALL") return true;
    if (selectedBranchFilter === "MAIN") return !r.branchId;
    return r.branchId === selectedBranchFilter;
  });

  // Pagination
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  async function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      setFormError("Nama pembeli dan isi komentar ulasan wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const res = await createStoreReviewAction({
      storeId,
      branchId: branchId ? branchId : null,
      customerName,
      purchasedUnit: unitBought ? unitBought : undefined,
      rating,
      comment,
    });

    setIsSubmitting(false);

    if (res.success && res.review) {
      setReviews([res.review as ReviewItem, ...reviews]);
      setFormSuccess("Ulasan pembeli berhasil ditambahkan!");
      setCustomerName("");
      setUnitBought("");
      setRating(5);
      setComment("");
      setBranchId("");
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1200);
    } else {
      setFormError(res.error || "Gagal menambahkan ulasan.");
    }
  }

  async function handleDeleteReview(id: string) {
    if (!confirm("Apakah Anda yakin ingin menghapus ulasan testimoni ini?")) {
      return;
    }

    setDeletingId(id);
    const res = await deleteStoreReviewAction(id);
    setDeletingId(null);

    if (res.success) {
      setReviews(reviews.filter((r) => r.id !== id));
    } else {
      alert(res.error || "Gagal menghapus ulasan.");
    }
  }

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Kelola Ulasan &amp; Reputasi Toko
            </h1>
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              ★ {avgRating} ({totalReviews} Ulasan)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Testimoni pembeli riil yang otomatis tampil pada kartu &quot;Reputasi &amp; Ulasan&quot; di etalase storefront {storeName}.
          </p>
        </div>

        {/* Action Button */}
        {!isStarter && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ulasan Pembeli</span>
          </button>
        )}
      </div>

      {/* ── PAYWALL STARTER TIER ── */}
      {isStarter && (
        <div className="rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50/40 p-6 text-slate-800 space-y-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Fitur Paket Pro &amp; Advance
                </span>
                <span className="text-xs text-slate-500 font-medium">Starter Terkunci</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                Tampilkan Reputasi Bintang &amp; Testimoni Kepuasan Pelanggan
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Fitur kartu Ulasan &amp; Reputasi Toko secara otomatis meningkatkan rasio konversi chat WhatsApp hingga 3x lipat dengan membangun kredibilitas instan di mata calon pembeli online. Upgrade ke paket <b>Pro</b> (maksimal 25 ulasan) atau <b>Advance</b> (ulasan tanpa batas &amp; alokasi per cabang).
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Mulai dari Rp 600.000 / bulan di Paket Pro</span>
            </div>
            <Link
              href="/admin/subscription"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              <span>Upgrade Paket Sekarang</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ── METRIC STATS & BRANCH FILTER ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Ulasan */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-blue-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Ulasan
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900">{totalReviews}</span>
              <span className="text-[11px] text-slate-400">
                / {Number.isFinite(maxReviews) ? `${maxReviews} kuota` : "Tanpa Batas"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Rata-rata Skor */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Skor Kepuasan
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900">★ {avgRating}</span>
              <span className="text-[11px] text-slate-400">dari 5.0 bintang</span>
            </div>
          </div>
        </div>

        {/* Card 3: Distribusi Cabang */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Cakupan Lokasi
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5 truncate">
              <span className="text-xl font-black text-slate-900">
                {branches.length > 0 ? `${branches.length} Cabang` : "Toko Tunggal"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTER TABS BY BRANCH (Jika Ada Cabang) ── */}
      {branches.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedBranchFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedBranchFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            Semua Ulasan ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedBranchFilter("MAIN")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
              selectedBranchFilter === "MAIN"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📍 Ulasan Umum / Pusat ({reviews.filter((r) => !r.branchId).length})
          </button>
          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranchFilter(b.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedBranchFilter === b.id
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              📍 {b.name} ({reviews.filter((r) => r.branchId === b.id).length})
            </button>
          ))}
        </div>
      )}

      {/* ── DAFTAR ULASAN ── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <h2 className="font-bold text-sm text-slate-900">
              Daftar Ulasan &amp; Testimoni ({filteredReviews.length})
            </h2>
          </div>
          {branches.length > 0 && selectedBranchFilter !== "ALL" && (
            <span className="text-[11px] text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md font-bold">
              Menampilkan filter cabang
            </span>
          )}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">Belum ada ulasan testimoni</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tambahkan testimoni kepuasan pembeli yang membeli smartphone di konter Anda untuk ditampilkan di storefront.
              </p>
            </div>
            {!isStarter && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Ulasan Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedReviews.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/60 transition"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.customerName}</span>

                    {/* Badge Rating */}
                    <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      <span className="text-[10px] font-black text-amber-800 ml-1">
                        {item.rating}.0
                      </span>
                    </div>

                    {/* Badge Cabang */}
                    {item.branchName ? (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{item.branchName}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        <span>Pusat / Umum</span>
                      </span>
                    )}

                    {/* Unit HP */}
                    {item.purchasedUnit && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 truncate max-w-[200px]">
                        <ShoppingBag className="w-3 h-3" />
                        <span>{item.purchasedUnit}</span>
                      </span>
                    )}
                  </div>

                  {/* Isi testimoni */}
                  <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  <div className="text-[10px] text-slate-400">
                    Ditambahkan pada {new Date(item.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Action Delete */}
                <div className="shrink-0 flex items-center gap-2 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(item.id)}
                    disabled={deletingId === item.id}
                    title="Hapus Ulasan"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredReviews.length > ITEMS_PER_PAGE && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Halaman {currentPage} dari {totalPages} ({filteredReviews.length} ulasan)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold hover:bg-white disabled:opacity-40 transition cursor-pointer"
              >
                ← Sebelumnya
              </button>
              <span className="px-3 py-1.5 font-bold text-slate-700 bg-white border border-slate-200 rounded-lg">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold hover:bg-white disabled:opacity-40 transition cursor-pointer"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL TAMBAH ULASAN ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Tambah Ulasan &amp; Testimoni Pembeli
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup ✕
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              {/* Rating Bintang */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rating Penilaian *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-110 transition text-amber-400"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-black text-slate-900 ml-2">
                    {rating} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Nama Pembeli */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Pembeli / Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Rian - Bandung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                />
              </div>

              {/* Unit HP yang dibeli */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Unit HP yang Dibeli (Opsional)
                </label>
                <input
                  type="text"
                  value={unitBought}
                  onChange={(e) => setUnitBought(e.target.value)}
                  placeholder="Contoh: iPhone 13 128GB Midnight"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                />
              </div>

              {/* Dropdown Cabang (Jika toko memiliki cabang) */}
              {branches.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lokasi Pembelian / Gerai Cabang
                  </label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                  >
                    <option value="">📍 Toko Umum / Pusat (Semua Gerai)</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name} {b.isMain ? "(Pusat)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ulasan yang ditugaskan ke cabang tertentu akan otomatis muncul di subdomain cabang terkait.
                  </p>
                </div>
              )}

              {/* Komentar Testimoni */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Isi Testimoni / Pengalaman Belanja *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Contoh: Pelayanan ramah, unit mulus seperti baru, free pindah data dan bonus case + tempered glass!"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition disabled:opacity-50 shadow-sm"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
