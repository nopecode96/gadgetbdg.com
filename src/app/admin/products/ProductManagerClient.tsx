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

  // Master-Detail Drawer state
  const [selectedProduct, setSelectedProduct] = useState<ProductDetailItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Live active count based on current local state (AVAILABLE + BOOKED)
  const liveActiveCount = products.filter(
    (p) => p.status === "AVAILABLE" || p.status === "BOOKED"
  ).length;
  const quotaMax = maxActiveProducts === Infinity ? null : maxActiveProducts;
  const quotaPercent = quotaMax ? Math.min((liveActiveCount / quotaMax) * 100, 100) : 0;
  const isQuotaFull = quotaMax !== null && liveActiveCount >= quotaMax;

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

  return (
    <div className="space-y-6">
      {/* ── Title & Quota Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Stok Unit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update stok, ubah status unit secara realtime, dan kelola listing HP second.
          </p>

          {/* Quota Progress */}
          <div className="mt-3 max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-slate-500">
                Stok Aktif:{" "}
                <span className={isQuotaFull ? "text-red-600 font-bold" : "text-slate-800"}>
                  {liveActiveCount}
                </span>
                {quotaMax !== null && (
                  <span className="text-slate-400"> / {quotaMax} Unit</span>
                )}
              </span>
              {quotaMax !== null && (
                <span
                  className={
                    isQuotaFull
                      ? "text-red-600 font-bold"
                      : quotaPercent >= 80
                      ? "text-amber-600"
                      : "text-slate-400"
                  }
                >
                  {Math.round(quotaPercent)}%
                </span>
              )}
            </div>
            {quotaMax !== null && (
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    isQuotaFull
                      ? "bg-red-500"
                      : quotaPercent >= 80
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Add Button — disabled when quota full */}
        <div className="shrink-0">
          {isQuotaFull ? (
            <div
              title="Kuota unit penuh. Upgrade paket untuk menambah unit lagi."
              className="inline-flex items-center gap-2 bg-slate-300 text-slate-500 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed select-none"
            >
              <PackageX className="w-4 h-4" />
              <span>Kuota Penuh</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
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
            </div>
          )}
        </div>
      </div>

      {/* ── Quota Full Alert ── */}
      {isQuotaFull && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-800">Kuota Stok Aktif Penuh</p>
            <p className="text-xs text-red-700 mt-0.5">
              Paket <b>{store?.tier}</b> mendukung maks <b>{quotaMax}</b> produk aktif (AVAILABLE +
              BOOKED). Ubah status unit yang sudah terjual ke <b>SOLD</b>, atau hubungi admin untuk
              upgrade paket.
            </p>
          </div>
        </div>
      )}

      {/* ── Add Product Form (3-Blok Layout) ── */}
      {isFormOpen && !isQuotaFull && (
        <div className="bg-slate-50/80 rounded-3xl p-5 sm:p-7 border border-blue-200 shadow-md">
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, brand, atau kategori..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
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
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
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

      {/* ── Products List (Master View) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Belum ada data unit yang sesuai filter.
            </div>
          ) : (
            filtered.map((p) => {
              const displayImage =
                p.images && p.images.length > 0 ? p.images[0] : p.thumbnail || null;

              return (
                <div
                  key={p.id}
                  onClick={() => handleOpenDetail(p)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/40 cursor-pointer transition group"
                >
                  {/* Product Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
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

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
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
                        <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition">
                          {p.title || p.name}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-extrabold text-blue-600 text-sm">
                          {formatRupiah(p.price)}
                        </span>
                        <span>•</span>
                        <span>{p.ramRom || (p.storage ? `${p.ram || ""} ${p.storage}` : "-")}</span>
                        <span>•</span>
                        <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {p.grade || p.condition || "Grade A"}
                        </span>
                        {p.batteryHealth !== null && p.batteryHealth !== "" && (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                            <BatteryCharging className="w-3 h-3" /> BH {p.batteryHealth}
                          </span>
                        )}
                        {p.imeiStatus && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {p.imeiStatus}
                          </span>
                        )}
                        {p.branch && (
                          <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                            🏢 {p.branch.name}
                          </span>
                        )}
                      </div>

                      {(p.conditionNotes || p.minusNotes) && (
                        <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{p.conditionNotes || p.minusNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Status Badge Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleStatus(e, p.id, p.status)}
                      disabled={statusUpdatingId === p.id}
                      title={`Status: ${p.status}. Klik untuk ubah cepat.`}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
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

                    {/* Quick Featured Toggle */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleFeatured(e, p.id)}
                      disabled={featuredUpdatingId === p.id}
                      title={p.isFeatured ? "Unit Pilihan Aktif (Klik untuk matikan)" : "Jadikan Unit Pilihan Minggu Ini"}
                      className={`p-2 rounded-lg transition ${
                        featuredUpdatingId === p.id
                          ? "text-slate-300 cursor-wait"
                          : p.isFeatured
                          ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                          : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${p.isFeatured ? "fill-amber-400" : ""}`} />
                    </button>

                    {/* Quick Edit */}
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit Spesifikasi & Galeri"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>

                    {/* Quick Delete */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, p.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus Unit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Chevron to indicate detail drawer clickability */}
                    <div className="text-slate-300 group-hover:text-blue-500 transition pl-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

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
