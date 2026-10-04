"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  CheckCheck,
  BatteryCharging,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  PackageCheck,
  Calendar,
  Layers,
  Building2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductStatusAction, deleteProductAction } from "@/lib/actions/product-actions";

export interface ProductDetailItem {
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
  ramRom?: string;
  batteryHealth?: string | number | null;
  imeiStatus?: string | null;
  completeness?: string | null;
  condition?: string;
  conditionNotes?: string | null;
  minusNotes?: string | null;
  description?: string | null;
  warrantyBonus?: string | null;
  status: "AVAILABLE" | "BOOKED" | "SOLD" | string;
  images: string[];
  thumbnail?: string | null;
  clickCount?: number;
  createdAt?: string;
  updatedAt?: string;
  branch?: {
    id: string;
    name: string;
    address?: string;
    isMain?: boolean;
  } | null;
  [key: string]: any;
}

interface ProductDetailDrawerProps {
  product: ProductDetailItem | null;
  isOpen: boolean;
  onClose: () => void;
  storeSlug?: string;
  branches?: Array<{ id: string; name: string; address?: string }>;
  onProductUpdated?: (updatedProduct: ProductDetailItem) => void;
  onProductDeleted?: (deletedProductId: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  AVAILABLE: {
    label: "Tersedia",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle,
  },
  BOOKED: {
    label: "Di-Booked",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  SOLD: {
    label: "Terjual",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    icon: CheckCheck,
  },
};

export function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  storeSlug = "",
  branches = [],
  onProductUpdated,
  onProductDeleted,
}: ProductDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset internal states when switching products or closing
  useEffect(() => {
    setIsEditing(false);
    setSelectedImageIndex(0);
    setErrorMessage(null);
  }, [product?.id, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isEditing, onClose]);

  if (!isOpen || !product) return null;

  const currentStatusConfig = STATUS_CONFIG[product.status] || STATUS_CONFIG.AVAILABLE;
  const productImages = product.images && product.images.length > 0 ? product.images : [];
  const publicStoreUrl = storeSlug
    ? `/${storeSlug}/product/${product.id}`
    : `/product/${product.id}`;

  // Instant status toggle
  const handleQuickStatusChange = async (newStatus: "AVAILABLE" | "BOOKED" | "SOLD") => {
    if (product.status === newStatus || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    setErrorMessage(null);

    try {
      const res = await updateProductStatusAction(product.id, newStatus);
      if (res.success && res.product) {
        onProductUpdated?.({
          ...product,
          ...res.product,
          status: newStatus,
        });
      } else {
        setErrorMessage(res.error || "Gagal memperbarui status unit.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memperbarui status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Safe delete handler
  const handleDeleteUnit = async () => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus unit "${product.title || product.name}" secara permanen dari katalog toko?`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteProductAction(product.id);
      if (res.success) {
        onProductDeleted?.(product.id);
        onClose();
      } else {
        setErrorMessage(res.error || "Gagal menghapus unit.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat menghapus.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none sm:select-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between transform transition-all duration-300 ease-in-out border-l border-slate-200">
          {/* ── Top Header ── */}
          <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[11px] font-black tracking-wider uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                {product.category || "Smartphone"}
              </span>
              <span className="text-xs font-semibold text-slate-500 truncate">
                Brand: <strong className="text-slate-800">{product.brand}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                >
                  Kembali ke Detail
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                aria-label="Tutup Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Error Banner if any ── */}
          {errorMessage && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── Scrollable Body: Preview or Edit Mode ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {isEditing ? (
              /* ── IN-PLACE EDIT FORM ── */
              <div className="pb-4">
                <ProductForm
                  mode="edit"
                  initialData={product}
                  branches={branches}
                  onSuccess={() => {
                    setIsEditing(false);
                    // trigger notification or reload
                    window.location.reload();
                  }}
                  onCancel={() => setIsEditing(false)}
                />
              </div>
            ) : (
              /* ── COMPREHENSIVE DETAIL PREVIEW ── */
              <>
                {/* Title & Price */}
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                    {product.title || product.name}
                  </h2>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-blue-600 tracking-tight">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-xs text-slate-400">Harga Nett / Jual</span>
                  </div>
                </div>

                {/* Quick Status Toggle Buttons */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Ubah Status Ketersediaan:
                    </span>
                    {isUpdatingStatus && (
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["AVAILABLE", "BOOKED", "SOLD"] as const).map((st) => {
                      const cfg = STATUS_CONFIG[st];
                      const Icon = cfg.icon;
                      const isActive = product.status === st;

                      return (
                        <button
                          key={st}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleQuickStatusChange(st)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                            isActive
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ring-blue-500/20 shadow-xs font-black`
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Photo Gallery & Thumbnail Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      Galeri Foto Unit ({productImages.length})
                    </span>
                    {productImages.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Foto {selectedImageIndex + 1} dari {productImages.length}
                      </span>
                    )}
                  </div>

                  {productImages.length > 0 ? (
                    <div className="space-y-2.5">
                      {/* Main Large Display */}
                      <div className="relative aspect-4/3 w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <img
                          src={productImages[selectedImageIndex] || productImages[0]}
                          alt={product.title || product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Thumbnails Row */}
                      {productImages.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                          {productImages.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedImageIndex(idx)}
                              className={`relative w-14 h-14 rounded-xl shrink-0 overflow-hidden border-2 transition ${
                                selectedImageIndex === idx
                                  ? "border-blue-600 ring-2 ring-blue-600/20"
                                  : "border-slate-200 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-16/9 w-full rounded-2xl bg-slate-100 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                      <ImageIcon className="w-8 h-8 stroke-1 text-slate-300" />
                      <span>Belum ada foto yang diunggah untuk unit ini</span>
                    </div>
                  )}
                </div>

                {/* Grid Spesifikasi Teknis */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Spesifikasi & Kondisi Unit
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Grade Fisik */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        Grade Fisik
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {product.grade || product.condition || "Grade A (Mulus)"}
                      </div>
                    </div>

                    {/* Battery Health */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <BatteryCharging className="w-3 h-3 text-emerald-600" />
                        Battery Health (BH)
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {product.batteryHealth
                          ? String(product.batteryHealth).includes("%")
                            ? product.batteryHealth
                            : `${product.batteryHealth}%`
                          : "100% / Normal"}
                      </div>
                    </div>

                    {/* RAM & Storage */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-600" />
                        RAM / Internal
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {product.ramRom ||
                          (product.ram && product.storage
                            ? `${product.ram} / ${product.storage}`
                            : product.storage || "-")}
                      </div>
                    </div>

                    {/* Status IMEI */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        Status IMEI
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {product.imeiStatus || "Resmi Terdaftar"}
                      </div>
                    </div>

                    {/* Kelengkapan */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <PackageCheck className="w-3 h-3 text-teal-600" />
                        Kelengkapan Unit
                      </div>
                      <div className="font-bold text-slate-800 mt-1">
                        {product.completeness || "Fullset Original Box & Aksesoris"}
                      </div>
                    </div>

                    {/* Lokasi Cabang / Branch */}
                    {product.branch && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                        <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-600" />
                          Lokasi Cabang Toko
                        </div>
                        <div className="font-bold text-slate-800 mt-1 flex items-center justify-between">
                          <span>{product.branch.name}</span>
                          {product.branch.address && (
                            <span className="text-[11px] font-normal text-slate-500 truncate max-w-[200px]">
                              {product.branch.address}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catatan Minus & Transparansi Fisik */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Catatan Transparansi / Minus
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 leading-relaxed font-medium">
                    {product.conditionNotes ||
                    product.minusNotes ||
                    "Tidak ada catatan minus fisik/fungsi. Unit mulus normal no minus."}
                  </div>
                </div>

                {/* Garansi Toko & Bonus */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Garansi Toko & Paket Bonus
                  </h3>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed font-medium">
                    {product.warrantyBonus ||
                    product.description ||
                    "Garansi toko 7 hari fungsional ganti unit + Bonus case & tempered glass."}
                  </div>
                </div>

                {/* Metadata & Minat WA */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Ditambahkan: {product.createdAt ? new Date(product.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                  </span>
                  <span>
                    Minat Pembeli WA:{" "}
                    <strong className="text-slate-700">{product.clickCount || 0} kali</strong>
                  </span>
                </div>
              </>
            )}
          </div>

          {/* ── Fixed Footer Action Bar ── */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
            {!isEditing ? (
              <>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit Spesifikasi</span>
                  </button>

                  <a
                    href={publicStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 transition shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Lihat di Web Toko</span>
                    <span className="sm:hidden">Web</span>
                  </a>
                </div>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteUnit}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold text-xs px-3 py-2 rounded-xl transition"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Hapus Unit</span>
                </button>
              </>
            ) : (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  Tutup Mode Edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
