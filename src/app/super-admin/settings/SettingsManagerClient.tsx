"use client";

import { useState, useRef } from "react";
import {
  Layers,
  Sparkles,
  Server,
  CreditCard,
  Phone,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  Sliders,
  DollarSign,
  Package,
  Upload,
  QrCode,
  Building2,
  Image as ImageIcon,
} from "lucide-react";
import {
  updateSubscriptionPlanAction,
  updatePlatformSettingsAction,
  type SystemSettingsOverview,
  type SerializedSubscriptionPlan,
  type SerializedPlatformSetting,
} from "@/lib/actions/system-settings-actions";
import { uploadQrisImageAction } from "@/lib/actions/upload-qris-action";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function SettingsManagerClient({ initialData }: { initialData: SystemSettingsOverview }) {
  const [activeTab, setActiveTab] = useState<"plans" | "platform">("plans");

  // Plans state
  const [plans, setPlans] = useState<SerializedSubscriptionPlan[]>(initialData.plans);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  // Platform settings state
  const [settings, setSettings] = useState<SerializedPlatformSetting>(initialData.settings);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [uploadingQris, setUploadingQris] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status banners / toast
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePlanChange = (
    planId: string,
    field: keyof SerializedSubscriptionPlan,
    value: any
  ) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === planId ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePlan = async (plan: SerializedSubscriptionPlan) => {
    setSavingPlanId(plan.id);
    setMessage(null);

    const res = await updateSubscriptionPlanAction(plan.id, {
      price: Number(plan.price),
      maxProducts: Number(plan.maxActiveProducts),
      hasWatermark: Boolean(plan.hasWatermark),
      customDomain: Boolean(plan.hasCustomDomain),
      salesCommission: Number(plan.salesCommission),
    });

    setSavingPlanId(null);
    if (res.success) {
      showToast("success", res.message || `Paket ${plan.name} berhasil diperbarui!`);
    } else {
      showToast("error", res.error || "Gagal memperbarui paket.");
    }
  };

  const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQris(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("qrisFile", file);

      const res = await uploadQrisImageAction(formData);
      if (res.success && res.qrisImageUrl) {
        setSettings((prev) => ({
          ...prev,
          qrisImageUrl: res.qrisImageUrl!,
        }));
        showToast("success", res.message || "Gambar QRIS berhasil diunggah!");
      } else {
        showToast("error", res.error || "Gagal mengunggah gambar QRIS.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Terjadi kesalahan saat unggah QRIS.");
    } finally {
      setUploadingQris(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlatform(true);
    setMessage(null);

    const res = await updatePlatformSettingsAction({
      platformName: settings.platformName,
      tagline: settings.tagline,
      cityCoverage: settings.cityCoverage,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      supportWhatsapp: settings.supportWhatsapp,
      supportEmail: settings.supportEmail,
      serverIp: settings.serverIp,
      cnameTarget: settings.cnameTarget,
      enableBankTransfer: settings.enableBankTransfer,
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      bankAccountHolder: settings.bankAccountHolder,
      qrisImageUrl: settings.qrisImageUrl || undefined,
      qrisNmid: settings.qrisNmid || undefined,
    });

    setSavingPlatform(false);
    if (res.success) {
      showToast("success", res.message || "Pengaturan platform berhasil disimpan!");
    } else {
      showToast("error", res.error || "Gagal menyimpan pengaturan platform.");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-100">
      {/* Header Judul Halaman */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sliders className="w-5 h-5" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Pengaturan Sistem & Paket SaaS
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Konfigurasi kuota paket langganan, komisi sales, rekening penampung biaya langganan, dan infrastruktur DNS.
        </p>
      </div>

      {/* Toast Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border transition animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-950/70 border-emerald-600/50 text-emerald-200"
              : "bg-red-950/70 border-red-600/50 text-red-200"
          }`}
        >
          {message.type === "success" ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{message.text}</span>
        </div>
      )}

      {/* Tab Navigasi Berbasis Desain Enterprise Dark */}
      <div className="inline-flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === "plans"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <Layers className="w-4 h-4" />
          Manajemen Paket Langganan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
            activeTab === "platform"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Pembayaran &amp; Infrastruktur Platform
        </button>
      </div>

      {/* TAB 1: Subscription Plans */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {plans
              .filter((p) => p.id === "STARTER" || p.id === "PRO")
              .map((plan) => {
                const isSaving = savingPlanId === plan.id;
                const isPro = plan.id === "PRO";

                return (
                  <div
                    key={plan.id}
                    className={`bg-slate-900/70 border rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden transition-all ${
                      isPro
                        ? "border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-indigo-950/20"
                        : "border-slate-800/90 shadow-slate-950/20"
                    }`}
                  >
                    {/* Badge & ID */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full tracking-wider ${
                            isPro
                              ? "bg-indigo-900/60 text-indigo-300 border border-indigo-500/40"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {plan.id}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Tier ID: {plan.id}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Nama Paket
                          </label>
                          <input
                            type="text"
                            disabled
                            value={plan.name}
                            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-sm text-slate-300 font-bold cursor-not-allowed"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Harga Berlangganan / Bulan (Rp)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-2.5 text-xs text-slate-500 font-bold">
                              Rp
                            </span>
                            <input
                              type="number"
                              value={plan.price}
                              onChange={(e) =>
                                handlePlanChange(plan.id, "price", Number(e.target.value))
                              }
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white font-mono font-bold placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                            Format: {formatRupiah(plan.price)} / bulan
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Maksimal Unit Katalog
                          </label>
                          <input
                            type="number"
                            value={plan.maxActiveProducts}
                            onChange={(e) =>
                              handlePlanChange(
                                plan.id,
                                "maxActiveProducts",
                                Number(e.target.value)
                              )
                            }
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                          />
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            {plan.maxActiveProducts >= 99999
                              ? "Unlimited unit produk etalase (999999)"
                              : `Maksimal ${plan.maxActiveProducts} produk aktif`}
                          </p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                            Komisi Sales Partner (Rp)
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-2.5 text-xs text-slate-500 font-bold">
                              Rp
                            </span>
                            <input
                              type="number"
                              value={plan.salesCommission}
                              onChange={(e) =>
                                handlePlanChange(
                                  plan.id,
                                  "salesCommission",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-emerald-300 font-mono font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                            />
                          </div>
                          <p className="text-[11px] text-emerald-400 mt-1.5 font-mono">
                            Cair ke sales: {formatRupiah(plan.salesCommission)}
                          </p>
                        </div>

                        {/* Checkbox Toggles */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-3">
                          <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                              Tampilkan Watermark GadgetBdg
                            </span>
                            <input
                              type="checkbox"
                              checked={plan.hasWatermark}
                              onChange={(e) =>
                                handlePlanChange(plan.id, "hasWatermark", e.target.checked)
                              }
                              className="w-4 h-4 rounded bg-slate-950 border-slate-700 accent-indigo-500 cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                              Dukungan Custom Domain
                            </span>
                            <input
                              type="checkbox"
                              checked={plan.hasCustomDomain}
                              onChange={(e) =>
                                handlePlanChange(plan.id, "hasCustomDomain", e.target.checked)
                              }
                              className="w-4 h-4 rounded bg-slate-950 border-slate-700 accent-indigo-500 cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80">
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSavePlan(plan)}
                        className={`w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                          isPro
                            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
                            : "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-700/20"
                        } disabled:opacity-50`}
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Simpan Paket {plan.id}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: Platform Infrastructure & Payments */}
      {activeTab === "platform" && (
        <form onSubmit={handleSavePlatform} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Metode Pembayaran Tagihan SaaS (QRIS Utama + Transfer Bank Opsional) */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <QrCode className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Metode Pembayaran Tagihan SaaS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfigurasi kanal pembayaran pendaftaran paket langganan bagi calon merchant konter HP.
                  </p>
                </div>
              </div>

              {/* SEKSI A: QRIS Standar Nasional (Metode Utama) */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                      <QrCode className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">
                        QRIS Standar Pembayaran Nasional
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Metode pembayaran utama (Default). Merchant memindai barcode QRIS & mengunggah bukti transfer.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Aktif (Utama)
                  </span>
                </div>

                {/* Preview & File Uploader */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                    {settings.qrisImageUrl ? (
                      <div className="space-y-2 flex flex-col items-center">
                        <div className="w-32 h-44 bg-white rounded-lg p-2 flex items-center justify-center shadow-inner overflow-hidden border border-slate-700">
                          <img
                            src={settings.qrisImageUrl}
                            alt="QRIS Merchant Resmi"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <a
                          href={settings.qrisImageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> Lihat Gambar Penuh
                        </a>
                      </div>
                    ) : (
                      <div className="w-32 h-44 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-slate-500 p-2 border border-dashed border-slate-800">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] leading-tight">Belum ada gambar QRIS</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        Unggah File Gambar QRIS Resmi
                      </label>
                      <p className="text-[11px] text-slate-400 mb-2.5">
                        Format PNG, JPG, atau WebP (maks. 5MB). Gambar akan disimpan otomatis ke sistem.
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleQrisFileChange}
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={uploadingQris}
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
                      >
                        {uploadingQris ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Mengunggah QRIS...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            Pilih File Gambar Baru
                          </>
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1">
                        NMID / Kode Merchant QRIS
                      </label>
                      <input
                        type="text"
                        placeholder="ID1026592057644"
                        value={settings.qrisNmid || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, qrisNmid: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Dicetak di bawah barcode QRIS untuk referensi merchant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEKSI B: Transfer Bank Manual (Opsional dengan Toggle) */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-amber-500/10 text-amber-400">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Transfer Rekening Bank Manual (Opsional)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Aktifkan jika ingin memberikan pilihan alternatif selain QRIS di halaman checkout.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(settings.enableBankTransfer)}
                      onChange={(e) =>
                        setSettings({ ...settings, enableBankTransfer: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                {settings.enableBankTransfer ? (
                  <div className="space-y-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Nama Bank / Provider
                      </label>
                      <input
                        type="text"
                        required={settings.enableBankTransfer}
                        placeholder="BCA, Mandiri, BNI, dll"
                        value={settings.bankName || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, bankName: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Nomor Rekening
                      </label>
                      <input
                        type="text"
                        required={settings.enableBankTransfer}
                        placeholder="1234567890"
                        value={settings.bankAccountNumber || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, bankAccountNumber: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white font-mono placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                        Atas Nama Pemilik Rekening
                      </label>
                      <input
                        type="text"
                        required={settings.enableBankTransfer}
                        placeholder="PT Gadget Bandung Solusindo"
                        value={settings.bankAccountHolder || ""}
                        onChange={(e) =>
                          setSettings({ ...settings, bankAccountHolder: e.target.value })
                        }
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                    Pilihan transfer rekening bank manual saat ini dinonaktifkan. Calon merchant hanya akan melihat instruksi pembayaran resmi melalui scan QRIS.
                  </p>
                )}
              </div>
            </div>

            {/* Box 2: DNS & Kontak Support */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Server className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-white text-base">
                  Infrastruktur DNS &amp; Support
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Digunakan untuk panduan koneksi Custom Domain merchant dan jalur hotline CS.
              </p>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Nama Platform
                </label>
                <input
                  type="text"
                  required
                  placeholder="GadgetBdg.com"
                  value={settings.platformName}
                  onChange={(e) =>
                    setSettings({ ...settings, platformName: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Cakupan Wilayah / Kota
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bandung Raya"
                    value={settings.cityCoverage}
                    onChange={(e) =>
                      setSettings({ ...settings, cityCoverage: e.target.value })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Tagline Platform
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Platform Toko Online Konter HP Terpercaya"
                    value={settings.tagline}
                    onChange={(e) =>
                      setSettings({ ...settings, tagline: e.target.value })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Hero Title (Judul Utama Homepage)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit"
                  value={settings.heroTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, heroTitle: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-semibold placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Hero Subtitle (Deskripsi Hero)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tingkatkan penjualan unit second & baru..."
                  value={settings.heroSubtitle}
                  onChange={(e) =>
                    setSettings({ ...settings, heroSubtitle: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  IP Server SaaS (A Record Target)
                </label>
                <input
                  type="text"
                  required
                  placeholder="72.62.75.149"
                  value={settings.serverIp}
                  onChange={(e) =>
                    setSettings({ ...settings, serverIp: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Alamat IPv4 publik host reverse proxy SaaS.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  CNAME Target SaaS
                </label>
                <input
                  type="text"
                  required
                  placeholder="cname.gadgetbdg.com"
                  value={settings.cnameTarget}
                  onChange={(e) =>
                    setSettings({ ...settings, cnameTarget: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Host tujuan CNAME untuk verifikasi custom domain merchant.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  WhatsApp Hotline CS / Support
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-xs text-slate-500 font-bold">
                    +
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="6281234567890"
                    value={settings.supportWhatsapp}
                    onChange={(e) =>
                      setSettings({ ...settings, supportWhatsapp: e.target.value })
                    }
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-emerald-300 font-mono font-bold placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format angka internasional tanpa spasi atau strip (cth: 6281234567890).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPlatform}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {savingPlatform ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan Pengaturan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Pengaturan Platform
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
