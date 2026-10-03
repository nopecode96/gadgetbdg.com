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
  Zap,
  Camera,
  Pencil,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toggleProductStatus, deleteProductAction } from "@/lib/actions";
import { ProductForm } from "@/components/admin/ProductForm";

interface Product {
  id: string;
  storeId: string;
  branchId?: string | null;
  name: string;
  title?: string;
  category?: string;
  brand: string;
  price: number;
  grade?: string | null;
  ram?: string | null;
  storage?: string | null;
  ramRom: string;
  batteryHealth: string | number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  conditionNotes?: string | null;
  description?: string | null;
  minusNotes: string | null;
  status: string;
  images: string[];
  clickCount?: number;
  branch?: {
    id: string;
    name: string;
    address: string;
    isMain: boolean;
  } | null;
}

interface BranchItem {
  id: string;
  name: string;
  address?: string;
  isMain?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-600 text-white",
  BOOKED: "bg-amber-500 text-white",
  SOLD: "bg-slate-700 text-white",
};

const STATUS_NEXT: Record<string, "AVAILABLE" | "BOOKED" | "SOLD"> = {
  AVAILABLE: "BOOKED",
  BOOKED: "SOLD",
  SOLD: "AVAILABLE",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Tersedia",
  BOOKED: "Booked",
  SOLD: "Terjual",
};

export function ProductManagerClient({
  store,
  initialProducts,
  branches = [],
  canAddProduct = true,
  maxActiveProducts = Infinity,
  activeProductCount = 0,
}: {
  store?: any;
  initialProducts: Product[];
  branches?: BranchItem[];
  canAddProduct?: boolean;
  maxActiveProducts?: number;
  activeProductCount?: number;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Live active count based on current local state
  const liveActiveCount = products.filter(
    (p) => p.status === "AVAILABLE" || p.status === "BOOKED"
  ).length;
  const quotaMax = maxActiveProducts === Infinity ? null : maxActiveProducts;
  const quotaPercent = quotaMax ? Math.min((liveActiveCount / quotaMax) * 100, 100) : 0;
  const isQuotaFull = quotaMax !== null && liveActiveCount >= quotaMax;

  const filtered = products.filter((p) => {
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchSearch =
      (p.title || p.name).toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleToggleStatus(productId: string, currentStatus: string) {
    const nextStatus = STATUS_NEXT[currentStatus] ?? "AVAILABLE";
    setStatusUpdatingId(productId);
    const res = await toggleProductStatus(productId, nextStatus);
    setStatusUpdatingId(null);

    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, ...(res.product as any) } : item))
      );
    } else {
      alert(res.error || "Gagal memperbarui status unit.");
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Yakin ingin menghapus unit HP ini dari katalog?")) return;
    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert(res.error || "Gagal menghapus unit.");
    }
  }

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
                <span className={isQuotaFull ? "text-red-600" : "text-slate-800"}>
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
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari unit atau brand..."
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

      {/* ── Products List ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Belum ada data unit yang sesuai filter.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                {/* Product Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="relative w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                    {p.images && p.images.length > 0 ? (
                      <>
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        {p.images.length > 1 && (
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

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.brand}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 truncate">{p.name}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-extrabold text-blue-600 text-sm">{formatRupiah(p.price)}</span>
                      <span>•</span>
                      <span>{p.ramRom}</span>
                      <span>•</span>
                      <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
                        {p.grade || p.condition}
                      </span>
                      {p.batteryHealth !== null && p.batteryHealth !== "" && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                          <BatteryCharging className="w-3 h-3" /> BH {p.batteryHealth}
                        </span>
                      )}
                      {p.branch && (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                          🏢 {p.branch.name}
                        </span>
                      )}
                      {p.clickCount && p.clickCount > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 text-[10px]">
                          {p.clickCount}× minat WA
                        </span>
                      ) : null}
                    </div>

                    {(p.conditionNotes || p.minusNotes) && (
                      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{p.conditionNotes || p.minusNotes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Toggle + Edit + Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleToggleStatus(p.id, p.status)}
                    disabled={statusUpdatingId === p.id}
                    title={`Status saat ini: ${STATUS_LABELS[p.status]}. Klik untuk ubah ke ${STATUS_LABELS[STATUS_NEXT[p.status]]}.`}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      statusUpdatingId === p.id
                        ? "bg-slate-200 text-slate-500 cursor-wait"
                        : STATUS_COLORS[p.status] ?? "bg-slate-700 text-white"
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

                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Spesifikasi & Galeri Foto"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Unit dari Katalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
