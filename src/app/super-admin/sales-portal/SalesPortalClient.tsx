"use client";

import { useState } from "react";
import {
  Users,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  Store,
  Layers,
  Search,
  RefreshCw,
  CreditCard,
  Building,
} from "lucide-react";
import { paySalesCommissionAction } from "@/lib/actions";

interface ClientStore {
  id: string;
  name: string;
  slug: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  isActive: boolean;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  whatsapp: string;
  monthlyCommission: number;
}

interface CommissionItem {
  id: string;
  amount: number;
  tier: "STARTER" | "PRO" | "ADVANCE";
  status: "PENDING" | "PAID";
  paidAt: string | null;
  createdAt: string;
  storeName: string;
  storeSlug: string;
}

interface SalesAgentData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
  clientStores: ClientStore[];
  commissions: CommissionItem[];
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function SalesPortalClient({
  agent,
  allAgents,
  isSuperAdmin,
}: {
  agent?: SalesAgentData;
  allAgents?: SalesAgentData[];
  isSuperAdmin: boolean;
}) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    agent?.id || (allAgents && allAgents.length > 0 ? allAgents[0].id : "")
  );
  const [copied, setCopied] = useState(false);
  const [loadingPayoutId, setLoadingPayoutId] = useState<string | null>(null);

  // Active viewed agent
  const currentAgent =
    allAgents && allAgents.length > 0
      ? allAgents.find((a) => a.id === selectedAgentId) || allAgents[0]
      : agent;

  if (!currentAgent) {
    return (
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 text-center text-slate-400">
        Belum ada akun Sales Agent yang terdaftar di platform.
      </div>
    );
  }

  const referralLink = `https://gadgetbdg.com?ref=${currentAgent.referralCode}`;

  const totalClients = currentAgent.clientStores.length;
  const activeClients = currentAgent.clientStores.filter((s) => s.isActive).length;

  const pendingCommissions = currentAgent.commissions.filter((c) => c.status === "PENDING");
  const paidCommissions = currentAgent.commissions.filter((c) => c.status === "PAID");

  const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidAmount = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Estimasi komisi bulan depan dari toko-toko aktif
  const estimatedNextMonth = currentAgent.clientStores
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.monthlyCommission, 0);

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePayout(commissionId: string) {
    if (!confirm("Tandai komisi ini sudah ditransfer ke rekening sales partner?")) return;
    setLoadingPayoutId(commissionId);
    const res = await paySalesCommissionAction(commissionId);
    setLoadingPayoutId(null);

    if (res.success) {
      alert(res.message);
      // Reload page to refresh state
      window.location.reload();
    } else {
      alert(res.error || "Gagal memperbarui status komisi.");
    }
  }

  return (
    <div className="space-y-8">
      {/* Super Admin Switcher (Jika diakses Super Admin) */}
      {isSuperAdmin && allAgents && allAgents.length > 1 && (
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Pilih Partner Sales:</span>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            >
              {allAgents.map((ag) => (
                <option key={ag.id} value={ag.id}>
                  {ag.name} ({ag.referralCode}) - {ag.email}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Mode Tinjauan Super Admin</span>
        </div>
      )}

      {/* Header Info & Referral Link Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                SALES PARTNER DASHBOARD
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {currentAgent.referralCode}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Halo, {currentAgent.name}! 🚀
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Bagikan link referral Anda ke calon pemilik konter HP bekas. Dapatkan komisi berulang setiap bulan!
            </p>
          </div>

          {/* Rekening Info */}
          {currentAgent.bankNumber && (
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-xs space-y-0.5 sm:text-right shrink-0">
              <span className="text-slate-400 text-[10px] block">Rekening Pencairan Komisi:</span>
              <div className="font-bold text-white">
                {currentAgent.bankName} - {currentAgent.bankNumber}
              </div>
              <div className="text-slate-400 text-[11px]">a.n. {currentAgent.bankHolder}</div>
            </div>
          )}
        </div>

        {/* Link Referral Box */}
        <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Tautan Referral Pribadi
            </span>
            <div className="font-mono text-xs sm:text-sm text-indigo-300 font-semibold truncate max-w-lg">
              {referralLink}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Disalin!" : "Salin Link Partner"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-400" /> Klien Aktif Binaan
          </span>
          <div className="text-3xl font-black text-white">{activeClients} Toko</div>
          <p className="text-[11px] text-slate-400">Total terdaftar: {totalClients} toko</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Komisi Menunggu Transfer
          </span>
          <div className="text-3xl font-black text-amber-400">{formatRupiah(totalPendingAmount)}</div>
          <p className="text-[11px] text-slate-400">{pendingCommissions.length} tagihan diverifikasi</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Komisi Telah Dicairkan
          </span>
          <div className="text-3xl font-black text-emerald-400">{formatRupiah(totalPaidAmount)}</div>
          <p className="text-[11px] text-slate-400">{paidCommissions.length} kali pencairan</p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Estimasi Komisi Bulan Depan
          </span>
          <div className="text-3xl font-black text-sky-400">{formatRupiah(estimatedNextMonth)}</div>
          <p className="text-[11px] text-slate-400">Jika semua klien aktif memperpanjang</p>
        </div>
      </div>

      {/* Skema Komisi Info Box */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
        <span className="font-semibold text-white">💰 Skema Komisi Berulang Bulanan:</span>
        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <span>Starter (250rb): <strong className="text-indigo-400">Rp 50.000/bln</strong></span>
          <span>Pro (600rb): <strong className="text-blue-400">Rp 100.000/bln</strong></span>
          <span>Advance (1jt): <strong className="text-purple-400">Rp 150.000/bln</strong></span>
        </div>
      </div>

      {/* Tabel 1: Daftar Toko Merchant Klien */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Daftar Toko Klien Binaan ({currentAgent.clientStores.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Merchant yang mendaftar melalui kode referral Anda
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-3">Nama Toko &amp; URL</th>
                <th className="px-5 py-3">Tier Paket</th>
                <th className="px-5 py-3">Nilai Komisi / Bln</th>
                <th className="px-5 py-3">Status Langganan</th>
                <th className="px-5 py-3">Bergabung Pada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {currentAgent.clientStores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Belum ada toko yang mendaftar melalui referral Anda. Bagikan link referral Anda sekarang!
                  </td>
                </tr>
              ) : (
                currentAgent.clientStores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-750/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white text-sm">{store.name}</div>
                      <a
                        href={`https://${store.slug}.gadgetbdg.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono inline-flex items-center gap-1"
                      >
                        <span>{store.slug}.gadgetbdg.com</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          store.tier === "ADVANCE"
                            ? "bg-purple-950 text-purple-300 border-purple-800"
                            : store.tier === "PRO"
                            ? "bg-blue-950 text-blue-300 border-blue-800"
                            : "bg-slate-700 text-slate-300 border-slate-600"
                        }`}
                      >
                        {store.tier}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono">
                      +{formatRupiah(store.monthlyCommission)}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          store.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {store.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(store.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabel 2: Riwayat Log Komisi Transaksi */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Riwayat Komisi Transaksi Tagihan ({currentAgent.commissions.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Log pembayaran tagihan langganan merchant yang menghasilkan komisi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-3">Toko &amp; Paket</th>
                <th className="px-5 py-3">Besaran Komisi</th>
                <th className="px-5 py-3">Status Pencairan</th>
                <th className="px-5 py-3">Tanggal Tagihan</th>
                {isSuperAdmin && <th className="px-5 py-3 text-right">Aksi Super Admin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {currentAgent.commissions.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 5 : 4} className="px-5 py-10 text-center text-slate-500">
                    Belum ada catatan komisi. Komisi akan otomatis muncul saat pembayaran toko disetujui.
                  </td>
                </tr>
              ) : (
                currentAgent.commissions.map((comm) => {
                  const isLoading = loadingPayoutId === comm.id;
                  return (
                    <tr key={comm.id} className="hover:bg-slate-750/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{comm.storeName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Paket {comm.tier}</span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono text-sm">
                        {formatRupiah(comm.amount)}
                      </td>

                      <td className="px-5 py-3.5">
                        {comm.status === "PAID" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Lunas Ditransfer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                            <Clock className="w-3 h-3" /> Menunggu Transfer
                          </span>
                        )}
                        {comm.paidAt && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Cair: {new Date(comm.paidAt).toLocaleDateString("id-ID")}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {new Date(comm.createdAt).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {isSuperAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          {comm.status === "PENDING" && (
                            <button
                              onClick={() => handlePayout(comm.id)}
                              disabled={isLoading}
                              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold transition inline-flex items-center gap-1 shadow-sm"
                            >
                              {isLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span>Tandai Ditransfer</span>
                            </button>
                          )}
                        </td>
                      )}
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
