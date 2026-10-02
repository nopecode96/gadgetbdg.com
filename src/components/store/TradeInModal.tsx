"use client";

import { useState } from "react";
import { RefreshCw, Send, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { createTradeInOffer } from "@/lib/actions";

interface TradeInModalProps {
  storeId: string;
  storeSlug: string;
  storeName: string;
  storeWhatsapp: string;
  isOpen: boolean;
  onClose: () => void;
  dark?: boolean;
}

export function TradeInModal({
  storeId,
  storeSlug,
  storeName,
  storeWhatsapp,
  isOpen,
  onClose,
  dark = false,
}: TradeInModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("storeId", storeId);
    formData.append("storeSlug", storeSlug);

    const res = await createTradeInOffer(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      const customerName = formData.get("customerName") as string;
      const deviceModel = formData.get("deviceModel") as string;
      const expectedPrice = formData.get("expectedPrice") as string;
      const conditionDesc = formData.get("conditionDesc") as string;
      const minusNotes = formData.get("minusNotes") as string;

      const waMessage = encodeURIComponent(
        `Halo ${storeName}, saya telah mengisi formulir TUKAR TAMBAH via website:\n\n` +
          `• *Nama:* ${customerName}\n` +
          `• *Unit HP Lama:* ${deviceModel}\n` +
          `• *Kondisi:* ${conditionDesc}\n` +
          (minusNotes ? `• *Minus:* ${minusNotes}\n` : "") +
          (expectedPrice ? `• *Ekspektasi Harga:* Rp ${expectedPrice}\n\n` : "\n") +
          `Mohon ditaksir estimasi harga tukar tambahnya ya kak, terima kasih!`
      );

      // Clean WhatsApp target number
      let cleanWa = storeWhatsapp.replace(/\D/g, "");
      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

      // Redirect user to WhatsApp
      setTimeout(() => {
        window.open(`https://wa.me/${cleanWa}?text=${waMessage}`, "_blank");
        onClose();
        setSuccess(false);
      }, 1000);
    } else {
      setError(res.error || "Gagal memproses form tukar tambah.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl transition relative overflow-hidden border ${
          dark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ajukan Tukar Tambah (Trade-In)</h3>
              <p className="text-xs text-slate-400">Taksir instan HP lamamu langsung ke WhatsApp admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-emerald-600">Pengajuan Berhasil Disimpan!</h4>
            <p className="text-xs text-slate-400">
              Mengarahkan Anda langsung ke obrolan WhatsApp {storeName} untuk taksir harga...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Nomor WhatsApp *</label>
                <input
                  type="tel"
                  name="customerWa"
                  required
                  placeholder="Contoh: 081234567890"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Tipe & Varian HP Lama *</label>
                <input
                  type="text"
                  name="deviceModel"
                  required
                  placeholder="Contoh: iPhone 11 128GB Black"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ekspektasi Harga Taksiran (Rp)</label>
                <input
                  type="number"
                  name="expectedPrice"
                  placeholder="Contoh: 4000000"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">Kondisi Fisik & Kelengkapan *</label>
              <input
                type="text"
                name="conditionDesc"
                required
                placeholder="Misal: Fisik 95% pemakaian wajar, fullset box kabel, ex resmi iBox"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Catatan Minus (Jika Ada)</label>
              <textarea
                name="minusNotes"
                rows={2}
                placeholder="Misal: Battery health 78%, ada lecet di pojok bawah, lainnya normal"
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div>
              <label className="block font-medium mb-1">URL Foto Unit (Opsional)</label>
              <input
                type="url"
                name="photoUrl"
                placeholder="https://images.unsplash.com/..."
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  dark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-xl font-medium transition ${
                  dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {loading ? (
                  "Mengirim..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Kirim & Hubungi WA
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
