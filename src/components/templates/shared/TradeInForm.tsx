"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ArrowRight,
  User,
  Phone,
} from "lucide-react";
import { StoreData, ProductData } from "./types";
import { submitTradeInLeadAction } from "@/lib/actions/tradein-actions";
import { getTemplateConfig } from "@/lib/constants/templates";
import { formatRupiah } from "@/lib/utils";

interface TradeInFormProps {
  store: StoreData;
  availableProducts?: ProductData[];
  theme?: string;
  isMockup?: boolean;
}

export function TradeInForm({
  store,
  availableProducts = [],
  theme,
  isMockup = false,
}: TradeInFormProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  // 1. Transaction Type Toggle: TRADE_IN vs SELL_ONLY
  const [type, setType] = useState<"TRADE_IN" | "SELL_ONLY">("TRADE_IN");

  // 2. Customer Contact
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // 3. Old Phone Details
  const [deviceModel, setDeviceModel] = useState("");
  const [condition, setCondition] = useState<"LIKE_NEW" | "NORMAL" | "MINUS">("LIKE_NEW");
  const [completeness, setCompleteness] = useState<"FULLSET" | "UNIT_ONLY">("FULLSET");
  const [notes, setNotes] = useState("");

  // 4. Pricing Expectation
  const [pricingType, setPricingType] = useState<"APPRAISAL_REQUEST" | "EXPECTED_PRICE">(
    "APPRAISAL_REQUEST"
  );
  const [expectedPrice, setExpectedPrice] = useState("");

  // 5. Target Unit (If Trade-In)
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Form Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState<string | null>(null);

  // Available in-stock products
  const activeProducts = availableProducts.filter(
    (p) => p.status === "AVAILABLE" || p.status === "BOOKED"
  );

  const selectedTargetProduct = activeProducts.find((p) => p.id === selectedProductId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError("Nama lengkap / panggilan wajib diisi.");
      return;
    }
    if (!customerPhone.trim()) {
      setError("Nomor WhatsApp aktif wajib diisi.");
      return;
    }
    if (!deviceModel.trim()) {
      setError("Tipe HP lama wajib diisi (contoh: iPhone 12 128GB).");
      return;
    }

    if (isMockup) {
      setSuccess(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        storeId: store.id,
        type,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deviceModel: deviceModel.trim(),
        condition,
        completeness,
        notes: notes.trim() || undefined,
        pricingType,
        expectedPrice:
          pricingType === "EXPECTED_PRICE" && expectedPrice
            ? parseInt(expectedPrice.replace(/\D/g, ""), 10)
            : null,
        targetProductId: type === "TRADE_IN" && selectedProductId ? selectedProductId : null,
        targetProductTitle:
          type === "TRADE_IN" && selectedProductId
            ? selectedTargetProduct?.title || selectedTargetProduct?.name || null
            : null,
      };

      const res = await submitTradeInLeadAction(payload);
      setLoading(false);

      if (res.success) {
        setSuccess(true);
        if (res.whatsappUrl) {
          setWhatsappRedirectUrl(res.whatsappUrl);
          // Auto redirect smoothly to WhatsApp
          setTimeout(() => {
            window.open(res.whatsappUrl, "_blank");
          }, 800);
        }
      } else {
        setError(res.error || "Gagal mengirimkan formulir.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Terjadi kesalahan sistem saat mengirim data.");
    }
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs font-sans pb-12">
      {/* ── HEADER BANNER ── */}
      <div
        className={`rounded-3xl p-5 border text-center space-y-2 shadow-md ${colors.heroGradient} ${colors.heroBorder}`}
      >
        <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center mx-auto backdrop-blur-xs shadow-inner">
          <RefreshCw className="w-5 h-5 animate-spin-slow" />
        </div>
        <h2 className="font-black text-base text-white tracking-tight">
          Tukar Tambah &amp; Jual HP Langsung
        </h2>
        <p className="text-xs text-white/90 max-w-sm mx-auto leading-relaxed">
          Taksir cepat tanpa ribet upload foto! Langsung terhubung ke WhatsApp kasir{" "}
          <strong className="text-white">{store.name}</strong> dengan penawaran harga tertinggi.
        </p>
      </div>

      {success ? (
        <div
          className={`rounded-3xl p-8 text-center space-y-3.5 border ${colors.cardBg} ${colors.cardBorder} shadow-lg`}
        >
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
          <h3 className="font-black text-base text-emerald-600">
            Penawaran Anda Berhasil Dicatat!
          </h3>
          <p className={`text-xs ${colors.textSecondary} max-w-xs mx-auto leading-relaxed`}>
            Data pengajuan telah masuk ke sistem kasir {store.name}. Chat WhatsApp toko sedang dibuka otomatis...
          </p>

          {whatsappRedirectUrl && (
            <a
              href={whatsappRedirectUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Buka Chat WhatsApp Sekarang</span>
            </a>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                setDeviceModel("");
                setNotes("");
                setExpectedPrice("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${
                isDark ? "bg-slate-800 text-slate-200" : "bg-neutral-100 text-neutral-800"
              }`}
            >
              Ajukan Unit Lainnya
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`rounded-3xl p-5 sm:p-6 border space-y-5 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
        >
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── 1. TYPE SELECTOR: Tukar Tambah vs Jual Saja ── */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
              Pilih Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setType("TRADE_IN")}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
                  type === "TRADE_IN"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tukar Tambah</span>
              </button>

              <button
                type="button"
                onClick={() => setType("SELL_ONLY")}
                className={`py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
                  type === "SELL_ONLY"
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Jual HP Saja</span>
              </button>
            </div>
          </div>

          {/* ── 2. TARGET UNIT (Jika Tukar Tambah) ── */}
          {type === "TRADE_IN" && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-slate-900/50 border border-blue-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900 dark:text-blue-300">
                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                <span>Mau Tukar Tambah ke Unit Apa?</span>
              </div>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Belum Tahu / Mau Konsultasi Rekomendasi Dulu --</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.name} — {formatRupiah(p.price)}
                  </option>
                ))}
              </select>
              {selectedTargetProduct && (
                <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold">
                  Unit terpilih: {selectedTargetProduct.title || selectedTargetProduct.name} (Harga: {formatRupiah(selectedTargetProduct.price)})
                </p>
              )}
            </div>
          )}

          {/* ── 3. DATA KONTAK PELANGGAN ── */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Kontak Anda</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Anda *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* ── 4. SPESIFIKASI HP LAMA ── */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
              <span>Rincian HP Lama yang Ditaksir</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe &amp; Memori HP Lama *
              </label>
              <input
                type="text"
                required
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="Contoh: iPhone 12 128GB Black / Samsung S21 256GB"
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Kondisi & Kelengkapan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kondisi Fisik
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LIKE_NEW">Mulus Like New (99%)</option>
                  <option value="NORMAL">Normal Pemakaian Wajar (95-98%)</option>
                  <option value="MINUS">Ada Minus Fisik / Fungsi</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelengkapan
                </label>
                <select
                  value={completeness}
                  onChange={(e) => setCompleteness(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FULLSET">Fullset Box Original</option>
                  <option value="UNIT_ONLY">Unit Only (Batangan)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Kejujuran Minus / Battery Health (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: BH 85%, TrueTone aktif, layar mulus no shadow..."
                className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* ── 5. EKSPEKTASI HARGA ── */}
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-black text-xs text-slate-900 dark:text-white">
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
              <span>Ekspektasi Taksiran Harga</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="pricingType"
                  checked={pricingType === "APPRAISAL_REQUEST"}
                  onChange={() => setPricingType("APPRAISAL_REQUEST")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Minta Estimasi Taksiran Tertinggi Admin</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="radio"
                  name="pricingType"
                  checked={pricingType === "EXPECTED_PRICE"}
                  onChange={() => setPricingType("EXPECTED_PRICE")}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Saya Punya Target Harga Sendiri</span>
              </label>

              {pricingType === "EXPECTED_PRICE" && (
                <div className="pl-6 pt-1">
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    placeholder="Contoh: 4500000"
                    className="w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {expectedPrice && !isNaN(Number(expectedPrice)) && (
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1">
                      Nominal: {formatRupiah(Number(expectedPrice))}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── SUBMIT BUTTON ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>
              {loading ? "Menyimpan & Menyiapkan WA..." : "Ajukan Taksiran & Chat WhatsApp Sekarang"}
            </span>
          </button>
        </form>
      )}
    </div>
  );
}
