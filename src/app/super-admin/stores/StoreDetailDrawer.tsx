"use client";

import { useState } from "react";
import {
  X,
  Store,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Layers,
  Palette,
  KeyRound,
  RotateCcw,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  User,
  Mail,
  Phone,
  Power,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  StoreAdminListItem,
  updateStoreTierAction,
  toggleStoreStatusAction,
  extendStoreSubscriptionAction,
  resetTemplateCooldownAction,
} from "@/lib/actions/store-management-actions";
import { resetStoreOwnerPasswordAction } from "@/lib/actions/saas-admin-actions";

interface StoreDetailDrawerProps {
  store: StoreAdminListItem | null;
  onClose: () => void;
  onStoreUpdated: (updatedStore: StoreAdminListItem) => void;
}

function formatExpiryDate(iso: string | null) {
  if (!iso) return "Tidak Aktif";
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Kedaluwarsa";
  if (diffDays > 25000) return "Selamanya (Lifetime)";
  return `${diffDays} hari lagi (${date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })})`;
}

function cooldownInfo(lastChangeAt: string | null) {
  if (!lastChangeAt) return { canChange: true, text: "Bebas ganti tema (tidak ada cooldown)" };
  const diffMs = Date.now() - new Date(lastChangeAt).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 30) return { canChange: true, text: "Bebas ganti tema (cooldown 30 hari selesai)" };
  const remaining = 30 - diffDays;
  return { canChange: false, text: `Cooldown aktif: sisa ${remaining} hari lagi` };
}

export function StoreDetailDrawer({ store, onClose, onStoreUpdated }: StoreDetailDrawerProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirmResetPwd, setShowConfirmResetPwd] = useState(false);

  if (!store) return null;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Toggle status
  const handleToggleStatus = async () => {
    const nextStatus = !store.isActive;
    setLoadingAction("toggleStatus");
    const res = await toggleStoreStatusAction(store.id, nextStatus);
    setLoadingAction(null);

    if (res.success && res.store) {
      const updated = { ...store, isActive: res.store.isActive };
      onStoreUpdated(updated);
      showToast("success", res.message || "Status toko berhasil diperbarui.");
    } else {
      showToast("error", res.error || "Gagal mengubah status toko.");
    }
  };

  // 2. Change tier
  const handleChangeTier = async (newTier: "STARTER" | "PRO" | "ADVANCE") => {
    if (store.tier === newTier) return;
    setLoadingAction("changeTier");
    const res = await updateStoreTierAction(store.id, newTier);
    setLoadingAction(null);

    if (res.success && res.store) {
      const updated = {
        ...store,
        tier: res.store.tier,
        planId: res.store.planId,
        hasWatermark: res.store.hasWatermark,
      };
      onStoreUpdated(updated);
      showToast("success", res.message || `Paket toko diubah ke ${newTier}.`);
    } else {
      showToast("error", res.error || "Gagal mengubah paket tier.");
    }
  };

  // 3. Extend subscription
  const handleExtend = async (days: number) => {
    setLoadingAction(`extend-${days}`);
    const res = await extendStoreSubscriptionAction(store.id, days);
    setLoadingAction(null);

    if (res.success && res.subscriptionExpiresAt) {
      const updated = {
        ...store,
        subscriptionExpiresAt: res.subscriptionExpiresAt,
        isActive: res.isActive,
      };
      onStoreUpdated(updated);
      showToast("success", res.message || "Masa aktif langganan berhasil diperpanjang.");
    } else {
      showToast("error", res.error || "Gagal memperpanjang masa aktif.");
    }
  };

  // 4. Reset cooldown
  const handleResetCooldown = async () => {
    setLoadingAction("resetCooldown");
    const res = await resetTemplateCooldownAction(store.id);
    setLoadingAction(null);

    if (res.success) {
      const updated = { ...store, lastTemplateChangeAt: null };
      onStoreUpdated(updated);
      showToast("success", res.message || "Cooldown tema berhasil di-reset!");
    } else {
      showToast("error", res.error || "Gagal mereset cooldown tema.");
    }
  };

  // 5. Reset password owner
  const handleResetPassword = async () => {
    setLoadingAction("resetPwd");
    const res = await resetStoreOwnerPasswordAction(store.id, "Admin123!");
    setLoadingAction(null);
    setShowConfirmResetPwd(false);

    if (res.success) {
      showToast("success", "Password owner toko berhasil direset ke 'Admin123!'");
    } else {
      showToast("error", res.error || "Gagal mereset password owner.");
    }
  };

  const themeCooldown = cooldownInfo(store.lastTemplateChangeAt);
  const cleanOwnerWhatsapp = store.whatsapp.replace(/\D/g, "");

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white leading-tight">{store.name}</h2>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      store.isActive
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {store.isActive ? "Aktif" : "Beku"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                  <span>{store.slug}.gadgetbdg.com</span>
                  <a
                    href={`https://${store.slug}.gadgetbdg.com`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 inline-flex items-center"
                    title="Buka Toko"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Toggle Switch */}
              <button
                type="button"
                disabled={loadingAction === "toggleStatus"}
                onClick={handleToggleStatus}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  store.isActive ? "bg-emerald-600" : "bg-slate-700"
                } disabled:opacity-50`}
                title={store.isActive ? "Nonaktifkan (Bekukan) Toko" : "Aktifkan Toko"}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    store.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Toast inside drawer */}
            {toast && (
              <div
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold ${
                  toast.type === "success"
                    ? "bg-emerald-950/60 border-emerald-600/40 text-emerald-200"
                    : "bg-red-950/60 border-red-600/40 text-red-200"
                }`}
              >
                {toast.type === "success" ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
            )}

            {/* Section 1: Atribusi & Kontak */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Atribusi & Kontak Pemilik
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Sales Partner */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" /> Mitra Penjualan
                  </div>
                  {store.salesPartner ? (
                    <div>
                      <div className="font-bold text-white">{store.salesPartner.name}</div>
                      <div className="font-mono text-emerald-400 text-[11px]">
                        Kode: {store.salesPartner.code}
                      </div>
                      <a
                        href={`https://wa.me/${store.salesPartner.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:underline block mt-0.5"
                      >
                        WA: {store.salesPartner.phone}
                      </a>
                    </div>
                  ) : (
                    <div className="text-slate-400 font-medium">Pendaftaran Organik (Tanpa Sales)</div>
                  )}
                </div>

                {/* Owner Info */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-3">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-sky-400" /> Pemilik Toko
                  </div>
                  {store.owner ? (
                    <div>
                      <div className="font-bold text-white">{store.owner.name}</div>
                      <div className="text-slate-400 text-[11px] truncate">{store.owner.email}</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Belum ada owner terdaftar</div>
                  )}
                </div>
              </div>

              {/* Chat WA Owner Button */}
              {cleanOwnerWhatsapp && (
                <a
                  href={`https://wa.me/${cleanOwnerWhatsapp}?text=Halo%20${encodeURIComponent(
                    store.owner?.name || store.name
                  )},%20kami%20dari%20Tim%20Support%20GadgetBdg`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  Chat WhatsApp Owner (+{cleanOwnerWhatsapp})
                </a>
              )}
            </div>

            {/* Section 2: Langganan & Masa Aktif */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Langganan & Masa Aktif
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dropdown Tier */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Paket Tier Saat Ini
                  </label>
                  <select
                    disabled={loadingAction === "changeTier"}
                    value={store.tier}
                    onChange={(e) => handleChangeTier(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 text-white rounded-lg px-3 py-2 text-xs font-bold"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="PRO">PRO</option>
                    <option value="ADVANCE">ADVANCE</option>
                  </select>
                </div>

                {/* Masa Aktif Info */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Masa Berlaku Toko
                  </label>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{formatExpiryDate(store.subscriptionExpiresAt)}</span>
                  </div>
                </div>
              </div>

              {/* Tombol Cepat Tambah Masa Aktif */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Perpanjang / Atur Masa Aktif Cepat
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={loadingAction?.startsWith("extend")}
                    onClick={() => handleExtend(7)}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg border border-slate-700 transition disabled:opacity-50"
                  >
                    +7 Hari
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction?.startsWith("extend")}
                    onClick={() => handleExtend(30)}
                    className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-bold py-2 rounded-lg border border-indigo-500/30 transition disabled:opacity-50"
                  >
                    +30 Hari
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction?.startsWith("extend")}
                    onClick={() => handleExtend(90)}
                    className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold py-2 rounded-lg border border-purple-500/30 transition disabled:opacity-50"
                  >
                    +90 Hari
                  </button>
                  <button
                    type="button"
                    disabled={loadingAction?.startsWith("extend")}
                    onClick={() => handleExtend(36500)}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold py-2 rounded-lg border border-emerald-500/30 transition disabled:opacity-50"
                  >
                    Selamanya
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Template & Tampilan */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-purple-400" /> Template & Tampilan
              </h3>

              <div className="flex items-center justify-between text-xs bg-slate-900 border border-slate-800 rounded-lg p-3">
                <div>
                  <div className="font-bold text-white capitalize">
                    Tema: {store.templateId || "Modern Store"}
                  </div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      themeCooldown.canChange ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {themeCooldown.text}
                  </div>
                </div>

                {!themeCooldown.canChange && (
                  <button
                    type="button"
                    disabled={loadingAction === "resetCooldown"}
                    onClick={handleResetCooldown}
                    className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-bold py-1.5 px-3 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Cooldown
                  </button>
                )}
              </div>
            </div>

            {/* Section 4: Keamanan & Kredensial */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-red-400" /> Keamanan & Akun
              </h3>

              {showConfirmResetPwd ? (
                <div className="bg-red-950/40 border border-red-600/40 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-red-200 font-semibold">
                    Yakin ingin mereset password akun owner ke <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">Admin123!</code>?
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={loadingAction === "resetPwd"}
                      onClick={handleResetPassword}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-50"
                    >
                      {loadingAction === "resetPwd" ? "Mereset..." : "Ya, Reset Sekarang"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmResetPwd(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-1.5 px-3 rounded-lg transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowConfirmResetPwd(true)}
                  className="w-full bg-slate-900 hover:bg-red-950/30 border border-slate-800 hover:border-red-500/30 text-slate-300 hover:text-red-300 text-xs font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <KeyRound className="w-4 h-4 text-red-400" />
                  Reset Password Owner ke "Admin123!"
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              ID: {store.id.slice(0, 12)}...
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-lg transition"
            >
              Tutup Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
