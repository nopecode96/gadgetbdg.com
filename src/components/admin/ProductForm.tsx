"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  DollarSign,
  Sparkles,
  Smartphone,
  Tablet,
  Headphones,
  Watch,
  Box,
  BatteryCharging,
  HardDrive,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Trash2,
  X,
  Star,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { createProductAction, updateProductAction } from "@/lib/actions";

export interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title?: string | null;
    name?: string | null;
    category?: string | null;
    brand?: string | null;
    price?: number | string | null;
    grade?: string | null;
    ram?: string | null;
    storage?: string | null;
    batteryHealth?: string | number | null;
    completeness?: string | null;
    conditionNotes?: string | null;
    description?: string | null;
    status?: any;
    images?: string[];
    branchId?: string | null;
    imeiStatus?: string | null;
    [key: string]: any;
  };
  branches?: Array<{ id: string; name: string; address?: string }>;
  onSuccess?: () => void;
  onCancel?: () => void;
  redirectOnSuccess?: string;
}

const CATEGORIES = [
  { id: "SMARTPHONE", label: "Smartphone", icon: Smartphone },
  { id: "TABLET", label: "Tablet", icon: Tablet },
  { id: "ACCESSORY", label: "Aksesoris", icon: Headphones },
  { id: "SMARTWATCH", label: "Smartwatch", icon: Watch },
  { id: "OTHER", label: "Lainnya", icon: Box },
];

const BRAND_SUGGESTIONS = [
  "Apple",
  "Samsung",
  "Xiaomi",
  "ASUS ROG",
  "Oppo",
  "Vivo",
  "Infinix",
  "Google Pixel",
];

const GRADE_SUGGESTIONS = [
  "Grade A+ (Mulus Like New)",
  "Grade A (Mulus Standar)",
  "Grade B (Lecet Wajar)",
  "Minus Fisik / Fungsi",
];

const STORAGE_SUGGESTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const RAM_SUGGESTIONS = ["4GB", "6GB", "8GB", "12GB", "16GB", "24GB"];

export function ProductForm({
  mode,
  initialData,
  branches = [],
  onSuccess,
  onCancel,
  redirectOnSuccess = "/admin/products",
}: ProductFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(initialData?.title || initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "SMARTPHONE");
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");

  const [grade, setGrade] = useState(initialData?.grade || "");
  const [ram, setRam] = useState(initialData?.ram || "");
  const [storage, setStorage] = useState(initialData?.storage || "");
  const [batteryHealth, setBatteryHealth] = useState<string>(
    initialData?.batteryHealth !== undefined && initialData?.batteryHealth !== null
      ? String(initialData.batteryHealth)
      : ""
  );
  const [completeness, setCompleteness] = useState(
    initialData?.completeness || "Fullset Original Box & Kabel"
  );
  const [conditionNotes, setConditionNotes] = useState(
    initialData?.conditionNotes || ""
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<"AVAILABLE" | "BOOKED" | "SOLD">(
    initialData?.status || "AVAILABLE"
  );
  const [branchId, setBranchId] = useState(initialData?.branchId || "");
  const [imeiStatus, setImeiStatus] = useState(
    initialData?.imeiStatus || "Resmi Terdaftar"
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(
    Boolean(initialData?.isFeatured)
  );
  const [isReadyCod, setIsReadyCod] = useState<boolean>(
    initialData?.isReadyCod !== undefined ? Boolean(initialData.isReadyCod) : true
  );

  // Gallery multi-images
  const [images, setImages] = useState<string[]>(
    Array.isArray(initialData?.images) ? initialData.images : []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isAccessory = category === "ACCESSORY";

  // Multi-upload handler
  async function handleFileSelect(files: FileList | File[]) {
    setUploadError(null);
    const filesArray = Array.from(files);
    if (filesArray.length === 0) return;

    const remaining = 8 - images.length;
    if (remaining <= 0) {
      setUploadError("Maksimal 8 foto per unit produk.");
      return;
    }

    const filesToUpload = filesArray.slice(0, remaining);
    for (const f of filesToUpload) {
      if (!f.type.startsWith("image/")) {
        setUploadError("Hanya file gambar (JPG, PNG, WebP) yang diizinkan.");
        return;
      }
      if (f.size > 20 * 1024 * 1024) {
        setUploadError(`File ${f.name} melebihi batas 20MB.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const f of filesToUpload) {
        formData.append("files", f);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto.");
      }

      const newUrls: string[] = data.urls || [];
      setImages((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      setUploadError(err.message || "Gagal mengunggah foto ke server.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSetAsCover(idx: number) {
    if (idx === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(idx, 1);
      return [selected, ...copy];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Judul / Nama Barang wajib diisi.");
      return;
    }
    if (!brand.trim()) {
      setFormError("Merk / Brand wajib diisi.");
      return;
    }
    const cleanPrice = parseInt(String(price).replace(/\D/g, ""), 10);
    if (!cleanPrice || isNaN(cleanPrice) || cleanPrice <= 0) {
      setFormError("Harga jual harus berupa nominal angka valid.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        name: title.trim(),
        category,
        brand: brand.trim(),
        price: cleanPrice,
        grade: grade.trim() || null,
        ram: isAccessory ? null : ram.trim() || null,
        storage: isAccessory ? null : storage.trim() || null,
        batteryHealth: isAccessory ? null : batteryHealth.trim() || null,
        completeness: completeness.trim() || null,
        conditionNotes: conditionNotes.trim() || null,
        description: description.trim() || null,
        warrantyBonus: description.trim() || null,
        thumbnail: images.length > 0 ? images[0] : null,
        status,
        branchId: branchId ? branchId : null,
        images,
        imeiStatus: imeiStatus.trim() || null,
        isFeatured,
        isReadyCod,
      };

      let res;
      if (mode === "edit" && initialData?.id) {
        res = await updateProductAction(initialData.id, payload);
      } else {
        res = await createProductAction(payload);
      }

      if (!res.success) {
        setFormError(res.error || "Gagal menyimpan produk.");
        setSubmitting(false);
        return;
      }

      if (onSuccess) {
        onSuccess();
      } else if (redirectOnSuccess) {
        router.push(redirectOnSuccess);
        router.refresh();
      }
    } catch (err: any) {
      setFormError(err.message || "Terjadi kesalahan sistem saat menyimpan produk.");
      setSubmitting(false);
    }
  }

  const numericPrice = parseInt(String(price).replace(/\D/g, ""), 10) || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {mode === "create" ? "Tambah Produk Baru" : "Edit Spesifikasi Produk"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Format fleksibel untuk HP second, tablet, dan aksesoris sentra gadget Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{mode === "create" ? "Publikasikan Unit" : "Simpan Perubahan"}</span>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-semibold">{formError}</div>
        </div>
      )}

      {/* ─── BLOK 1: UNIT & HARGA ─── */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
            1
          </span>
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Blok 1: Unit, Kategori &amp; Harga Jual
          </h2>
        </div>

        {/* Kategori Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Kategori Perangkat
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Judul / Nama Barang */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nama Barang / Judul Unit HP <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: iPhone 13 Pro 256GB Sierra Blue Resmi iBox"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Merk / Brand <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Contoh: Apple, Samsung, Xiaomi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {BRAND_SUGGESTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBrand(b)}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Harga Jual */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Harga Jual (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                Rp
              </span>
              <input
                type="text"
                required
                value={price ? Number(price.replace(/\D/g, "")).toLocaleString("id-ID") : ""}
                onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
                placeholder="18.500.000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {numericPrice > 0 && (
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                Tampilan di toko: {formatRupiah(numericPrice)}
              </p>
            )}
          </div>
        </div>

        {/* Status Stok & Lokasi Cabang */}
        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Status Ketersediaan Unit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["AVAILABLE", "BOOKED", "SOLD"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    status === st
                      ? st === "AVAILABLE"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : st === "BOOKED"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                        : "bg-slate-700 text-white border-slate-700 shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {st === "AVAILABLE" ? "Tersedia" : st === "BOOKED" ? "Di-Booked" : "Terjual (Sold)"}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Flags untuk Home Sections */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>🌟</span> Tampilkan di Unit Pilihan Minggu Ini
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Sorot di slider utama &quot;Unit Pilihan Minggu Ini&quot; pada beranda storefront.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
              <div>
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <span>🛵</span> Tampilkan di Rekomendasi Siap COD Hari Ini
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Tampilkan di grid &quot;Rekomendasi Siap COD Hari Ini&quot; halaman Home.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isReadyCod}
                  onChange={(e) => setIsReadyCod(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {branches.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Lokasi Cabang / Ready Stock di:</span>
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Cabang / Toko Utama</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* ─── BLOK 2: KONDISI & SPESIFIKASI (TEXTBOX BEBAS) ─── */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <span className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">
            2
          </span>
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Blok 2: Kondisi &amp; Spesifikasi Detail (Textbox Bebas)
            </h2>
            <p className="text-[11px] text-slate-500">
              Format bebas sesuai kebiasaan konter BEC/ITC tanpa batas dropdown kaku.
            </p>
          </div>
        </div>

        {/* Grade Kondisi Fisik */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Grade Kondisi Fisik</span>
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {GRADE_SUGGESTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                  grade === g
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="Atau ketik grade kustom (misal: 98% Mulus Like New, ada lecet tipis pemakaian)"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Spesifikasi RAM, Storage, BH (Disembunyikan jika Aksesoris) */}
        {!isAccessory && (
          <div className="grid sm:grid-cols-3 gap-3.5 pt-1">
            {/* RAM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Kapasitas RAM</span>
              </label>
              <input
                type="text"
                value={ram}
                onChange={(e) => setRam(e.target.value)}
                placeholder="misal: 8GB / 12GB"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {RAM_SUGGESTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRam(r)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-indigo-500" />
                <span>Internal Storage (ROM)</span>
              </label>
              <input
                type="text"
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                placeholder="misal: 256GB / 512GB"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {STORAGE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStorage(s)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Battery Health */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />
                <span>Battery Health (BH)</span>
              </label>
              <input
                type="text"
                value={batteryHealth}
                onChange={(e) => setBatteryHealth(e.target.value)}
                placeholder="misal: 88% Original / Awet Seharian"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {["100%", "95%+", "88% Original", "Awet Normal"].map((bh) => (
                  <button
                    key={bh}
                    type="button"
                    onClick={() => setBatteryHealth(bh)}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {bh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Kelengkapan & Legalitas IMEI */}
        <div className="grid sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-purple-500" />
              <span>Kelengkapan Unit</span>
            </label>
            <input
              type="text"
              value={completeness}
              onChange={(e) => setCompleteness(e.target.value)}
              placeholder="misal: Fullset Box Original + Kabel C to C"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                "Fullset Box Original",
                "Unit Only (Batangan)",
                "Fullset Box + Charger OEM",
                "Fullset Lengkap Bawaan Toko",
              ].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setCompleteness(k)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Status Legalitas IMEI</span>
            </label>
            <input
              type="text"
              value={imeiStatus}
              onChange={(e) => setImeiStatus(e.target.value)}
              placeholder="misal: Resmi iBox / Bea Cukai / All Operator"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex flex-wrap gap-1 mt-1.5">
              {[
                "Resmi iBox (Kemenperin Aman)",
                "Resmi SEIN Indonesia",
                "Resmi Kemenperin",
                "WiFi Only",
              ].map((im) => (
                <button
                  key={im}
                  type="button"
                  onClick={() => setImeiStatus(im)}
                  className="px-2 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  {im}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catatan Minus & Kondisi Riil */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1 text-amber-900">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>Catatan Minus &amp; Transparansi Fisik</span>
          </label>
          <textarea
            rows={2}
            value={conditionNotes}
            onChange={(e) => setConditionNotes(e.target.value)}
            placeholder="Tuliskan jika ada minus (misal: Ada dent halus di bezel kanan atas, TrueTone ON, 3uTools hijau semua. Jika mulus tulis: No minus mulus total)"
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Keterangan Tambahan / Garansi Toko */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Keterangan Tambahan / Garansi Toko &amp; Bonus
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Garansi toko 30 hari replace unit. Free pasang tempered glass & bonus softcase premium."
            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* ─── BLOK 3: GALERI MULTI-FOTO ─── */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs">
              3
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                Blok 3: Galeri Multi-Foto Sudut HP
              </h2>
              <p className="text-[11px] text-slate-500">
                Pilih beberapa file foto sekaligus. Foto pertama otomatis jadi sampul utama katalog.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {images.length} / 8 Foto
          </span>
        </div>

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {uploadError}
          </div>
        )}

        {/* Thumbnail Preview Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={url + idx}
              className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-slate-50 transition shadow-xs ${
                idx === 0
                  ? "border-blue-600 ring-2 ring-blue-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={url}
                alt={`Foto unit ${idx + 1}`}
                className="w-full h-full object-contain p-2 transition duration-200 group-hover:scale-105"
              />

              {/* Cover badge / slot indicator */}
              <div className="absolute top-2 left-2 pointer-events-none">
                {idx === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-600 text-white shadow-md">
                    <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                    Sampul Utama
                  </span>
                ) : (
                  <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                    Foto #{idx + 1}
                  </span>
                )}
              </div>

              {/* Action buttons (Delete & Set As Cover) */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetAsCover(idx)}
                    className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 shadow-md"
                    title="Jadikan Sampul Utama"
                  >
                    Sampul
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md"
                  title="Hapus foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Upload trigger slot */}
          {images.length < 8 && (
            <div
              onClick={() => {
                if (!isUploading) fileInputRef.current?.click();
              }}
              className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition select-none"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFileSelect(e.target.files);
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-1 text-blue-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-[10px] font-bold">Mengompres WebP...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-500">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                    <Upload className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 mt-1">
                    + Pilih Foto
                  </span>
                  <span className="text-[9px] text-slate-400">
                    Bisa pilih beberapa sekaligus
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bottom submit action bar */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500 font-medium truncate">
          {title ? (
            <span className="text-slate-800 font-bold truncate">
              {title} • {formatRupiah(numericPrice)}
            </span>
          ) : (
            "Lengkapi rincian formulir produk"
          )}
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{mode === "create" ? "Publikasikan Unit HP" : "Simpan Perubahan"}</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
