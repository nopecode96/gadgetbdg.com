"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Store,
  Layers,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  User,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  Upload,
  Clock,
  Tag,
} from "lucide-react";
import { checkSlugAvailabilityAction, registerStoreWithPaymentAction } from "@/lib/actions";
import { getAvailableTemplatesForTier } from "@/lib/constants/templates";
import { TIER_LIMITS } from "@/lib/constants/pricing";

const TOTAL_STEPS = 5;

const TIER_PRICE: Record<"STARTER" | "PRO" | "ADVANCE", number> = {
  STARTER: TIER_LIMITS.STARTER.price,
  PRO: TIER_LIMITS.PRO.price,
  ADVANCE: TIER_LIMITS.ADVANCE.price,
};

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function StoreRegistrationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);

  // Step 1: Info Toko
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [refCode, setRefCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setRefCode(ref.toUpperCase());
      }
    }
  }, []);

  // Step 2: Tier
  const [tier, setTier] = useState<"STARTER" | "PRO" | "ADVANCE">("PRO");

  // Step 3: Template
  const [templateId, setTemplateId] = useState("minimal-clean");
  const availableTemplates = getAvailableTemplatesForTier(tier);

  // Step 4: Akun Admin
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 5: Pembayaran QRIS
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSlugChange(val: string) {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlug(formatted);
    setSlugAvailable(null);
    setSlugError(null);
    if (formatted.length >= 3) {
      setSlugChecking(true);
      const res = await checkSlugAvailabilityAction(formatted);
      setSlugChecking(false);
      setSlugAvailable(res.available);
      if (!res.available) setSlugError(res.error || "Subdomain sudah terpakai.");
    }
  }

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    // Upload receipt ke /api/upload jika ada
    let receiptUrl: string | null = null;
    if (receiptFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", receiptFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        receiptUrl = uploadData.url || null;
      } catch {
        // Lanjut tanpa receipt jika upload gagal (bisa dikirim manual)
      }
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("tier", tier);
    formData.append("templateId", templateId);
    formData.append("whatsapp", whatsapp);
    formData.append("address", address);
    formData.append("ownerName", ownerName);
    formData.append("email", email);
    formData.append("password", password);
    if (refCode) formData.append("refCode", refCode);
    if (receiptUrl) formData.append("receiptUrl", receiptUrl);

    const res = await registerStoreWithPaymentAction(formData);
    setSubmitting(false);

    if (res.success) {
      setSubmitSuccess(true);
    } else {
      setSubmitError(res.error || "Gagal mendaftarkan toko.");
    }
  }

  // ----------------------------------------------------------------
  // Success Screen
  // ----------------------------------------------------------------
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Pendaftaran Berhasil!</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Toko <b>{name}</b> telah terdaftar. Tim kami sedang memverifikasi bukti pembayaran QRIS Anda.
            </p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Estimasi Aktivasi: 5–15 Menit
            </p>
            <p>Setelah verifikasi selesai, akun akan aktif otomatis dan Anda bisa login ke <b>{slug}.gadgetbdg.com/admin</b>.</p>
            <p className="mt-1">Email login: <b>{email}</b></p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Step navigation
  // ----------------------------------------------------------------
  function canGoNext(): boolean {
    if (step === 1) return !!(name && slug && slugAvailable === true && whatsapp);
    if (step === 2) return !!tier;
    if (step === 3) return !!templateId;
    if (step === 4) return !!(ownerName && email && password.length >= 6);
    return true; // step 5
  }

  const stepLabels = ["Info Toko", "Paket", "Tema", "Akun Admin", "Pembayaran"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Buka Web Toko HP Baru</h2>
              <p className="text-[11px] text-slate-400">
                Langkah {step} dari {TOTAL_STEPS} — {stepLabels[step - 1]}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="grid gap-1 my-4" style={{ gridTemplateColumns: `repeat(${TOTAL_STEPS}, 1fr)` }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= step ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Error Banner */}
        {submitError && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 text-xs">

          {/* ── STEP 1: Info Toko ── */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Nama Toko HP Anda *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) handleSlugChange(e.target.value.replace(/\s+/g, "").toLowerCase());
                  }}
                  placeholder="Contoh: Berkah Gadget Bandung"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Subdomain Gratis *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="berkahgadget"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl font-mono text-slate-500 text-xs whitespace-nowrap">
                    .gadgetbdg.com
                  </span>
                </div>
                <div className="mt-1.5 text-[11px]">
                  {slugChecking ? (
                    <span className="text-slate-400">Mengecek ketersediaan...</span>
                  ) : slugAvailable === true ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Subdomain tersedia!
                    </span>
                  ) : slugError ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {slugError}
                    </span>
                  ) : (
                    <span className="text-slate-400">Gunakan huruf kecil dan angka saja.</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">No. WhatsApp Toko *</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Alamat Toko (Opsional)</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Bandung Electronic Center Lt.1 Blok C-05"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    Kode Referensi Sales (Opsional)
                  </span>
                  {refCode && (
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Tersambung Partner
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase().trim())}
                  placeholder="Contoh: SALES-ANDI"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Masukkan kode dari agen sales Anda (jika ada) untuk prioritas pendampingan onboarding.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 2: Pilih Paket ── */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block font-bold text-slate-800 mb-1">Pilih Paket Langganan *</label>

              {(["STARTER", "PRO", "ADVANCE"] as const).map((t) => {
                const config = TIER_LIMITS[t];
                const isSelected = tier === t;
                const borderCls = isSelected
                  ? t === "ADVANCE" ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-600" : "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                  : "border-slate-200 hover:border-slate-300";
                const priceCls = t === "ADVANCE" ? "text-purple-600" : t === "PRO" ? "text-blue-600" : "text-slate-900";

                return (
                  <div
                    key={t}
                    onClick={() => { setTier(t); setTemplateId(getAvailableTemplatesForTier(t)[0]?.id || "minimal-clean"); }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${borderCls}`}
                  >
                    {"popularBadge" in config && config.popularBadge && (
                      <span className={`absolute -top-2.5 right-4 text-white text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t === "ADVANCE" ? "bg-purple-600" : "bg-blue-600"
                      }`}>
                        {config.popularBadge}
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase block">
                          {config.labelBadge}
                        </span>
                        <div className="font-extrabold text-sm text-slate-900 mt-0.5">{config.name}</div>
                      </div>

                      {/* Price Anchoring */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-slate-400 line-through decoration-rose-500 decoration-2 text-xs font-semibold">
                            {formatRupiah(config.originalPrice)}
                          </span>
                          <span className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {config.discountBadge}
                          </span>
                        </div>
                        <div className={`font-black text-base ${priceCls}`}>
                          {formatRupiah(config.price)} <span className="text-slate-500 text-[11px] font-normal">{config.period}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{config.description}</p>
                    <div className="mt-2 text-[10px] text-slate-600 font-medium bg-white/80 rounded-lg p-1.5 border border-slate-100">
                      ✨ {config.tagline}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── STEP 3: Pilih Template ── */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800">Pilih Desain Template Awal *</label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {availableTemplates.length} Template ({tier})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {availableTemplates.map((t) => {
                  const isSelected = templateId === t.id;
                  const isDark = t.colors.isDark;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? isDark ? "border-emerald-500 bg-slate-900 shadow-md ring-1 ring-emerald-500" : "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                          : isDark ? "border-slate-800 hover:border-slate-700 bg-slate-950" : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-xs truncate max-w-[150px] ${isDark ? "text-white" : "text-slate-900"}`}>{t.name}</h4>
                          {isSelected && (
                            <span className={`text-[9px] font-bold px-1.5 rounded-full ${isDark ? "bg-emerald-500 text-slate-950" : "bg-blue-600 text-white"}`}>
                              Dipilih
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 line-clamp-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.description}</p>
                      </div>
                      <div className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border ${t.colors.heroGradient} ${t.colors.heroBorder}`}>
                        {t.badge || "Preset"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 4: Akun Admin ── */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <p className="font-bold flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Buat Kredensial Login Admin Toko</p>
                <p className="mt-0.5 text-blue-600">Gunakan untuk login ke dasbor admin toko Anda. Simpan baik-baik!</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Nama Lengkap Pemilik *</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Email Admin *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Password Admin (min. 6 karakter) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="text-[11px] text-rose-500 mt-1">Password minimal 6 karakter.</p>
                )}
                {password.length >= 6 && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Password aman
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 5: Pembayaran QRIS ── */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              {/* Nominal */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl text-center space-y-1">
                <p className="text-xs text-indigo-600 font-semibold">Nominal Transfer Paket {tier}</p>
                <p className="text-3xl font-black text-indigo-700">{formatRupiah(TIER_PRICE[tier])}</p>
                <p className="text-[11px] text-indigo-500">Berlaku 30 hari · NMID: ID1026592057644</p>
              </div>

              {/* QRIS Image */}
              <div className="flex flex-col items-center space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-500" /> Scan QRIS Resmi GadgetBDG.com
                </p>
                <div className="relative w-52 h-52 rounded-2xl overflow-hidden border-2 border-indigo-300 shadow-md bg-white">
                  <Image
                    src="/images/qris-gadgetbdg.png"
                    alt="QRIS GadgetBDG"
                    fill
                    className="object-contain p-2"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  Bayar via GoPay, OVO, DANA, BCA Mobile, atau aplikasi bank manapun yang mendukung QRIS.
                </p>
              </div>

              {/* Upload Bukti */}
              <div>
                <label className="block font-bold text-slate-800 mb-2">Upload Foto Bukti Transfer *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    receiptPreview ? "border-emerald-400 bg-emerald-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  {receiptPreview ? (
                    <div className="space-y-2">
                      <img src={receiptPreview} alt="Receipt Preview" className="max-h-32 mx-auto rounded-xl object-contain" />
                      <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Bukti transfer terunggah
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">Klik untuk pilih foto struk pembayaran</p>
                      <p className="text-[11px] text-slate-400">JPG, PNG, atau WebP (maks 5MB)</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReceiptChange}
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 leading-relaxed">
                <b>⚡ Proses Verifikasi Cepat:</b> Tim kami akan memverifikasi pembayaran dalam 5–15 menit pada jam kerja (08.00–21.00 WIB). Setelah aktif, Anda dapat langsung login dan mengisi katalog HP.
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              disabled={!canGoNext()}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !receiptFile}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Kirim Pembayaran & Daftar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
