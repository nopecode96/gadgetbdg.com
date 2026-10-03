"use client";

import { useState } from "react";
import {
  Package,
  Layers,
  Sparkles,
  Server,
  CreditCard,
  Phone,
  ShieldCheck,
  Check,
  Save,
  AlertCircle,
  ExternalLink,
  Info,
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
    <div className="space-y-6">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === "plans"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
          Manajemen Paket Langganan
        </button>
        <button
          onClick={() => setActiveTab("platform")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition ${
            activeTab === "platform"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Pembayaran & Infrastruktur SaaS
        </button>
      </div>

      {/* TAB 1: Subscription Plans */}
      {activeTab === "plans" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> Konfigurasi Tier Paket
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ubah harga, batas kuota katalog produk, komisi sales partner, dan fitur watermark/domain secara real-time.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSaving = savingPlanId === plan.id;
              const isStarter = plan.id === "STARTER";
              const isPro = plan.id === "PRO";
              const isAdvance = plan.id === "ADVANCE";

              return (
                <div
                  key={plan.id}
                  className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden ${
                    isAdvance
                      ? "border-purple-600/60 shadow-purple-950/20"
                      : isPro
                      ? "border-indigo-600/60 shadow-indigo-950/20"
                      : "border-slate-800"
                  }`}
                >
                  {/* Badge */}
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
                      ID: {plan.id}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Nama Paket
                      </label>
                      <input
                        type="text"
                        disabled
                        value={plan.name}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 font-bold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Harga Berlangganan / Bulan (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) =>
                            handlePlanChange(plan.id, "price", Number(e.target.value))
                          }
                          className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg pl-10 pr-3 py-2 text-sm text-white font-mono font-bold"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        Terbaca: {formatRupiah(plan.price)}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Maksimal Produk Aktif
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
                        className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono font-bold"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {plan.maxActiveProducts >= 9999
                          ? "Unlimited produk katalog"
                          : `Maksimal kuota katalog ${plan.maxActiveProducts} produk`}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 block mb-1">
                        Komisi Sales Partner / Closing (Rp)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
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
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg pl-10 pr-3 py-2 text-sm text-emerald-300 font-mono font-bold"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        Komisi cair: {formatRupiah(plan.salesCommission)}
                      </p>
                    </div>

                    {/* Toggles */}
                    <div className="pt-2 border-t border-slate-800 space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-slate-300">
                          Watermark GadgetBdg
                        </span>
                        <input
                          type="checkbox"
                          checked={plan.hasWatermark}
                          onChange={(e) =>
                            handlePlanChange(plan.id, "hasWatermark", e.target.checked)
                          }
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-slate-300">
                          Fitur Custom Domain
                        </span>
                        <input
                          type="checkbox"
                          checked={plan.hasCustomDomain}
                          onChange={(e) =>
                            handlePlanChange(plan.id, "hasCustomDomain", e.target.checked)
                          }
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 focus:ring-0"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSavePlan(plan)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
                        isAdvance
                          ? "bg-purple-600 hover:bg-purple-500 text-white"
                          : isPro
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      } disabled:opacity-50`}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          Simpan Perubahan {plan.id}
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Rekening Penerima Tagihan SaaS
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Data ini akan tampil saat merchant mengonfirmasi pembayaran paket langganan dan di invoice tagihan.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  URL Gambar QRIS (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={settings.qrisImageUrl || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, qrisImageUrl: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                {settings.qrisImageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={settings.qrisImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Pratinjau QRIS
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Box 2: DNS & Kontak Support */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Server className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Infrastruktur DNS & Support
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Digunakan untuk panduan koneksi Custom Domain merchant dan jalur hotline CS.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Alamat IPv4 publik tempat reverse proxy / load balancer SaaS berjalan.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
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
                  className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Host tujuan CNAME untuk verifikasi custom domain merchant.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  WhatsApp Hotline CS / Support
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">
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
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-lg pl-7 pr-3 py-2 text-sm text-emerald-300 font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Format internasional tanpa spasi atau strip (misal: 6281234567890).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPlatform}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition disabled:opacity-50"
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
