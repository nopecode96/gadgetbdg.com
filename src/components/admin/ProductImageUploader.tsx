"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Sparkles, ShieldCheck } from "lucide-react";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
  isWatermarked?: boolean;
}

const PHOTO_SLOT_LABELS = [
  "Foto Utama (Tampak Depan)",
  "Tampak Belakang",
  "Samping & Bezel",
  "Layar Hidup / Battery Health",
  "Kelengkapan Box / Aksesoris",
];

export function ProductImageUploader({
  images,
  onChange,
  maxFiles = 5,
  isWatermarked = true,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
    const filesArray = Array.from(selectedFiles);

    if (filesArray.length === 0) return;

    // Hitung sisa kuota foto
    const remainingSlots = maxFiles - images.length;
    if (remainingSlots <= 0) {
      setErrorMessage(`Maksimal ${maxFiles} foto per unit produk.`);
      return;
    }

    const filesToUpload = filesArray.slice(0, remainingSlots);

    // Validasi client-side: tipe & ukuran (maks 20 MB)
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Format file harus berupa gambar (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" melebihi batas ukuran maksimal 20 MB.`);
        return;
      }
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (const file of filesToUpload) {
        formData.append("files", file);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }

      const newUrls: string[] = data.urls || [];
      onChange([...images, ...newUrls]);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Gagal mengunggah gambar ke server.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Galeri Foto Fisik Unit (Maks {maxFiles} Foto)</span>
        </label>
        <div className="flex items-center gap-2">
          {isWatermarked && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Auto Watermark Fisik
            </span>
          )}
          <span className="text-[11px] font-medium text-slate-400">
            {images.length} / {maxFiles}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
          {errorMessage}
        </div>
      )}

      {/* Grid Thumbnail Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm"
          >
            <img
              src={url}
              alt={`Foto Unit ${idx + 1}`}
              className="w-full h-full object-cover transition group-hover:scale-105 duration-200"
            />
            {/* Slot Label Badge */}
            <div className="absolute top-1.5 left-1.5 right-1.5 pointer-events-none">
              <span className="inline-block max-w-full truncate text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-sm">
                {PHOTO_SLOT_LABELS[idx] || `Foto ${idx + 1}`}
              </span>
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-700"
              title="Hapus foto ini"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Upload Box Slot (jika belum mencapai batas kuota) */}
        {images.length < maxFiles && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files) {
                handleFileSelect(e.dataTransfer.files);
              }
            }}
            onClick={() => {
              if (!isUploading) {
                fileInputRef.current?.click();
              }
            }}
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition select-none ${
              dragOver
                ? "border-blue-500 bg-blue-50/70"
                : "border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(e.target.files);
                }
              }}
            />

            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-1.5 text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-[10px] font-semibold">Memproses WebP...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5 text-slate-500">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-[11px] font-bold text-slate-700 leading-tight">
                  + Upload Foto
                </div>
                <div className="text-[9px] text-slate-400 leading-tight">
                  {PHOTO_SLOT_LABELS[images.length] || "Pilih foto"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          Kompresi instan WebP (kualitas 82) untuk kecepatan loading PWA maksimal
        </span>
        <span>Format: JPG, PNG, WebP (Maks 20MB)</span>
      </div>
    </div>
  );
}
