"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  CheckCheck,
  Search,
  Filter,
  BatteryCharging,
  ShieldCheck,
  Tag,
  AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { toggleProductStatus, createProductAction, deleteProductAction } from "@/lib/actions";

interface Product {
  id: string;
  storeId: string;
  name: string;
  brand: string;
  price: number;
  ramRom: string;
  batteryHealth: number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  minusNotes: string | null;
  status: string;
  images: string[];
}

export function ProductManagerClient({
  store,
  allStores,
  initialProducts,
}: {
  store?: any;
  allStores: any[];
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedStoreId, setSelectedStoreId] = useState(store?.id || "");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  async function handleToggleStatus(productId: string, currentStatus: string) {
    const nextStatus =
      currentStatus === "AVAILABLE" ? "BOOKED" : currentStatus === "BOOKED" ? "SOLD" : "AVAILABLE";

    setStatusUpdatingId(productId);
    const res = await toggleProductStatus(productId, nextStatus as any);
    setStatusUpdatingId(null);

    if (res.success && res.product) {
      setProducts((prev) =>
        prev.map((item) => (item.id === productId ? (res.product as any) : item))
      );
    } else {
      alert("Gagal memperbarui status unit.");
    }
  }

  async function handleDelete(productId: string) {
    if (!confirm("Yakin ingin menghapus unit HP ini dari katalog?")) return;
    const res = await deleteProductAction(productId);
    if (res.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert("Gagal menghapus unit.");
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("storeId", selectedStoreId);

    const res = await createProductAction(formData);
    setLoading(false);

    if (res.success && res.product) {
      setProducts((prev) => [res.product as any, ...prev]);
      setIsFormOpen(false);
      (e.target as HTMLFormElement).reset();
    } else {
      alert(res.error || "Gagal menambahkan unit.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Stok Unit</h1>
          <p className="text-xs text-slate-500 mt-1">
            Update stok, ubah status unit secara realtime, dan kelola listing HP second.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? "Tutup Form" : "Tambah Unit HP Second"}</span>
        </button>
      </div>

      {/* New Product Form Modal/Accordion */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="font-bold text-sm text-slate-900">Form Input Unit HP Bekas</h2>
            <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
              Shared-DB Multi-Tenant
            </span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nama Unit & Varian *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: iPhone 13 128GB Midnight"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Brand *</label>
                <select
                  name="brand"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="POCO">POCO</option>
                  <option value="ASUS ROG">ASUS ROG</option>
                  <option value="iQOO">iQOO</option>
                  <option value="Oppo">Oppo</option>
                  <option value="Vivo">Vivo</option>
                  <option value="Infinix">Infinix</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Harga Jual (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  placeholder="8500000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">RAM / Storage ROM *</label>
                <input
                  type="text"
                  name="ramRom"
                  required
                  placeholder="6GB / 128GB"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Battery Health (%) (Bila Apple)</label>
                <input
                  type="number"
                  name="batteryHealth"
                  placeholder="87"
                  min="50"
                  max="100"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Legalitas IMEI *</label>
                <select
                  name="imeiStatus"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Resmi iBox / Kemenperin Aman">Resmi iBox / Kemenperin Aman</option>
                  <option value="Resmi SEIN / Resmi Indonesia">Resmi SEIN / Resmi Indonesia</option>
                  <option value="Bea Cukai Faktur Lengkap">Bea Cukai Faktur Lengkap</option>
                  <option value="All Operator Terdaftar">All Operator Terdaftar</option>
                  <option value="Smartfren Only">Smartfren Only</option>
                  <option value="WiFi Only">WiFi Only</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kelengkapan Paket *</label>
                <input
                  type="text"
                  name="completeness"
                  required
                  placeholder="Fullset Box + Kabel Original / Batangan Unit Only"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kondisi Fisik *</label>
                <input
                  type="text"
                  name="condition"
                  required
                  placeholder="98% Mulus Like New / 92% Pemakaian Wajar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Catatan Minus / Riwayat Part</label>
                <input
                  type="text"
                  name="minusNotes"
                  placeholder="Contoh: No minus mulus total / Layar pernah ganti ori"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">URL Foto Unit</label>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Publikasikan ke Katalog"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari unit atau brand..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(["ALL", "AVAILABLE", "BOOKED", "SOLD"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "ALL"
                ? `Semua (${products.length})`
                : status === "AVAILABLE"
                ? `Tersedia (${products.filter((p) => p.status === "AVAILABLE").length})`
                : status === "BOOKED"
                ? `Booked (${products.filter((p) => p.status === "BOOKED").length})`
                : `Terjual (${products.filter((p) => p.status === "SOLD").length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table / Cards */}
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
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0 overflow-hidden relative border border-slate-200">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
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
                      <span>{p.condition}</span>
                      {p.batteryHealth !== null && (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                          <BatteryCharging className="w-3 h-3" /> BH {p.batteryHealth}%
                        </span>
                      )}
                    </div>

                    {p.minusNotes && (
                      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{p.minusNotes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Toggle Status & Actions */}
                <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => handleToggleStatus(p.id, p.status)}
                      disabled={statusUpdatingId === p.id}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        p.status === "AVAILABLE"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : p.status === "BOOKED"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-700 text-white shadow-sm"
                      }`}
                      title="Klik untuk toggle status [Tersedia ➔ Booked ➔ Terjual]"
                    >
                      {statusUpdatingId === p.id ? (
                        "Updating..."
                      ) : p.status === "AVAILABLE" ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Tersedia
                        </>
                      ) : p.status === "BOOKED" ? (
                        <>
                          <Clock className="w-3.5 h-3.5" /> Booked
                        </>
                      ) : (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" /> Terjual
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Unit"
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
