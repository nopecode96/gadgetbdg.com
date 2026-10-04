"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw } from "lucide-react";

interface ImageUploadProps {
  name: string;
  value?: string | null;
  onChange?: (url: string | null) => void;
  aspectRatio?: "16:9" | "1:1";
  label?: string;
  description?: string;
  disabled?: boolean;
  uploadType?: "store-profile" | "branch-profile" | "store-logo";
}

export function ImageUpload({
  name,
  value,
  onChange,
  aspectRatio = "16:9",
  label,
  description,
  disabled = false,
  uploadType = "store-profile",
}: ImageUploadProps) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileSelect(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Hanya format file gambar (JPG, PNG, WebP) yang diperbolehkan.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file maksimal 5MB.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", uploadType);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal mengunggah foto.");
      }

      const uploadedUrl = data.url;
      setCurrentUrl(uploadedUrl);
      if (onChange) {
        onChange(uploadedUrl);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message || "Gagal mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    setCurrentUrl(null);
    if (onChange) {
      onChange(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const isSquare = aspectRatio === "1:1";

  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-medium text-slate-700 text-xs">
          {label}
        </label>
      )}

      {/* Hidden input to pass value to traditional form submit */}
      <input type="hidden" name={name} value={currentUrl || ""} />

      <div
        className={`relative border-2 border-dashed rounded-2xl overflow-hidden transition ${
          currentUrl
            ? "border-slate-200 bg-slate-900"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100/80"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"} ${
          isSquare ? "aspect-square max-w-[180px]" : "aspect-16/9 w-full"
        }`}
        onClick={() => {
          if (!disabled && !isUploading) {
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        {currentUrl ? (
          <div className="relative w-full h-full group">
            <img
              src={currentUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled || isUploading}
                className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti Foto</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled || isUploading}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="text-xs font-semibold">Mengunggah gambar...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center text-slate-500 border border-slate-200">
                  {isSquare ? (
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <UploadCloud className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-700">
                    Klik atau Tarik Foto ke Sini
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {isSquare ? "Rasio 1:1 (PNG, JPG, WebP maks 5MB)" : "Rasio 16:9 HD (PNG, JPG, WebP maks 5MB)"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
    </div>
  );
}
