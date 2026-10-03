"use client";

import { useState, useMemo } from "react";
import {
  Store,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  TrendingUp,
  Inbox,
  Filter,
} from "lucide-react";
import { StoreAdminListItem } from "@/lib/actions/store-management-actions";
import { StoreDetailDrawer } from "./StoreDetailDrawer";

function formatExpirySummary(iso: string | null) {
  if (!iso) return { text: "Tidak Aktif", isExpired: true };
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { text: "Kedaluwarsa", isExpired: true };
  if (diffDays > 25000) return { text: "Selamanya", isExpired: false };
  return { text: `${diffDays} hari lagi`, isExpired: false };
}

const tierBadgeStyles: Record<string, string> = {
  ADVANCE: "bg-purple-900/50 text-purple-300 border-purple-500/30",
  PRO: "bg-indigo-900/50 text-indigo-300 border-indigo-500/30",
  STARTER: "bg-slate-800 text-slate-300 border-slate-700",
};

export function StoreManagementClient({ initialStores }: { initialStores: StoreAdminListItem[] }) {
  const [stores, setStores] = useState<StoreAdminListItem[]>(initialStores);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [selectedStore, setSelectedStore] = useState<StoreAdminListItem | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered stores
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.slug.toLowerCase().includes(search.toLowerCase()) ||
        (s.customDomain && s.customDomain.toLowerCase().includes(search.toLowerCase())) ||
        (s.owner && s.owner.email.toLowerCase().includes(search.toLowerCase())) ||
        (s.owner && s.owner.name.toLowerCase().includes(search.toLowerCase())) ||
        (s.salesPartner && s.salesPartner.code.toLowerCase().includes(search.toLowerCase())) ||
        (s.salesPartner && s.salesPartner.name.toLowerCase().includes(search.toLowerCase()));

      const matchTier = tierFilter === "ALL" || s.tier === tierFilter;
      return matchSearch && matchTier;
    });
  }, [stores, search, tierFilter]);

  // Total pages
  const totalItems = filteredStores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Current page items
  const paginatedStores = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStores.slice(startIndex, startIndex + pageSize);
  }, [filteredStores, currentPage, pageSize]);

  // Handle store updated from drawer
  const handleStoreUpdated = (updatedStore: StoreAdminListItem) => {
    setStores((prev) =>
      prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
    );
    setSelectedStore(updatedStore);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleTierChange = (val: string) => {
    setTierFilter(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-indigo-400" /> Manajemen Toko Merchant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola status aktif/beku, tier paket, atribusi sales, dan masa aktif seluruh toko terdaftar.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari toko, owner, sales..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="relative w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
            <select
              value={tierFilter}
              onChange={(e) => handleTierChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none transition cursor-pointer"
            >
              <option value="ALL">Semua Paket</option>
              <option value="STARTER">STARTER</option>
              <option value="PRO">PRO</option>
              <option value="ADVANCE">ADVANCE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clean Master Table */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                <th className="py-3.5 px-4 sm:px-6 w-[36%]">Toko & Pemilik</th>
                <th className="py-3.5 px-4 w-[14%]">Paket Tier</th>
                <th className="py-3.5 px-4 w-[18%]">Masa Aktif</th>
                <th className="py-3.5 px-4 w-[12%]">Katalog</th>
                <th className="py-3.5 px-4 w-[10%]">Status</th>
                <th className="py-3.5 px-4 sm:px-6 w-[10%] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Inbox className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">Tidak ada toko yang sesuai dengan filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedStores.map((store) => {
                  const expiry = formatExpirySummary(store.subscriptionExpiresAt);
                  const tierStyle = tierBadgeStyles[store.tier] || tierBadgeStyles.STARTER;

                  return (
                    <tr
                      key={store.id}
                      onClick={() => setSelectedStore(store)}
                      className="hover:bg-slate-800/50 cursor-pointer transition group"
                    >
                      {/* 1. Toko & Pemilik */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0 mt-0.5 group-hover:bg-indigo-600/20 transition">
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-indigo-300 transition truncate">
                              {store.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="truncate">{store.slug}.gadgetbdg.com</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-400">
                                Owner: <strong className="text-slate-300">{store.owner?.name || "-"}</strong>
                              </span>
                              {store.salesPartner ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                                  <TrendingUp className="w-2.5 h-2.5" /> Closing: {store.salesPartner.code}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                  Organik
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Paket Tier */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase border ${tierStyle}`}
                        >
                          {store.tier}
                        </span>
                      </td>

                      {/* 3. Masa Aktif */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock
                            className={`w-3.5 h-3.5 shrink-0 ${
                              expiry.isExpired ? "text-red-400" : "text-amber-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-semibold ${
                              expiry.isExpired ? "text-red-400" : "text-slate-300"
                            }`}
                          >
                            {expiry.text}
                          </span>
                        </div>
                      </td>

                      {/* 4. Katalog */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-white">
                          {store._count?.products ?? 0}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1">Unit HP</span>
                      </td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            store.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              store.isActive ? "bg-emerald-400" : "bg-red-400"
                            }`}
                          />
                          {store.isActive ? "Aktif" : "Beku"}
                        </span>
                      </td>

                      {/* 6. Aksi (1 Tombol Jelas) */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStore(store);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition"
                        >
                          Kelola / Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="px-4 sm:px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            {totalItems > 0 ? (
              <>
                Menampilkan{" "}
                <span className="font-bold text-white">
                  {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                dari <span className="font-bold text-white">{totalItems}</span> Toko
              </>
            ) : (
              "0 Toko"
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-bold transition flex items-center justify-center ${
                  pageNum === currentPage
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 font-semibold hover:bg-slate-800 hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Selanjutnya
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <StoreDetailDrawer
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onStoreUpdated={handleStoreUpdated}
      />
    </div>
  );
}
