"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Power,
  RefreshCw,
  Droplets,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  toggleStoreActiveAction,
  updateStoreTierAction,
  resetTemplateCooldownAction,
} from "@/lib/actions";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  templateId: string;
  hasWatermark: boolean;
  lastTemplateChangeAt: string | null; // ISO string (serialized from server)
  isActive: boolean;
  address: string | null;
  createdAt: string;
  _count: {
    products: number;
    tradeInOffers: number;
  };
}

function cooldownLabel(lastChangeAt: string | null): { label: string; isCooling: boolean } {
  if (!lastChangeAt) return { label: "Bebas", isCooling: false };
  const diffMs = Date.now() - new Date(lastChangeAt).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays >= 30) return { label: "Bebas", isCooling: false };
  const remaining = 30 - diffDays;
  return { label: `${remaining} hari`, isCooling: true };
}

export function StoreManagementClient({ initialStores }: { initialStores: StoreItem[] }) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const filteredStores = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.customDomain && s.customDomain.toLowerCase().includes(search.toLowerCase()));
    const matchTier = tierFilter === "ALL" || s.tier === tierFilter;
    return matchSearch && matchTier;
  });

  async function handleToggleActive(store: StoreItem) {
    setLoadingId(store.id);
    setLoadingAction("toggle");
    const res = await toggleStoreActiveAction(store.id, store.isActive);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, isActive: res.store!.isActive } : item))
      );
    } else {
      alert("Gagal mengubah status toko.");
    }
  }

  async function handleChangeTier(store: StoreItem, newTier: "STARTER" | "PRO" | "ADVANCE") {
    if (newTier === store.tier) return;
    setLoadingId(store.id);
    setLoadingAction("tier");
    const res = await updateStoreTierAction(store.id, newTier);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) =>
          item.id === store.id
            ? { ...item, tier: res.store!.tier as any, hasWatermark: res.store!.hasWatermark }
            : item
        )
      );
    } else {
      alert("Gagal mengubah tier toko.");
    }
  }

  async function handleResetCooldown(store: StoreItem) {
    if (!confirm(`Reset cooldown template untuk toko "${store.name}"?`)) return;
    setLoadingId(store.id);
    setLoadingAction("cooldown");
    const res = await resetTemplateCooldownAction(store.id);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success) {
      setStores((prev) =>
        prev.map((item) =>
          item.id === store.id ? { ...item, lastTemplateChangeAt: null } : item
        )
      );
    } else {
      alert("Gagal mereset cooldown.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Manajemen Toko Merchant</span>
            <span className="text-xs font-mono bg-slate-800 text-indigo-400 px-2 py-0.5 rounded-full border border-slate-700">
              {stores.length} Merchant
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Atur tier paket, status operasional, cooldown template, dan pantau katalog masing-masing tenant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari toko, subdomain, domain..."
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Tier</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ADVANCE">Advance</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-4">Toko &amp; Info</th>
                <th className="px-5 py-4">Subdomain / Domain</th>
                <th className="px-5 py-4">Paket Tier</th>
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Watermark</th>
                <th className="px-5 py-4">Cooldown Tema</th>
                <th className="px-5 py-4">Unit HP</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-500">
                    Tidak ada toko yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isLoading = loadingId === store.id;
                  const cd = cooldownLabel(store.lastTemplateChangeAt);

                  return (
                    <tr key={store.id} className="hover:bg-slate-750/50 transition">
                      {/* Toko & Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                            {store.name.charAt(0)}
                          </div>
                          <span>{store.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 pl-9">
                          WA: {store.whatsapp}
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
                          <div className="text-[11px] text-purple-300 font-mono mt-1">
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
                            className={`appearance-none pl-2.5 pr-7 py-1 rounded-lg text-[10px] font-bold tracking-wide border transition focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 ${
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

                      {/* Watermark Badge */}
                      <td className="px-5 py-4">
                        {store.hasWatermark ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                            <Droplets className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">–</span>
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
                        <div className="text-[10px] text-slate-400">
                          {store._count.tradeInOffers} Trade-in
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            store.isActive
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          }`}
                        >
                          {store.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Aktif
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Nonaktif
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleActive(store)}
                          disabled={isLoading}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ml-auto disabled:opacity-50 ${
                            store.isActive
                              ? "bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60"
                              : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60"
                          }`}
                          title="Toggle Status Toko"
                        >
                          {isLoading && loadingAction === "toggle" ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Power className="w-3 h-3" />
                          )}
                          <span>{store.isActive ? "Bekukan" : "Aktifkan"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
