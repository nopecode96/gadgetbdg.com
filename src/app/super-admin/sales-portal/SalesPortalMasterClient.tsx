"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  Users,
  Store,
  Clock,
  CheckCircle2,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  RefreshCw,
  Power,
} from "lucide-react";
import Link from "next/link";
import {
  createSalesPartnerAction,
  toggleSalesPartnerStatusAction,
  payAllPendingCommissionsAction,
} from "@/lib/actions/sales-actions";

export interface MasterSalesPartnerItem {
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
  activeStoresCount: number;
  totalStoresCount: number;
  pendingCommission: number;
  paidCommission: number;
  estimatedNextMonth: number;
  createdAt: string;
}

export interface GlobalSalesMetrics {
  totalActiveSales: number;
  totalClientStores: number;
  totalPendingCommission: number;
  totalPaidCommission: number;
}

function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID");
}

export function SalesPortalMasterClient({
  initialPartners,
  metrics,
}: {
  initialPartners: MasterSalesPartnerItem[];
  metrics: GlobalSalesMetrics;
}) {
  const [partners, setPartners] = useState<MasterSalesPartnerItem[]>(initialPartners);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Copy referral link state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Create Sales Partner
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Quick Action Loading
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.referralCode.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search);

      const matchStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
          ? p.isActive
          : !p.isActive;

      return matchSearch && matchStatus;
    });
  }, [partners, search, statusFilter]);

  function handleCopyLink(code: string) {
    const link = `https://gadgetbdg.com?ref=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleToggleStatus(partnerId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    setActionLoadingId(`toggle-${partnerId}`);
    const res = await toggleSalesPartnerStatusAction(partnerId, nextStatus);
    setActionLoadingId(null);

    if (res.success) {
      setPartners((prev) =>
        prev.map((p) => (p.id === partnerId ? { ...p, isActive: nextStatus } : p))
      );
    } else {
      alert(res.error || "Gagal mengubah status mitra sales.");
    }
  }

  async function handleQuickPayout(partnerId: string, partnerName: string, pendingAmount: number) {
    if (
      !confirm(
        `Cairkan seluruh komisi ${formatRupiah(pendingAmount)} untuk mitra ${partnerName}? Pastikan dana telah ditransfer ke rekening sales.`
      )
    ) {
      return;
    }

    setActionLoadingId(`payout-${partnerId}`);
    const res = await payAllPendingCommissionsAction(partnerId);
    setActionLoadingId(null);

    if (res.success) {
      alert(res.message);
      // Update local state: move pending to paid
      setPartners((prev) =>
        prev.map((p) =>
          p.id === partnerId
            ? {
                ...p,
                paidCommission: p.paidCommission + p.pendingCommission,
                pendingCommission: 0,
              }
            : p
        )
      );
    } else {
      alert(res.error || "Gagal mencairkan komisi.");
    }
  }

  async function handleCreatePartner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: (formData.get("password") as string) || "Sales123!",
      phone: formData.get("phone") as string,
      referralCode: (formData.get("referralCode") as string) || undefined,
      bankName: (formData.get("bankName") as string) || undefined,
      bankAccount: (formData.get("bankAccount") as string) || undefined,
      bankHolder: (formData.get("bankHolder") as string) || undefined,
    };

    const res = await createSalesPartnerAction(payload);
    setModalLoading(false);

    if (res.success && res.partner) {
      alert(res.message);
      setIsModalOpen(false);
      window.location.reload();
    } else {
      setModalError(res.error || "Gagal mendaftarkan mitra sales.");
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span>Sales &amp; Affiliate Portal (Master View)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola mitra penjualan lapangan, lacak merchant binaan, dan verifikasi pencairan komisi berulang.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mitra Sales Baru</span>
        </button>
      </div>

      {/* 2. Global Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Aktif */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" /> Total Mitra Sales Aktif
          </span>
          <div className="text-3xl font-black text-white">{metrics.totalActiveSales} Mitra</div>
          <p className="text-[11px] text-slate-500">Terdaftar dalam jaringan affiliate</p>
        </div>

        {/* Total Toko Binaan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-indigo-400" /> Klien Binaan (Merchant)
          </span>
          <div className="text-3xl font-black text-indigo-400">{metrics.totalClientStores} Toko</div>
          <p className="text-[11px] text-slate-500">Mendaftar lewat link referral sales</p>
        </div>

        {/* Komisi Menunggu Pencairan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" /> Komisi Menunggu Pencairan
          </span>
          <div className="text-3xl font-black text-amber-400">
            {formatRupiah(metrics.totalPendingCommission)}
          </div>
          <p className="text-[11px] text-slate-500">Pending transfer ke rekening mitra</p>
        </div>

        {/* Komisi Telah Dicairkan */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Total Komisi Telah Dicairkan
          </span>
          <div className="text-3xl font-black text-emerald-400">
            {formatRupiah(metrics.totalPaidCommission)}
          </div>
          <p className="text-[11px] text-slate-500">Akumulasi pencairan lunas</p>
        </div>
      </div>

      {/* 3. Skema Komisi 2-Paket Baru Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <span className="font-bold text-white block">
              💰 Skema Komisi Berulang Bulanan Mitra Sales 2026:
            </span>
            <span className="text-slate-300 text-[11px]">
              Diterima sales setiap bulan selama toko binaan memperpanjang masa aktif.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-slate-400">Paket Starter (300rb): </span>
            <strong className="text-indigo-300">Rp 50.000 / bln</strong>
          </div>
          <div className="bg-slate-900/90 border border-indigo-500/40 px-3 py-1.5 rounded-xl font-mono text-xs">
            <span className="text-slate-400">Paket Pro (600rb): </span>
            <strong className="text-emerald-300">Rp 100.000 / bln</strong>
          </div>
        </div>
      </div>

      {/* 4. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama sales, kode referral, email, atau no WhatsApp..."
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "ALL"
                ? "bg-indigo-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Semua ({partners.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Aktif ({partners.filter((p) => p.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              statusFilter === "INACTIVE"
                ? "bg-rose-600 text-white"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Nonaktif ({partners.filter((p) => !p.isActive).length})
          </button>
        </div>
      </div>

      {/* 5. Master Table of Sales Partners */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold font-mono">
                <th className="py-3.5 px-4 sm:px-6 w-[22%]">Mitra Sales</th>
                <th className="py-3.5 px-4 w-[16%]">Kode &amp; Link Referral</th>
                <th className="py-3.5 px-4 w-[13%]">Kontak WhatsApp</th>
                <th className="py-3.5 px-4 w-[17%]">Info Rekening Bank</th>
                <th className="py-3.5 px-4 w-[10%]">Klien Toko</th>
                <th className="py-3.5 px-4 w-[12%]">Komisi</th>
                <th className="py-3.5 px-4 sm:px-6 w-[10%] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">Tidak ada mitra sales yang sesuai.</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const cleanWa = partner.phone.replace(/\D/g, "");
                  const isToggleLoading = actionLoadingId === `toggle-${partner.id}`;
                  const isPayoutLoading = actionLoadingId === `payout-${partner.id}`;
                  const isCopied = copiedCode === partner.referralCode;

                  return (
                    <tr
                      key={partner.id}
                      className="hover:bg-slate-800/50 transition group"
                    >
                      {/* 1. Mitra Sales (Nama, Email, Status Badge) */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5 group-hover:bg-emerald-600/20 transition">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white group-hover:text-emerald-300 transition flex items-center gap-1.5 truncate">
                              <span className="truncate">{partner.name}</span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                                  partner.isActive
                                    ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                                    : "bg-rose-950/80 text-rose-400 border-rose-500/30"
                                }`}
                              >
                                {partner.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                              {partner.email}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Gabung: {new Date(partner.createdAt).toLocaleDateString("id-ID")}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Kode & Link Referral */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-md font-mono font-extrabold text-[11px] bg-slate-950 border border-indigo-500/40 text-indigo-300">
                            {partner.referralCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(partner.referralCode)}
                            className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 font-mono transition cursor-pointer"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{isCopied ? "Link Disalin!" : "Salin Link Bio"}</span>
                          </button>
                        </div>
                      </td>

                      {/* 3. Kontak WhatsApp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <a
                          href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
                            partner.name
                          )},%20kami%20dari%20Tim%20Manajemen%20GadgetBdg`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/50 hover:bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-xs font-mono transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>+{cleanWa}</span>
                        </a>
                      </td>

                      {/* 4. Info Rekening Bank */}
                      <td className="py-3.5 px-4">
                        {partner.bankAccount ? (
                          <div className="space-y-0.5">
                            <div className="font-bold text-white text-xs">
                              {partner.bankName} - <span className="font-mono">{partner.bankAccount}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              a.n. {partner.bankHolder || partner.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Belum mengisi rekening</span>
                        )}
                      </td>

                      {/* 5. Toko Binaan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-sm font-bold text-white">
                            {partner.activeStoresCount}
                          </span>
                          <span className="text-slate-400 text-xs">/ {partner.totalStoresCount} Toko</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">Klien Aktif</span>
                      </td>

                      {/* 6. Akumulasi Komisi */}
                      <td className="py-3.5 px-4 whitespace-nowrap space-y-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Pending Transfer:</span>
                          <span className="font-mono font-bold text-xs text-amber-400">
                            {formatRupiah(partner.pendingCommission)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Telah Dicairkan:</span>
                          <span className="font-mono text-[11px] text-emerald-400">
                            {formatRupiah(partner.paidCommission)}
                          </span>
                        </div>
                      </td>

                      {/* 7. Aksi */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {partner.pendingCommission > 0 && (
                            <button
                              type="button"
                              disabled={isPayoutLoading}
                              onClick={() =>
                                handleQuickPayout(partner.id, partner.name, partner.pendingCommission)
                              }
                              title="Tandai seluruh komisi pending lunas ditransfer"
                              className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            >
                              {isPayoutLoading ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              <span>Cairkan</span>
                            </button>
                          )}

                          <Link
                            href={`/super-admin/sales-portal/${partner.id}`}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-indigo-600/20"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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

      {/* 6. Modal Tambah Mitra Sales Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Tambah Mitra Sales / Affiliate Baru</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Daftarkan akun sales baru untuk menerima komisi affiliate bulanan.
              </p>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Nama Lengkap Sales *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Contoh: Andi Pratama"
                  className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Email Login *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="sales.andi@gadgetbdg.com"
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="081234567890"
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Password Akun</label>
                  <input
                    type="text"
                    name="password"
                    defaultValue="Sales123!"
                    placeholder="Default: Sales123!"
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Kode Referral (Opsional)</label>
                  <input
                    type="text"
                    name="referralCode"
                    placeholder="Contoh: ANDI-BEC (Auto jika kosong)"
                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Rekening Info Section */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rekening Pencairan Komisi (Opsional)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nama Bank</label>
                    <input
                      type="text"
                      name="bankName"
                      placeholder="BCA / Mandiri / BRI"
                      className="w-full bg-slate-900 border border-slate-800 text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nomor Rekening</label>
                    <input
                      type="text"
                      name="bankAccount"
                      placeholder="1234567890"
                      className="w-full bg-slate-900 border border-slate-800 text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Atas Nama</label>
                    <input
                      type="text"
                      name="bankHolder"
                      placeholder="Nama pemilik rek."
                      className="w-full bg-slate-900 border border-slate-800 text-white px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {modalLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalLoading ? "Mendaftarkan..." : "Daftarkan Mitra Sales"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
