"use client";

import { useState } from "react";
import {
  Store,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  Clock,
  ChevronDown,
  KeyRound,
  CalendarPlus,
  ShieldCheck,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  updateStoreTierAction,
  toggleStoreStatusAction,
  extendStoreSubscriptionAction,
  resetTemplateCooldownAction,
  StoreAdminListItem,
} from "@/lib/actions/store-management-actions";
import { resetStoreOwnerPasswordAction } from "@/lib/actions/saas-admin-actions";

function cooldownLabel(lastChangeAt: string | null): { label: string; isCooling: boolean } {
  if (!lastChangeAt) return { label: "Bebas", isCooling: false };
  const diffMs = Date.now() - new Date(lastChangeAt).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 30) return { label: "Bebas", isCooling: false };
  const remaining = 30 - diffDays;
  return { label: `${remaining} hari`, isCooling: true };
}

export function StoreManagementClient({ initialStores }: { initialStores: StoreAdminListItem[] }) {
  const [stores, setStores] = useState<StoreAdminListItem[]>(initialStores);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Toast Notification
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State: Reset Password
  const [pwdModalStore, setPwdModalStore] = useState<StoreAdminListItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResettingPwd, setIsResettingPwd] = useState(false);

  // Modal State: Extend Subscription
  const [extendModalStore, setExtendModalStore] = useState<StoreAdminListItem | null>(null);
  const [additionalDays, setAdditionalDays] = useState(30);
  const [isExtendingSub, setIsExtendingSub] = useState(false);

  // Instant client-side filtering
  const filteredStores = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.customDomain && s.customDomain.toLowerCase().includes(search.toLowerCase())) ||
      (s.owner && s.owner.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.owner && s.owner.name.toLowerCase().includes(search.toLowerCase())) ||
      (s.salesPartner && s.salesPartner.code.toLowerCase().includes(search.toLowerCase()));

    const matchTier = tierFilter === "ALL" || s.tier === tierFilter;
    return matchSearch && matchTier;
  });

  async function handleToggleStatus(store: StoreAdminListItem) {
    const nextStatus = !store.isActive;
    setLoadingId(store.id);
    setLoadingAction("toggle");
    setToast(null);

    const res = await toggleStoreStatusAction(store.id, nextStatus);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, isActive: res.store.isActive } : item))
      );
      setToast({ type: "success", message: res.message || "Status toko berhasil diubah." });
    } else {
      setToast({ type: "error", message: res.error || "Gagal mengubah status toko." });
    }
  }

  async function handleChangeTier(store: StoreAdminListItem, newTier: "STARTER" | "PRO" | "ADVANCE") {
    if (store.tier === newTier) return;

    setLoadingId(store.id);
    setLoadingAction("tier");
    setToast(null);

    const res = await updateStoreTierAction(store.id, newTier);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) =>
          item.id === store.id
            ? {
                ...item,
                tier: res.store.tier,
                planId: res.store.planId,
                hasWatermark: res.store.hasWatermark,
              }
            : item
        )
      );
      setToast({ type: "success", message: res.message || "Tier toko berhasil diubah." });
    } else {
      setToast({ type: "error", message: res.error || "Gagal mengubah tier toko." });
    }
  }

  async function handleResetCooldown(store: StoreAdminListItem) {
    const isConfirm = window.confirm(
      `Reset cooldown pergantian template untuk toko "${store.name}"?\nToko akan dapat langsung mengganti template tanpa menunggu 30 hari.`
    );
    if (!isConfirm) return;

    setLoadingId(store.id);
    setLoadingAction("cooldown");
    setToast(null);

    const res = await resetTemplateCooldownAction(store.id);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success) {
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, lastTemplateChangeAt: null } : item))
      );
      setToast({ type: "success", message: res.message || "Cooldown template berhasil di-reset!" });
    } else {
      setToast({ type: "error", message: res.error || "Gagal mereset cooldown." });
    }
  }

  async function handleConfirmResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdModalStore) return;
    if (newPassword.length < 6) {
      setToast({ type: "error", message: "Password baru minimal 6 karakter." });
      return;
    }

    setIsResettingPwd(true);
    setToast(null);

    const res = await resetStoreOwnerPasswordAction(pwdModalStore.id, newPassword);
    setIsResettingPwd(false);

    if (res.success) {
      setToast({ type: "success", message: res.message || "Password owner berhasil direset!" });
      setPwdModalStore(null);
      setNewPassword("");
    } else {
      setToast({ type: "error", message: res.error || "Gagal mereset password." });
    }
  }

  async function handleConfirmExtendSubscription(e: React.FormEvent) {
    e.preventDefault();
    if (!extendModalStore) return;

    setIsExtendingSub(true);
    setToast(null);

    const res = await extendStoreSubscriptionAction(extendModalStore.id, additionalDays);
    setIsExtendingSub(false);

    if (res.success) {
      setStores((prev) =>
        prev.map((item) =>
          item.id === extendModalStore.id
            ? {
                ...item,
                subscriptionExpiresAt: res.subscriptionExpiresAt || item.subscriptionExpiresAt,
                isActive: res.isActive !== undefined ? res.isActive : item.isActive,
              }
            : item
        )
      );
      setToast({ type: "success", message: res.message || "Masa aktif berhasil diperpanjang!" });
      setExtendModalStore(null);
    } else {
      setToast({ type: "error", message: res.error || "Gagal memperpanjang langganan." });
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg transition-all ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-800 text-emerald-300"
              : "bg-rose-950/90 border-rose-800 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-4 font-mono underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              POSTGRESQL REAL-TIME CONTROL
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tenant Store Master
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Manajemen Toko Merchant</span>
            <span className="text-xs font-mono bg-slate-800 text-indigo-400 px-2.5 py-1 rounded-full border border-slate-700">
              {stores.length} Merchant
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atur tier paket, pantau atribusi sales closing, perpanjang masa aktif, reset password owner, dan cooldown template.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari toko, domain, email..."
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
          >
            <option value="ALL">Semua Tier</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ADVANCE">Advance</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-4">Toko &amp; Pemilik</th>
                <th className="px-5 py-4">Subdomain / Domain</th>
                <th className="px-5 py-4">Paket Tier</th>
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Masa Aktif</th>
                <th className="px-5 py-4">Cooldown Tema</th>
                <th className="px-5 py-4">Unit HP</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Intervensi &amp; Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Tidak ada toko merchant yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isLoading = loadingId === store.id;
                  const cd = cooldownLabel(store.lastTemplateChangeAt);
                  const isExpired =
                    store.subscriptionExpiresAt &&
                    new Date(store.subscriptionExpiresAt).getTime() < Date.now();

                  return (
                    <tr key={store.id} className="hover:bg-slate-750/50 transition">
                      {/* Toko & Info + Sales Attribution Badge */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                            {store.name.charAt(0)}
                          </div>
                          <span>{store.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 pl-9 space-y-1">
                          {store.owner ? (
                            <div className="text-slate-300 font-medium truncate max-w-[200px]" title={store.owner.email}>
                              👤 {store.owner.name} ({store.owner.email})
                            </div>
                          ) : (
                            <div className="text-amber-400/80">⚠️ Belum ada STORE_OWNER</div>
                          )}
                          <div>WA: +{store.whatsapp}</div>

                          {/* Sales Attribution Badge */}
                          <div className="pt-0.5">
                            {store.salesPartner ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                                <Users className="w-3 h-3" />
                                Closing: {store.salesPartner.code} ({store.salesPartner.name})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                • Organik
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Subdomain / Domain */}
                      <td className="px-5 py-4">
                        <a
                          href={`/${store.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-mono text-xs flex items-center gap-1"
                        >
                          <span>{store.slug}.gadgetbdg.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {store.customDomain && (
                          <div className="text-[11px] text-purple-300 font-mono mt-1 font-semibold">
                            🌐 {store.customDomain}
                          </div>
                        )}
                      </td>

                      {/* Tier Selector */}
                      <td className="px-5 py-4">
                        <div className="relative inline-flex items-center">
                          <select
                            value={store.tier}
                            disabled={isLoading}
                            onChange={(e) =>
                              handleChangeTier(store, e.target.value as "STARTER" | "PRO" | "ADVANCE")
                            }
                            className={`appearance-none pl-2.5 pr-7 py-1 rounded-lg text-[10px] font-bold tracking-wide border transition focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 cursor-pointer ${
                              store.tier === "ADVANCE"
                                ? "bg-purple-950 text-purple-300 border-purple-800"
                                : store.tier === "PRO"
                                ? "bg-blue-950 text-blue-300 border-blue-800"
                                : "bg-slate-700 text-slate-300 border-slate-600"
                            }`}
                          >
                            <option value="STARTER">STARTER</option>
                            <option value="PRO">PRO</option>
                            <option value="ADVANCE">ADVANCE</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 pointer-events-none text-slate-400" />
                          {isLoading && loadingAction === "tier" && (
                            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400 absolute -right-5" />
                          )}
                        </div>
                      </td>

                      {/* Template */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700/80 text-slate-300">
                          {store.templateId}
                        </span>
                      </td>

                      {/* Masa Aktif Langganan */}
                      <td className="px-5 py-4">
                        {store.subscriptionExpiresAt ? (
                          <div className="space-y-1">
                            <span
                              className={`font-mono text-[11px] font-bold ${
                                isExpired ? "text-rose-400" : "text-emerald-400"
                              }`}
                            >
                              {new Date(store.subscriptionExpiresAt).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {isExpired && (
                              <div className="text-[10px] text-rose-500 font-semibold">Kadaluarsa</div>
                            )}
                            <div>
                              <button
                                onClick={() => setExtendModalStore(store)}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                              >
                                + Perpanjang
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-slate-400 font-mono text-[11px]">Selamanya</span>
                            <div>
                              <button
                                onClick={() => setExtendModalStore(store)}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-medium"
                              >
                                + Beri Masa Aktif
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Cooldown Tema */}
                      <td className="px-5 py-4">
                        {store.tier === "PRO" ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                cd.isCooling
                                  ? "bg-orange-950 text-orange-400 border border-orange-800"
                                  : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {cd.label}
                            </span>
                            {cd.isCooling && (
                              <button
                                onClick={() => handleResetCooldown(store)}
                                disabled={isLoading}
                                title="Reset cooldown template (Super Admin)"
                                className="w-6 h-6 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 flex items-center justify-center transition disabled:opacity-50"
                              >
                                {isLoading && loadingAction === "cooldown" ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3 h-3" />
                                )}
                              </button>
                            )}
                          </div>
                        ) : store.tier === "ADVANCE" ? (
                          <span className="text-[10px] text-emerald-400 font-semibold">Bebas</span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">N/A</span>
                        )}
                      </td>

                      {/* Unit HP */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-200">{store._count.products} Unit</span>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {store._count.tradeInOffers} Trade-in
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(store)}
                          disabled={isLoading && loadingAction === "toggle"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer hover:opacity-80 disabled:opacity-50 ${
                            store.isActive
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : "bg-rose-950 text-rose-400 border-rose-800"
                          }`}
                        >
                          {isLoading && loadingAction === "toggle" ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : store.isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{store.isActive ? "Aktif" : "Beku"}</span>
                        </button>
                      </td>

                      {/* Intervensi & Aksi */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Tombol Perpanjang Langganan */}
                          <button
                            onClick={() => setExtendModalStore(store)}
                            title="Perpanjang Langganan (+Hari)"
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-indigo-600/40 text-slate-300 hover:text-indigo-300 border border-slate-600 transition"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                          </button>

                          {/* Tombol Reset Password Owner */}
                          {store.owner && (
                            <button
                              onClick={() => {
                                setPwdModalStore(store);
                                setNewPassword("");
                              }}
                              title="Reset Password Pemilik Toko"
                              className="p-1.5 rounded-lg bg-slate-700 hover:bg-amber-600/40 text-slate-300 hover:text-amber-300 border border-slate-600 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Tombol Toggle Status Operasional */}
                          <button
                            onClick={() => handleToggleStatus(store)}
                            disabled={isLoading}
                            title={store.isActive ? "Bekukan Toko (Nonaktifkan)" : "Aktifkan Toko"}
                            className={`p-1.5 rounded-lg border transition disabled:opacity-50 ${
                              store.isActive
                                ? "bg-slate-700 hover:bg-rose-600/40 text-slate-300 hover:text-rose-300 border-slate-600"
                                : "bg-slate-700 hover:bg-emerald-600/40 text-slate-300 hover:text-emerald-300 border-slate-600"
                            }`}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Reset Password Owner */}
      {pwdModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setPwdModalStore(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-400" />
              Reset Password Owner
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Toko: <b className="text-white">{pwdModalStore.name}</b>
              <br />
              Email: <span className="font-mono text-slate-300">{pwdModalStore.owner?.email}</span>
            </p>
            <form onSubmit={handleConfirmResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password Baru:</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModalStore(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isResettingPwd}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isResettingPwd ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isResettingPwd ? "Mereset..." : "Reset Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Perpanjang Masa Aktif Langganan */}
      {extendModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setExtendModalStore(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <CalendarPlus className="w-4 h-4 text-indigo-400" />
              Perpanjang Langganan
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Toko: <b className="text-white">{extendModalStore.name}</b>
              <br />
              Masa Aktif Sekarang:{" "}
              <span className="font-mono text-emerald-400 font-bold">
                {extendModalStore.subscriptionExpiresAt
                  ? new Date(extendModalStore.subscriptionExpiresAt).toLocaleDateString("id-ID")
                  : "Selamanya / Belum Diset"}
              </span>
            </p>
            <form onSubmit={handleConfirmExtendSubscription} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tambahkan Masa Aktif:
                </label>
                <select
                  value={additionalDays}
                  onChange={(e) => setAdditionalDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value={7}>+7 Hari (1 Minggu Uji Coba)</option>
                  <option value={30}>+30 Hari (1 Bulan Standar)</option>
                  <option value={90}>+90 Hari (3 Bulan Paket Hemat)</option>
                  <option value={180}>+180 Hari (6 Bulan)</option>
                  <option value={365}>+365 Hari (1 Tahun Penuh)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExtendModalStore(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isExtendingSub}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isExtendingSub ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isExtendingSub ? "Menyimpan..." : "Perpanjang Sekarang"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
