"use client";

import React, { useState } from "react";
import { RefreshCw, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { StoreData } from "./types";
import { submitTradeInOfferAction } from "@/lib/actions/tradein-actions";
import { getTemplateConfig } from "@/lib/constants/templates";

interface StoreTradeInViewProps {
  store: StoreData;
  theme?: string;
}

export function StoreTradeInView({ store, theme }: StoreTradeInViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("storeId", store.id);

    const res = await submitTradeInOfferAction(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      if (res.whatsappUrl) {
        setTimeout(() => {
          window.open(res.whatsappUrl, "_blank");
        }, 800);
      }
    } else {
      setError(res.error || "Gagal memproses form penawaran tukar tambah.");
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs">
      {/* Header Banner */}
      <div
        className={`rounded-2xl p-4 border text-center space-y-1.5 ${colors.heroGradient} ${colors.heroBorder}`}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center mx-auto backdrop-blur-sm">
          <RefreshCw className="w-5 h-5" />
        </div>
        <h2 className="font-extrabold text-base text-white">Formulir Tukar Tambah / Jual HP</h2>
        <p className="text-xs text-white/90">
          Taksir HP bekasmu dengan harga tertinggi se-Bandung. COD toko atau kurir jemput unit.
        </p>
      </div>

      {success ? (
        <div
          className={`rounded-2xl p-8 text-center space-y-3 border ${colors.cardBg} ${colors.cardBorder} shadow-sm`}
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="font-bold text-base text-emerald-600">Penawaran Berhasil Dicatat!</h3>
          <p className={`text-xs ${colors.textSecondary}`}>
            Membuka obrolan WhatsApp resmi {store.name} untuk negosiasi harga dan jadwal pengecekan unit...
          </p>
          <button
            onClick={() => setSuccess(false)}
            className={`mt-4 px-4 py-2 rounded-xl text-xs font-bold ${
              isDark ? "bg-slate-800 text-slate-200" : "bg-neutral-100 text-neutral-800"
            }`}
          >
            Ajukan HP Lain
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl p-5 border space-y-3.5 ${colors.cardBg} ${colors.cardBorder} shadow-sm ${colors.textPrimary}`}
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Device Model & RAM/Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Merk & Tipe HP Lama *</label>
              <input
                type="text"
                name="deviceModel"
                required
                placeholder="Contoh: iPhone 11 / Samsung S21"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Varian RAM & Internal Storage *</label>
              <select
                name="ramStorage"
                required
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              >
                <option value="4GB / 64GB">4GB / 64GB</option>
                <option value="4GB / 128GB">4GB / 128GB</option>
                <option value="6GB / 128GB">6GB / 128GB</option>
                <option value="8GB / 128GB">8GB / 128GB</option>
                <option value="8GB / 256GB">8GB / 256GB</option>
                <option value="12GB / 256GB">12GB / 256GB</option>
                <option value="12GB / 512GB">12GB / 512GB</option>
                <option value="16GB / 512GB">16GB / 512GB</option>
                <option value="Lainnya">Varian Lainnya</option>
              </select>
            </div>
          </div>

          {/* Condition & Completeness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Kondisi Fisik *</label>
              <select
                name="conditionDesc"
                required
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              >
                <option value="Mulus Like New (98-99%)">Mulus Like New (98-99%)</option>
                <option value="Pemakaian Wajar / Dent Tipis (90-95%)">Pemakaian Wajar / Dent Tipis (90-95%)</option>
                <option value="Ada Jamur / Lecet Bezel (85-90%)">Ada Jamur / Lecet Bezel (85-90%)</option>
                <option value="Layar Retak / Minus Fungsi">Layar Retak / Minus Fungsi</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">Kelengkapan Paket *</label>
              <select
                name="completeness"
                required
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              >
                <option value="Fullset Original (Box + Kabel Bawaan)">Fullset Original (Box + Kabel Bawaan)</option>
                <option value="Fullset OEM (Box Bukan Bawaan)">Fullset OEM (Box Bukan Bawaan)</option>
                <option value="Batangan / HP Saja (Unit Only)">Batangan / HP Saja (Unit Only)</option>
              </select>
            </div>
          </div>

          {/* Minus notes & Expected price */}
          <div>
            <label className="block font-bold mb-1">Catatan Minus / Riwayat Servis (Jika Ada)</label>
            <textarea
              name="minusNotes"
              rows={2}
              placeholder="Contoh: Battery Health 78%, TrueTone off, kamera normal, layar original"
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
              }`}
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Ekspektasi Harga Taksiran (Rp)</label>
            <input
              type="number"
              name="expectedPrice"
              placeholder="Contoh: 3500000"
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                  : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
              }`}
            />
          </div>

          {/* Contact details */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t ${colors.cardBorder}`}>
            <div>
              <label className="block font-bold mb-1">Nama Lengkap Anda *</label>
              <input
                type="text"
                name="customerName"
                required
                placeholder="Nama Anda"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Nomor WhatsApp Anda *</label>
              <input
                type="tel"
                name="customerWa"
                required
                placeholder="081234567890"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white focus:ring-emerald-500"
                    : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-blue-500"
                }`}
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50 ${
                isDark
                  ? `${colors.accent} ${colors.accentHover} text-slate-950`
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              }`}
            >
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <Send className="w-4 h-4" /> Kirim Penawaran ke WhatsApp Toko
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
