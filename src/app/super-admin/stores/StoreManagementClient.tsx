"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Store,
  ExternalLink,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  Power,
} from "lucide-react";
import { toggleStoreActiveAction, cycleStoreTierAction } from "@/lib/actions";

interface StoreItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  templateId: string;
  isActive: boolean;
  address: string | null;
  createdAt: Date;
  _count: {
    products: number;
    tradeInOffers: number;
  };
}

export function StoreManagementClient({ initialStores }: { initialStores: StoreItem[] }) {
  const [stores, setStores] = useState<StoreItem[]>(initialStores);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
    const res = await toggleStoreActiveAction(store.id, store.isActive);
    setLoadingId(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, isActive: res.store!.isActive } : item))
      );
    } else {
      alert("Gagal mengubah status toko.");
    }
  }

  async function handleCycleTier(store: StoreItem) {
    setLoadingId(store.id);
    const res = await cycleStoreTierAction(store.id, store.tier);
    setLoadingId(null);

    if (res.success && res.store) {
      setStores((prev) =>
        prev.map((item) => (item.id === store.id ? { ...item, tier: res.store!.tier as any } : item))
      );
    } else {
      alert("Gagal mengupdate tier toko.");
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
            Atur status operasional, upgrade/downgrade tier paket, dan pantau katalog masing-masing tenant.
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
                <th className="px-5 py-4">Toko & Info</th>
                <th className="px-5 py-4">Subdomain & Custom Domain</th>
                <th className="px-5 py-4">Paket Tier</th>
                <th className="px-5 py-4">Template</th>
                <th className="px-5 py-4">Unit HP</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Aksi Cepat 1-Klik</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Tidak ada toko yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-750/50 transition">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{store.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        WA: {store.whatsapp} {store.address ? `• ${store.address}` : ""}
                      </div>
                    </td>

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
                        <div className="text-[11px] text-purple-300 font-mono mt-1 flex items-center gap-1">
                          <span>🌐 {store.customDomain}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleCycleTier(store)}
                        disabled={loadingId === store.id}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition flex items-center gap-1 shadow-sm ${
                          store.tier === "ADVANCE"
                            ? "bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900"
                            : store.tier === "PRO"
                            ? "bg-blue-950 text-blue-300 border border-blue-800 hover:bg-blue-900"
                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                        }`}
                        title="Klik untuk switch tier: STARTER -> PRO -> ADVANCE"
                      >
                        <Layers className="w-3 h-3" />
                        <span>{store.tier} (Klik Ganti)</span>
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700/80 text-slate-300">
                        {store.templateId}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-200">{store._count.products} Unit</span>
                      <div className="text-[10px] text-slate-400">
                        {store._count.tradeInOffers} Trade-in
                      </div>
                    </td>

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

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(store)}
                        disabled={loadingId === store.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                          store.isActive
                            ? "bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60"
                            : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60"
                        }`}
                        title="Toggle Status Toko"
                      >
                        <Power className="w-3 h-3" />
                        <span>{store.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
