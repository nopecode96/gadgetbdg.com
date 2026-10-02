"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Smartphone,
  Store,
  Layers,
  Palette,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
} from "lucide-react";
import { checkSlugAvailabilityAction, registerNewStoreAction } from "@/lib/actions";

export function StoreRegistrationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const [tier, setTier] = useState<"STARTER" | "PRO" | "ADVANCE">("PRO");
  const [templateId, setTemplateId] = useState("minimal-clean");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      if (!res.available) {
        setSlugError(res.error || "Subdomain sudah terpakai.");
      }
    }
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("tier", tier);
    formData.append("templateId", templateId);
    formData.append("whatsapp", whatsapp);
    formData.append("address", address);

    const res = await registerNewStoreAction(formData);
    setSubmitting(false);

    if (res.success && res.store) {
      onClose();
      // Redirect to the newly created store admin
      router.push("/admin");
    } else {
      setSubmitError(res.error || "Gagal mendaftarkan toko baru.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in text-slate-900">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Progress Bar & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">Buka Web Toko HP Baru</h2>
              <p className="text-[11px] text-slate-400">Langkah {step} dari 4</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-blue-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {submitError && (
          <div className="p-3 mb-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Body Steps */}
        <div className="flex-1 overflow-y-auto py-2 space-y-4 text-xs">
          {/* STEP 1: Store Name & Subdomain */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Nama Toko HP Anda *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) {
                      handleSlugChange(e.target.value.replace(/\s+/g, "").toLowerCase());
                    }
                  }}
                  placeholder="Contoh: Berkah Gadget Bandung"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">Pilihan Subdomain Gratis *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="berkahgadget"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl font-mono text-slate-500 text-xs">
                    .gadgetbdg.com
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                  {slugChecking ? (
                    <span className="text-slate-400">Mengecek ketersediaan subdomain...</span>
                  ) : slugAvailable === true ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Subdomain tersedia & siap dipakai!
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
            </div>
          )}

          {/* STEP 2: Tier Selection */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block font-bold text-slate-800 mb-1">Pilih Paket Langganan *</label>

              {/* Starter */}
              <div
                onClick={() => setTier("STARTER")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  tier === "STARTER"
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">STARTER</div>
                  <div className="font-extrabold text-slate-900">Rp 250.000 /bln</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Katalog s/d 15 Unit HP Aktif • 1 Akun Admin • 2 Template Storefront.
                </p>
              </div>

              {/* Pro */}
              <div
                onClick={() => setTier("PRO")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition relative ${
                  tier === "PRO"
                    ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="absolute -top-2.5 right-4 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  Paling Banyak Dipilih
                </span>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">PRO</div>
                  <div className="font-extrabold text-blue-600">Rp 600.000 /bln</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Katalog s/d 30 HP Aktif • 3 Akun Admin • 10 Template • Watermark Otomatis • Custom Domain.
                </p>
              </div>

              {/* Advance */}
              <div
                onClick={() => setTier("ADVANCE")}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition ${
                  tier === "ADVANCE"
                    ? "border-purple-600 bg-purple-50/50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">ADVANCE</div>
                  <div className="font-extrabold text-purple-600">Rp 1.000.000 /bln</div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kapasitas Stok UNLIMITED • 5 Akun per Cabang • 30 Template Bebas Ganti • Watermark Otomatis.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Template Selection */}
          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <label className="block font-bold text-slate-800 mb-1">Pilih Desain Template Awal *</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setTemplateId("minimal-clean")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    templateId === "minimal-clean"
                      ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm text-slate-900">Minimal Clean</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tema putih bersih & elegan. Populer untuk reseller iPhone second mulus.
                  </p>
                  <div className="mt-3 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-500">
                    Preview: White Elegance
                  </div>
                </div>

                <div
                  onClick={() => setTemplateId("dark-gaming")}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition ${
                    templateId === "dark-gaming"
                      ? "border-emerald-500 bg-slate-900 text-white shadow-md ring-1 ring-emerald-500"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-sm">Dark Gaming Cyber</div>
                  <p className={`text-[11px] mt-1 ${templateId === "dark-gaming" ? "text-slate-400" : "text-slate-500"}`}>
                    Nuansa gelap cyberpunk & neon hijau. Cocok untuk ROG, iQOO, POCO flagship.
                  </p>
                  <div className="mt-3 h-12 rounded-lg bg-slate-950 flex items-center justify-center text-[10px] font-mono text-emerald-400">
                    Preview: High FPS Gear
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: WhatsApp Contact & Address */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Nomor WhatsApp Toko (Order & Closing) *
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Seluruh chat pembelian & pengajuan tukar tambah dari buyer akan masuk ke nomor ini.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Alamat Lokasi Toko Fisik (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
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

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && (!name || !slug || slugAvailable === false)}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !whatsapp}
              onClick={handleFinalSubmit}
              className="px-6 py-2.5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {submitting ? (
                "Membuat Toko..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Buka Web Toko Sekarang
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
