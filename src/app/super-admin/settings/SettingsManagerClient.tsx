"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  updateSubscriptionPlanAction,
  updatePlatformSettingsAction,
  type SystemSettingsOverview,
  type SerializedSubscriptionPlan,
  type SerializedPlatformSetting,
} from "@/lib/actions/system-settings-actions";

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

  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlatform(true);
    setMessage(null);

    const res = await updatePlatformSettingsAction({
      platformName: settings.platformName,
      supportWhatsapp: settings.supportWhatsapp,
      serverIp: settings.serverIp,
      cnameTarget: settings.cnameTarget,
      bankName: settings.bankName,
      bankAccountNumber: settings.bankAccountNumber,
      bankAccountHolder: settings.bankAccountHolder,
      qrisImageUrl: settings.qrisImageUrl || undefined,
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSaving = savingPlanId === plan.id;
              const isAdvance = plan.id === "ADVANCE";
              const isPro = plan.id === "PRO";

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between relative overflow-hidden transition-all ${
                    isAdvance
                      ? "ring-1 ring-purple-500/20 shadow-purple-950/20"
                      : isPro
                      ? "ring-1 ring-indigo-500/20 shadow-indigo-950/20"
                      : ""
                  }`}
                >
                  {/* Badge & ID */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full tracking-wider ${
                          isAdvance
                            ? "bg-purple-900/60 text-purple-300 border border-purple-500/40"
                            : isPro
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
                            ? "Unlimited unit produk etalase"
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
                        isAdvance
                          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/20"
                          : isPro
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
            {/* Box 1: Rekening Tagihan & QRIS */}
            <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-white text-base">
                  Rekening Penerima Tagihan SaaS
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Data ini akan tampil saat merchant mengonfirmasi pembayaran paket langganan dan di verifikasi billing.
              </p>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Nama Bank / Provider
                </label>
                <input
                  type="text"
                  required
                  placeholder="BCA, Mandiri, BNI, dll"
                  value={settings.bankName}
                  onChange={(e) =>
                    setSettings({ ...settings, bankName: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="1234567890"
                  value={settings.bankAccountNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountNumber: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Atas Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  placeholder="PT Gadget Bandung Solusindo"
                  value={settings.bankAccountHolder}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountHolder: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                  URL Gambar QRIS (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={settings.qrisImageUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, qrisImageUrl: e.target.value })
                  }
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                {settings.qrisImageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={settings.qrisImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Pratinjau Gambar QRIS
                    </a>
                  </div>
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
