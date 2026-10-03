"use client";

import React, { useState, useId } from "react";
import {
  X,
  MessageCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  BadgePercent,
  Layers,
  Send,
} from "lucide-react";
import { StoreData, ProductData } from "../templates/shared/types";
import { formatRupiah } from "@/lib/utils";
import { submitTradeInOfferAction } from "@/lib/actions/tradein-actions";

export interface TradeInModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: StoreData;
  products?: ProductData[];
  initialTargetProduct?: ProductData | null;
  theme?: "minimal-clean" | "dark-gaming" | "keynote-obsidian" | "tokyo-street" | "cyber-hud" | "midnight-gold";
  isDark?: boolean;
}

export function TradeInModal({
  isOpen,
  onClose,
  store,
  products = [],
  initialTargetProduct = null,
  theme = "minimal-clean",
  isDark = false,
}: TradeInModalProps) {
  // Form fields
  const [submissionType, setSubmissionType] = useState<"TRADE_IN" | "SELL_ONLY">("TRADE_IN");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [condition, setCondition] = useState("Mulus 95-99%");
  const [completeness, setCompleteness] = useState("Fullset Dus Original");
  const [minusNotes, setMinusNotes] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialTargetProduct?.id || ""
  );
  const [customTargetDevice, setCustomTargetDevice] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerWa, setCustomerWa] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isDarkEffective =
    isDark ||
    theme === "dark-gaming" ||
    theme === "keynote-obsidian" ||
    theme === "tokyo-street" ||
    theme === "cyber-hud" ||
    theme === "midnight-gold";

  const brandOptions = ["Apple", "Samsung", "Xiaomi", "Oppo", "Vivo", "Lainnya"];

  const conditionOptions = [
    "Mulus 95-99%",
    "Lecet Pemakaian Normal",
    "Ada Minus/Lecet Parah",
  ];

  const completenessOptions = [
    "Fullset Dus Original",
    "Fullset OEM",
    "Batangan / Unit Only",
  ];

  const availableStoreProducts = products.filter(
    (p) => p.status === "AVAILABLE" || !p.status
  );

  const selectedStoreProduct = availableStoreProducts.find(
    (p) => p.id === selectedProductId
  );

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      alert("Silakan masukkan seri / tipe lengkap HP lama Anda.");
      return;
    }

    setIsSubmitting(true);

    let cleanWa = (store.whatsapp || "628123456789").replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

    const targetDeviceText =
      submissionType === "TRADE_IN"
        ? selectedStoreProduct
          ? `${selectedStoreProduct.name} (${formatRupiah(selectedStoreProduct.price)})`
          : customTargetDevice.trim()
          ? customTargetDevice.trim()
          : "Belum menentukan (Ingin konsultasi unit)"
        : "Jual Putus ke Toko (Tanpa Tukar Unit)";

    const fullModelName = brand === "Lainnya" ? model.trim() : `${brand} ${model.trim()}`;

    const draftMessage = `Halo *${store.name}*, saya mau konsultasi *${
      submissionType === "TRADE_IN" ? "TUKAR TAMBAH HP" : "JUAL PUTUS HP BEKAS"
    }*:

📱 *Data HP Saya:*
• Tipe: ${fullModelName}
• Kondisi Fisik: ${condition}
• Kelengkapan: ${completeness}
• Catatan Minus: ${minusNotes.trim() ? minusNotes.trim() : "Tidak ada minus (Normal)"}

🎯 *Target Tukar Tambah:* ${targetDeviceText}
👤 *Nama:* ${customerName.trim() || "Calon Pelanggan"}${customerWa.trim() ? ` (${customerWa.trim()})` : ""}

Mohon info estimasi taksiran harga dan ketersediaan unitnya. Terima kasih!`;

    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(draftMessage)}`;

    // Also persist lead to DB via server action if possible
    try {
      const formData = new FormData();
      formData.append("storeId", store.id);
      formData.append("customerName", customerName.trim() || "Calon Pelanggan WhatsApp");
      formData.append("customerWa", customerWa.trim() || cleanWa);
      formData.append("phoneModel", fullModelName);
      formData.append("condition", condition);
      formData.append("completeness", completeness);
      formData.append("minusNotes", minusNotes.trim());
      formData.append("expectedPrice", targetDeviceText);

      await submitTradeInOfferAction(formData);
    } catch (err) {
      console.error("Trade-in lead submission logged:", err);
    }

    setIsSubmitting(false);
    setSubmitted(true);

    // Launch WhatsApp
    window.open(waUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop Click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Content */}
      <div
        className={`relative z-10 w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-[32px] sm:rounded-3xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkEffective
            ? "bg-[#0b101b] border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* ── HEADER ── */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
            isDarkEffective ? "border-slate-800/80 bg-slate-900/60" : "border-slate-100 bg-slate-50/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                isDarkEffective
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                Tukar Tambah &amp; Jual HP
              </h2>
              <p
                className={`text-[11px] font-medium leading-none mt-0.5 ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Taksiran transparan langsung via WhatsApp {store.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              isDarkEffective
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* ── SCROLLABLE FORM BODY ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
          {/* 1. Tipe Pengajuan Switcher */}
          <div className="space-y-1.5">
            <label
              className={`text-[11px] font-black uppercase tracking-wider block ${
                isDarkEffective ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Tipe Pengajuan
            </label>
            <div
              className={`grid grid-cols-2 p-1 rounded-2xl border ${
                isDarkEffective ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setSubmissionType("TRADE_IN")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  submissionType === "TRADE_IN"
                    ? isDarkEffective
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-white text-slate-950 shadow-sm"
                    : isDarkEffective
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tukar Tambah</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmissionType("SELL_ONLY")}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  submissionType === "SELL_ONLY"
                    ? isDarkEffective
                      ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                      : "bg-white text-slate-950 shadow-sm"
                    : isDarkEffective
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                <BadgePercent className="w-3.5 h-3.5" />
                <span>Jual Putus ke Toko</span>
              </button>
            </div>
          </div>

          {/* 2. Informasi Unit HP Lama Pelanggan */}
          <div
            className={`p-4 rounded-2xl border space-y-3.5 ${
              isDarkEffective ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Smartphone
                className={`w-4 h-4 ${isDarkEffective ? "text-emerald-400" : "text-emerald-600"}`}
              />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Unit Lama Pelanggan
              </h3>
            </div>

            {/* Merk Pills */}
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Merk HP
              </label>
              <div className="flex flex-wrap gap-1.5">
                {brandOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                      brand === b
                        ? isDarkEffective
                          ? "bg-white text-slate-950 border-white shadow-xs"
                          : "bg-slate-950 text-white border-slate-950 shadow-xs"
                        : isDarkEffective
                        ? "bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Seri / Tipe Lengkap */}
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Seri &amp; Kapasitas Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Contoh: iPhone 11 128GB Black / S22 Ultra 256GB"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition outline-none ${
                  isDarkEffective
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950 focus:ring-1 focus:ring-slate-950"
                }`}
              />
            </div>

            {/* Kondisi Fisik & Fungsi */}
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Kondisi Fisik &amp; Fungsi
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {conditionOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border text-center transition ${
                      condition === c
                        ? isDarkEffective
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60"
                          : "bg-emerald-50 text-emerald-800 border-emerald-400 font-black"
                        : isDarkEffective
                        ? "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Kelengkapan */}
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Kelengkapan Unit
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                {completenessOptions.map((cl) => (
                  <button
                    key={cl}
                    type="button"
                    onClick={() => setCompleteness(cl)}
                    className={`px-2.5 py-2 rounded-xl text-[11px] font-bold border text-center transition ${
                      completeness === cl
                        ? isDarkEffective
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/60"
                          : "bg-blue-50 text-blue-800 border-blue-400 font-black"
                        : isDarkEffective
                        ? "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cl}
                  </button>
                ))}
              </div>
            </div>

            {/* Catatan Minus */}
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Catatan Minus / Info Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={minusNotes}
                onChange={(e) => setMinusNotes(e.target.value)}
                placeholder="Contoh: Battery Health 78%, TrueTone off, lecet sudut kanan bawah, sisanya normal."
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium border transition outline-none resize-none ${
                  isDarkEffective
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-400"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950"
                }`}
              />
            </div>
          </div>

          {/* 3. Unit yang Diincar di Toko (Khusus Tukar Tambah) */}
          {submissionType === "TRADE_IN" && (
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                isDarkEffective ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-50 border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles
                    className={`w-4 h-4 ${isDarkEffective ? "text-amber-400" : "text-amber-600"}`}
                  />
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    Unit Toko yang Diincar
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold ${
                    isDarkEffective ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {availableStoreProducts.length} Ready Stok
                </span>
              </div>

              {availableStoreProducts.length > 0 && (
                <div className="space-y-1">
                  <label
                    className={`text-[10px] font-bold block ${
                      isDarkEffective ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Pilih Dari Katalog Toko {store.name}
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      if (e.target.value) setCustomTargetDevice("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition outline-none ${
                      isDarkEffective
                        ? "bg-slate-900 border-slate-700 text-white focus:border-amber-400"
                        : "bg-white border-slate-300 text-slate-900 focus:border-slate-950"
                    }`}
                  >
                    <option value="" className={isDarkEffective ? "bg-slate-900 text-white" : "bg-white text-slate-900"}>
                      -- Pilih Unit Dari Katalog Toko --
                    </option>
                    {availableStoreProducts.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        className={isDarkEffective ? "bg-slate-900 text-white" : "bg-white text-slate-900"}
                      >
                        {p.name} · {formatRupiah(p.price)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Atau Input Manual Target Unit */}
              <div className="space-y-1">
                <label
                  className={`text-[10px] font-bold block ${
                    isDarkEffective ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Atau Ketik Nama Unit yang Dicari
                </label>
                <input
                  type="text"
                  value={customTargetDevice}
                  onChange={(e) => {
                    setCustomTargetDevice(e.target.value);
                    if (e.target.value) setSelectedProductId("");
                  }}
                  placeholder="Contoh: Mau tukar ke iPhone 13 Pro 256GB Sierra Blue"
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                    isDarkEffective
                      ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-amber-400"
                      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950"
                  }`}
                />
              </div>
            </div>
          )}

          {/* 4. Nama & Kontak Singkat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Nama Anda (Pemilik HP)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nama Anda"
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                  isDarkEffective
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-white"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label
                className={`text-[10px] font-bold block ${
                  isDarkEffective ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No. WhatsApp Anda (Opsional)
              </label>
              <input
                type="tel"
                value={customerWa}
                onChange={(e) => setCustomerWa(e.target.value)}
                placeholder="0812xxxxxxx"
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border transition outline-none ${
                  isDarkEffective
                    ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-white"
                    : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950"
                }`}
              />
            </div>
          </div>
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div
          className={`p-4 border-t flex flex-col sm:flex-row items-center gap-2.5 shrink-0 ${
            isDarkEffective ? "border-slate-800 bg-slate-900/90" : "border-slate-100 bg-slate-50"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition order-2 sm:order-1 ${
              isDarkEffective
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={isSubmitting || !model.trim()}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition order-1 sm:order-2"
          >
            <MessageCircle className="w-4 h-4 fill-current shrink-0" />
            <span>🚀 Kirim Taksiran via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface TradeInBannerProps {
  onOpen: () => void;
  isDark?: boolean;
  storeName?: string;
}

export function TradeInBanner({
  onOpen,
  isDark = false,
  storeName,
}: TradeInBannerProps) {
  return (
    <div
      onClick={onOpen}
      className={`relative cursor-pointer group rounded-3xl p-4 sm:p-5 border transition-all duration-300 shadow-md hover:shadow-xl overflow-hidden select-none ${
        isDark
          ? "bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/30 text-white"
          : "bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white border-emerald-200/90 text-slate-900"
      }`}
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform ${
              isDark
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
            }`}
          >
            🔄
          </div>
          <div className="space-y-0.5 text-left">
            <div className="inline-flex items-center gap-1 text-[9px] font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-2.5 h-2.5" />
              <span>INSTANT APPRAISAL</span>
            </div>
            <h4 className="text-xs sm:text-sm font-black tracking-tight leading-snug">
              Mau Ganti HP? Tukar Tambah HP Lamamu di Sini 🔄
            </h4>
            <p
              className={`text-[11px] font-medium leading-tight ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Terima iPhone &amp; Android second segala kondisi. Dapatkan taksiran kilat ke WhatsApp.
            </p>
          </div>
        </div>

        <div className="shrink-0 hidden xs:flex">
          <span
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition group-hover:translate-x-0.5 ${
              isDark
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-950 text-white shadow-xs"
            }`}
          >
            <span>Taksir Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
