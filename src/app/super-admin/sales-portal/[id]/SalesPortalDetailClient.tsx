"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ExternalLink,
  Store,
  MessageSquare,
  Building,
  RefreshCw,
  Sparkles,
  CreditCard,
  Power,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  paySalesCommissionAction,
} from "@/lib/actions/saas-admin-actions";
import {
  toggleSalesPartnerStatusAction,
  payAllPendingCommissionsAction,
} from "@/lib/actions/sales-actions";

export interface DetailClientStore {
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

export interface DetailCommissionItem {
  id: string;
  amount: number;
  tier: "STARTER" | "PRO" | "ADVANCE" | string;
  status: "PENDING" | "PAID" | "CANCELLED";
  paidAt: string | null;
  createdAt: string;
  storeName: string;
  storeSlug: string;
}

export interface DetailSalesAgentData {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  bankName: string | null;
  bankAccount: string | null;
  bankHolder: string | null;
  isActive: boolean;
  clientStores: DetailClientStore[];
  commissions: DetailCommissionItem[];
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

export function SalesPortalDetailClient({
  agent,
}: {
  agent: DetailSalesAgentData;
}) {
  const [copied, setCopied] = useState(false);
  const [loadingPayoutId, setLoadingPayoutId] = useState<string | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [isActive, setIsActive] = useState(agent.isActive);

  // Commissions state for local update
  const [commissions, setCommissions] = useState<DetailCommissionItem[]>(agent.commissions);

  const referralLink = `https://gadgetbdg.com?ref=${agent.referralCode}`;
  const cleanPhone = agent.phone.replace(/\D/g, "");

  const totalClients = agent.clientStores.length;
  const activeClients = agent.clientStores.filter((s) => s.isActive).length;

  const pendingCommissions = commissions.filter((c) => c.status === "PENDING");
  const paidCommissions = commissions.filter((c) => c.status === "PAID");

  const totalPendingAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaidAmount = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Estimasi komisi bulan depan dari toko-toko aktif
  const estimatedNextMonth = agent.clientStores
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.monthlyCommission, 0);

  function handleCopy() {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleToggleStatus() {
    const nextStatus = !isActive;
    setStatusLoading(true);
    const res = await toggleSalesPartnerStatusAction(agent.id, nextStatus);
    setStatusLoading(false);

    if (res.success) {
      setIsActive(nextStatus);
    } else {
      alert(res.error || "Gagal mengubah status mitra sales.");
    }
  }

  async function handleSinglePayout(commissionId: string) {
    if (!confirm("Tandai komisi ini sudah ditransfer ke rekening sales partner?")) return;
    setLoadingPayoutId(commissionId);
    const res = await paySalesCommissionAction(commissionId);
    setLoadingPayoutId(null);

    if (res.success) {
      alert(res.message);
      setCommissions((prev) =>
        prev.map((c) =>
          c.id === commissionId
            ? { ...c, status: "PAID", paidAt: new Date().toISOString() }
            : c
        )
      );
    } else {
      alert(res.error || "Gagal memperbarui status komisi.");
    }
  }

  async function handleBatchPayout() {
    if (
      !confirm(
        `Cairkan seluruh komisi ${formatRupiah(totalPendingAmount)} untuk mitra ${agent.name}? Pastikan dana telah ditransfer ke rekening sales.`
      )
    ) {
      return;
    }

    setBatchLoading(true);
    const res = await payAllPendingCommissionsAction(agent.id);
    setBatchLoading(false);

    if (res.success) {
      alert(res.message);
      setCommissions((prev) =>
        prev.map((c) =>
          c.status === "PENDING"
            ? { ...c, status: "PAID", paidAt: new Date().toISOString() }
            : c
        )
      );
    } else {
      alert(res.error || "Gagal mencairkan seluruh komisi.");
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <Link
            href="/super-admin"
            className="hover:text-white transition"
          >
            Super Admin
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <Link
            href="/super-admin/sales-portal"
            className="hover:text-white transition"
          >
            Sales Portal
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-emerald-400 font-bold">{agent.name}</span>
        </div>

        <Link
          href="/super-admin/sales-portal"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Master Sales</span>
        </Link>
      </div>

      {/* 2. Personal Header Card */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                MITRA SALES PARTNER
              </span>
              <span className="text-xs text-slate-400 font-mono">
                KODE: <strong className="text-indigo-300 font-bold">{agent.referralCode}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                  isActive
                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                    : "bg-rose-950/80 text-rose-400 border-rose-500/30"
                }`}
              >
                {isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Halo, {agent.name}! 🚀
            </h1>
            <p className="text-xs text-slate-300">
              Email: <span className="font-mono text-slate-200">{agent.email}</span> • WhatsApp:{" "}
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-mono"
              >
                +{cleanPhone}
              </a>
            </p>
          </div>

          {/* Quick Actions & Rekening Info */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Rekening Info */}
            {agent.bankAccount ? (
              <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-1 shrink-0">
                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-emerald-400" /> Rekening Pencairan:
                </span>
                <div className="font-bold text-white font-mono">
                  {agent.bankName} - {agent.bankAccount}
                </div>
                <div className="text-slate-400 text-[11px]">a.n. {agent.bankHolder || agent.name}</div>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl text-xs text-slate-500 italic shrink-0">
                Belum mengisi rekening bank
              </div>
            )}

            {/* Toggle Status Button */}
            <button
              type="button"
              disabled={statusLoading}
              onClick={handleToggleStatus}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                isActive
                  ? "bg-slate-950 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border-slate-800 hover:border-rose-800"
                  : "bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800"
              }`}
            >
              {statusLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className="w-3.5 h-3.5" />
              )}
              <span>{isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}</span>
            </button>
          </div>
        </div>

        {/* Link Referral Box */}
        <div className="bg-slate-950/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Tautan Referral Pribadi Mitra
            </span>
            <div className="font-mono text-xs sm:text-sm text-indigo-300 font-semibold truncate max-w-lg">
              {referralLink}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Disalin!" : "Salin Link Partner"}</span>
          </button>
        </div>
      </div>

      {/* 3. KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Klien Binaan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-400" /> Klien Aktif Binaan
          </span>
          <div className="text-3xl font-black text-white">{activeClients} Toko</div>
          <p className="text-[11px] text-slate-500">Total terdaftar: {totalClients} toko</p>
        </div>

        {/* Komisi Menunggu Transfer */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Komisi Menunggu Transfer
          </span>
          <div className="text-3xl font-black text-amber-400">{formatRupiah(totalPendingAmount)}</div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-500">{pendingCommissions.length} komisi pending</p>
            {totalPendingAmount > 0 && (
              <button
                type="button"
                disabled={batchLoading}
                onClick={handleBatchPayout}
                className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {batchLoading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span>Cairkan Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Komisi Telah Dicairkan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Komisi Telah Dicairkan
          </span>
          <div className="text-3xl font-black text-emerald-400">{formatRupiah(totalPaidAmount)}</div>
          <p className="text-[11px] text-slate-500">{paidCommissions.length} kali pencairan sukses</p>
        </div>

        {/* Estimasi Komisi Bulan Depan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Estimasi Komisi Bulan Depan
          </span>
          <div className="text-3xl font-black text-sky-400">{formatRupiah(estimatedNextMonth)}</div>
          <p className="text-[11px] text-slate-500">Jika semua klien aktif memperpanjang</p>
        </div>
      </div>

      {/* 4. Skema Komisi 2-Paket Baru Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="font-semibold text-white">💰 Skema Komisi Berulang Bulanan 2026:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            Starter (Rp 300rb): <strong className="text-indigo-400">Rp 50.000 / bln</strong>
          </span>
          <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            Pro (Rp 600rb): <strong className="text-emerald-400">Rp 100.000 / bln</strong>
          </span>
        </div>
      </div>

      {/* 5. Tabel 1: Daftar Toko Merchant Klien Binaan */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              <span>Daftar Toko Klien Binaan ({agent.clientStores.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Merchant yang mendaftar melalui kode referral <b>{agent.referralCode}</b>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Nama Toko &amp; URL</th>
                <th className="px-5 py-3">Tier Paket</th>
                <th className="px-5 py-3">Nilai Komisi / Bln</th>
                <th className="px-5 py-3">Status Langganan</th>
                <th className="px-5 py-3">Bergabung Pada</th>
                <th className="px-5 py-3 text-right">Kontak WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {agent.clientStores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Belum ada toko yang mendaftar melalui referral mitra ini.
                  </td>
                </tr>
              ) : (
                agent.clientStores.map((store) => {
                  const cleanStoreWa = store.whatsapp.replace(/\D/g, "");
                  return (
                    <tr key={store.id} className="hover:bg-slate-800/50 transition">
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
                              : "bg-slate-800 text-slate-300 border-slate-700"
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

                      <td className="px-5 py-3.5 text-right">
                        {cleanStoreWa && (
                          <a
                            href={`https://wa.me/${cleanStoreWa}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 border border-slate-800 text-[11px] font-mono transition"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WA</span>
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Tabel 2: Riwayat Komisi Transaksi Tagihan */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Riwayat Komisi Transaksi Tagihan ({commissions.length})</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Log pembayaran tagihan langganan merchant yang menghasilkan komisi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">Toko &amp; Paket</th>
                <th className="px-5 py-3">Besaran Komisi</th>
                <th className="px-5 py-3">Status Pencairan</th>
                <th className="px-5 py-3">Tanggal Tagihan</th>
                <th className="px-5 py-3 text-right">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    Belum ada catatan komisi untuk mitra sales ini.
                  </td>
                </tr>
              ) : (
                commissions.map((comm) => {
                  const isLoading = loadingPayoutId === comm.id;
                  return (
                    <tr key={comm.id} className="hover:bg-slate-800/50 transition">
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

                      <td className="px-5 py-3.5 text-right">
                        {comm.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleSinglePayout(comm.id)}
                            disabled={isLoading}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-bold transition inline-flex items-center gap-1 shadow-sm cursor-pointer"
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
