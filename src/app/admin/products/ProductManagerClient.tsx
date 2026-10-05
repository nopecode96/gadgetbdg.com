"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  CheckCheck,
  Search,
  BatteryCharging,
  AlertCircle,
  PackageX,
  Pencil,
  ChevronRight,
  Sparkles,
  Star,
  X,
  Rocket,
  Lock,
  ArrowRight,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toggleProductStatus, deleteProductAction, toggleProductFeaturedAction } from "@/lib/actions";
import { ProductForm } from "@/components/admin/ProductForm";
import {
  ProductDetailDrawer,
  ProductDetailItem,
} from "@/components/admin/ProductDetailDrawer";

export function ProductManagerClient({
  store,
  initialProducts,
  branches = [],
  canAddProduct = true,
  maxActiveProducts = Infinity,
  activeProductCount = 0,
}: {
  store?: any;
  initialProducts: ProductDetailItem[];
  branches?: Array<{ id: string; name: string; address?: string }>;
  canAddProduct?: boolean;
  maxActiveProducts?: number;
  activeProductCount?: number;
}) {
  const [products, setProducts] = useState<ProductDetailItem[]>(initialProducts);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [featuredUpdatingId, setFeaturedUpdatingId] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Master-Detail Drawer state
  const [selectedProduct, setSelectedProduct] = useState<ProductDetailItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Live active count based on current local state (AVAILABLE + BOOKED)
  const liveActiveCount = products.filter(
    (p) => p.status === "AVAILABLE" || p.status === "BOOKED"
  ).length;

  const isStarter = store?.tier === "STARTER" || maxActiveProducts === 50;
  const quotaMax = isStarter ? 50 : (maxActiveProducts === Infinity ? null : maxActiveProducts);
  const quotaPercent = quotaMax ? Math.min((liveActiveCount / quotaMax) * 100, 100) : 0;
  const isQuotaFull = isStarter && liveActiveCount >= 50;

  const filtered = products.filter((p) => {
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchSearch =
      (p.title || p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleOpenDetail = (product: ProductDetailItem) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDrawerOpen(false);
  };

  async function handleToggleStatus(
    e: React.MouseEvent,
    productId: string,
    currentStatus: string
  ) {
    e.stopPropagation(); // Prevent row click from opening drawer
    const nextStatus =
      currentStatus === "AVAILABLE"
        ? "BOOKED"
        : currentStatus === "BOOKED"
        ? "SOLD"
        : "AVAILABLE";

    setStatusUpdatingId(productId);
    const res = await toggleProductStatus(productId, nextStatus);
    setStatusUpdatingId(null);

    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, ...(res.product as any), status: nextStatus } : item
        )
      );
      if (selectedProduct?.id === productId) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, ...(res.product as any), status: nextStatus } : null
        );
      }
    } else {
      alert(res.error || "Gagal memperbarui status unit.");
    }
  }

  async function handleToggleFeatured(e: React.MouseEvent, productId: string) {
    e.stopPropagation();
    setFeaturedUpdatingId(productId);
    const res = await toggleProductFeaturedAction(productId);
    setFeaturedUpdatingId(null);

    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, ...(res.product as any) } : item
        )
      );
      if (selectedProduct?.id === productId) {
        setSelectedProduct((prev) =>
          prev ? { ...prev, ...(res.product as any) } : null
        );
      }
    } else {
      alert(res.error || "Gagal mengubah status unit pilihan.");
    }
  }

  async function handleDelete(e: React.MouseEvent, productId: string) {
    e.stopPropagation(); // Prevent row click from opening drawer
    if (!confirm("Yakin ingin menghapus unit HP ini dari katalog?")) return;
    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (selectedProduct?.id === productId) {
        setIsDrawerOpen(false);
        setSelectedProduct(null);
      }
    } else {
      alert(res.error || "Gagal menghapus unit.");
    }
  }

  // Callbacks for drawer sync
  const handleProductUpdated = (updated: ProductDetailItem) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item))
    );
    setSelectedProduct((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev));
  };

  const handleProductDeleted = (deletedId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== deletedId));
    if (selectedProduct?.id === deletedId) {
      setSelectedProduct(null);
      setIsDrawerOpen(false);
    }
  };

  // Pagination state
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      {/* ── Title & Quota Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Manajemen Stok Unit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update stok, ubah status unit secara realtime, dan kelola listing HP second.
          </p>

          {/* Quota Progress / Unlimited Badge */}
          {isStarter ? (
            <div className="mt-3 max-w-xs space-y-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                    liveActiveCount >= 50
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : liveActiveCount >= 40
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    liveActiveCount >= 50 ? "bg-rose-500" : liveActiveCount >= 40 ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <span>{liveActiveCount}/50 Produk Digunakan</span>
                </span>
                {liveActiveCount >= 50 && (
                  <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                    Penuh
                  </span>
                )}
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    liveActiveCount >= 50
                      ? "bg-rose-500"
                      : liveActiveCount >= 40
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Produk Unlimited</span>
              </span>
            </div>
          )}
        </div>

        {/* Add Button — triggers modal or opens form */}
        <div className="shrink-0 flex items-center flex-wrap gap-2">
          {isQuotaFull ? (
            <>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Form Cepat</span>
              </button>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/20 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Unit Baru</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsFormOpen(!isFormOpen)}
                className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isFormOpen ? "Tutup Form" : "Form Cepat"}</span>
              </button>
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Produk Baru</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ── Quota Full Alert ── */}
      {isQuotaFull && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-rose-900">Batas 50 Produk Starter Telah Tercapai</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                Paket <b>Starter</b> mendukung maksimal <b>50 produk aktif</b>. Upgrade ke <b>Paket Pro</b> untuk menambah produk sepuasnya tanpa batas (Unlimited).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition shadow-sm cursor-pointer"
          >
            Upgrade ke Pro →
          </button>
        </div>
      )}

      {/* ── Upgrade Modal ── */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Batas 50 Produk Starter Telah Tercapai
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Katalog toko Anda saat ini sudah mencapai batas maksimal <b>50 produk aktif</b> untuk Paket Starter.
                Upgrade ke <b>Paket Pro</b> untuk menikmati penambahan produk <b>tanpa batas (Unlimited)</b>, custom domain toko sendiri (.com / .id), dan performa server prioritas.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-medium leading-normal">
              💡 <b>Tips Toko:</b> Anda juga dapat mengubah status unit yang sudah laku terjual menjadi <b>SOLD</b> untuk mengosongkan kembali slot kuota produk aktif.
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href="/admin/subscription"
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs text-center shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Upgrade ke Paket Pro Sekarang</span>
              </Link>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Product Form (3-Blok Layout) ── */}
      {isFormOpen && !isQuotaFull && (
        <div className="bg-slate-50/80 rounded-3xl p-4 sm:p-7 border border-blue-200 shadow-md">
          <ProductForm
            mode="create"
            branches={branches}
            onSuccess={() => {
              setIsFormOpen(false);
              window.location.reload();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}

      {/* ── Filter & Search Bar ── */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, brand, atau kategori..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(["ALL", "AVAILABLE", "BOOKED", "SOLD"] as const).map((status) => {
            const count =
              status === "ALL"
                ? products.length
                : products.filter((p) => p.status === status).length;
            const labels: Record<string, string> = {
              ALL: "Semua",
              AVAILABLE: "Tersedia",
              BOOKED: "Booked",
              SOLD: "Terjual",
            };
            return (
              <button
                key={status}
                onClick={() => {
                  setFilterStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap text-xs shrink-0 ${
                  filterStatus === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {labels[status]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Products List (Adaptive Card-Based Grid) ── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          Belum ada data unit yang sesuai pencarian atau filter.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card Grid: 1 col on mobile, 2 cols on tablet/laptop, 3 cols on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {paginatedProducts.map((p) => {
              const displayImage =
                p.images && p.images.length > 0 ? p.images[0] : p.thumbnail || null;

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer p-4 flex flex-col justify-between gap-3.5 group relative"
                >
                  {/* Row 1: Header Thumbnail & Basic Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Thumbnail 80x80 on mobile, 72x72 on desktop */}
                    <div className="relative w-20 h-20 sm:w-18 sm:h-18 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                      {displayImage ? (
                        <>
                          <img
                            src={displayImage}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {p.images && p.images.length > 1 && (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] font-bold px-1 rounded">
                              {p.images.length} 📷
                            </span>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">
                          No Pic
                        </div>
                      )}
                    </div>

                    {/* Title, Brand, Price */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {p.brand}
                        </span>
                        {p.isFeatured && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                            Pilihan
                          </span>
                        )}
                        {p.isReadyCod === false && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            Non-COD
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                        {p.title || p.name}
                      </h3>

                      <div className="font-black text-blue-600 text-sm sm:text-base pt-0.5">
                        {formatRupiah(p.price)}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Detail Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {p.ramRom || (p.storage ? `${p.ram || ""} ${p.storage}` : "-")}
                    </span>

                    <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {p.grade || p.condition || "Grade A"}
                    </span>

                    {p.batteryHealth !== null && p.batteryHealth !== "" && (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <BatteryCharging className="w-3 h-3" /> BH {p.batteryHealth}
                      </span>
                    )}

                    {p.imeiStatus && (
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {p.imeiStatus}
                      </span>
                    )}

                    {p.branch && (
                      <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        🏢 {p.branch.name}
                      </span>
                    )}
                  </div>

                  {/* Row 3: Minus Notes (if any) */}
                  {(p.conditionNotes || p.minusNotes) && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 italic flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{p.conditionNotes || p.minusNotes}</span>
                    </div>
                  )}

                  {/* Row 4: Action Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Status Toggle Button (Always visible without clipping) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, p.id, p.status)}
                      disabled={statusUpdatingId === p.id}
                      title={`Status: ${p.status}. Klik untuk ubah cepat.`}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs ${
                        statusUpdatingId === p.id
                          ? "bg-slate-200 text-slate-500 cursor-wait"
                          : p.status === "AVAILABLE"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : p.status === "BOOKED"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-slate-700 hover:bg-slate-800 text-white"
                      }`}
                    >
                      {statusUpdatingId === p.id ? (
                        "..."
                      ) : p.status === "AVAILABLE" ? (
                        <><CheckCircle className="w-3.5 h-3.5" /> Tersedia</>
                      ) : p.status === "BOOKED" ? (
                        <><Clock className="w-3.5 h-3.5" /> Booked</>
                      ) : (
                        <><CheckCheck className="w-3.5 h-3.5" /> Terjual</>
                      )}
                    </button>

                    {/* Quick Action Icons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleFeatured(e, p.id)}
                        disabled={featuredUpdatingId === p.id}
                        title={p.isFeatured ? "Unit Pilihan Aktif" : "Jadikan Unit Pilihan"}
                        className={`p-2 rounded-xl transition ${
                          p.isFeatured
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-400 hover:text-amber-500 hover:bg-amber-50"
                        }`}
                      >
                        <Star className={`w-4 h-4 ${p.isFeatured ? "fill-amber-400" : ""}`} />
                      </button>

                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Edit Produk"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, p.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Hapus Unit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Pagination Controls ── */}
          {filtered.length > ITEMS_PER_PAGE && (
            <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} unit
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
                >
                  ← Sebelumnya
                </button>

                <span className="px-3 py-1.5 font-bold text-slate-700 bg-slate-100 rounded-lg">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition cursor-pointer"
                >
                  Selanjutnya →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Master-Detail Slide-Over Drawer ── */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDetail}
        storeSlug={store?.slug || ""}
        branches={branches}
        onProductUpdated={handleProductUpdated}
        onProductDeleted={handleProductDeleted}
      />
    </div>
  );
}
