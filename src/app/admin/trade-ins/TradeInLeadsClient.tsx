"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  RefreshCw,
  DollarSign,
  User,
  Phone,
  Smartphone,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ShoppingBag,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import {
  updateTradeInLeadStatusAction,
  deleteTradeInLeadAction,
} from "@/lib/actions/tradein-actions";

export interface TradeInLeadItem {
  id: string;
  storeId: string;
  type: "TRADE_IN" | "SELL_ONLY";
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  condition: string;
  completeness: string;
  notes?: string | null;
  pricingType: "APPRAISAL_REQUEST" | "EXPECTED_PRICE";
  expectedPrice?: number | null;
  targetProductId?: string | null;
  targetProductTitle?: string | null;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  status: string; // PENDING, FOLLOW_UP, DEAL, CANCELLED, CONTACTED, REJECTED
  adminNotes?: string | null;
  createdAt: string;
  source: "lead" | "legacy_offer";
}

interface TradeInLeadsClientProps {
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
  };
  initialLeads: TradeInLeadItem[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Menunggu Follow-up",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  FOLLOW_UP: {
    label: "Sedang Dihubungi",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  CONTACTED: {
    label: "Sedang Dihubungi",
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  DEAL: {
    label: "Deal / Selesai COD",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  CANCELLED: {
    label: "Batal / Tidak Deal",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
  REJECTED: {
    label: "Batal / Ditolak",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export function TradeInLeadsClient({ store, initialLeads }: TradeInLeadsClientProps) {
  const [leads, setLeads] = useState<TradeInLeadItem[]>(initialLeads);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Master-Detail Drawer State
  const [selectedLead, setSelectedLead] = useState<TradeInLeadItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLeads = leads.filter((item) => {
    const matchType = filterType === "ALL" || item.type === filterType;
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && item.status === "PENDING") ||
      (filterStatus === "FOLLOW_UP" &&
        (item.status === "FOLLOW_UP" || item.status === "CONTACTED")) ||
      (filterStatus === "DEAL" && item.status === "DEAL") ||
      (filterStatus === "CANCELLED" &&
        (item.status === "CANCELLED" || item.status === "REJECTED"));

    const query = search.toLowerCase();
    const matchSearch =
      item.customerName.toLowerCase().includes(query) ||
      item.customerPhone.includes(query) ||
      item.deviceModel.toLowerCase().includes(query) ||
      (item.targetProductTitle || "").toLowerCase().includes(query);

    return matchType && matchStatus && matchSearch;
  });

  const handleOpenDrawer = (lead: TradeInLeadItem) => {
    setSelectedLead(lead);
    setAdminNotesInput(lead.adminNotes || "");
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedLead(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedLead || isUpdatingStatus) return;
    setIsUpdatingStatus(true);

    try {
      const res = await updateTradeInLeadStatusAction(
        selectedLead.id,
        newStatus,
        adminNotesInput.trim() || undefined
      );

      if (res.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLead.id
              ? { ...l, status: newStatus, adminNotes: adminNotesInput.trim() || null }
              : l
          )
        );
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      } else {
        alert(res.error || "Gagal memperbarui status.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead || isSavingNotes) return;
    setIsSavingNotes(true);

    try {
      const res = await updateTradeInLeadStatusAction(
        selectedLead.id,
        selectedLead.status,
        adminNotesInput.trim()
      );
      if (res.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === selectedLead.id ? { ...l, adminNotes: adminNotesInput.trim() } : l
          )
        );
        alert("Catatan kasir berhasil disimpan.");
      } else {
        alert(res.error || "Gagal menyimpan catatan.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead || isDeleting) return;
    if (!confirm(`Yakin ingin menghapus data leads dari ${selectedLead.customerName}?`)) return;

    setIsDeleting(true);
    try {
      const res = await deleteTradeInLeadAction(selectedLead.id);
      if (res.success) {
        setLeads((prev) => prev.filter((l) => l.id !== selectedLead.id));
        handleCloseDrawer();
      } else {
        alert(res.error || "Gagal menghapus.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Build direct WhatsApp URL to customer
  const getCustomerWhatsAppUrl = (lead: TradeInLeadItem) => {
    let cleanPhone = lead.customerPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);

    const typeText = lead.type === "TRADE_IN" ? "tukar tambah" : "jual unit";
    const greeting = encodeURIComponent(
      `Halo Kak ${lead.customerName}, kami dari tim admin/kasir *${store.name}*.\n\n` +
        `Mengenai pengajuan *${typeText}* untuk unit *${lead.deviceModel}* yang diajukan di website kami, ` +
        `apakah unitnya masih ada dan siap kami taksir / jadwalkan cek fisik di konter hari ini?`
    );

    return `https://wa.me/${cleanPhone}?text=${greeting}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Title Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Inbox Leads Tukar Tambah &amp; Jual HP
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Follow-up penawaran HP pengunjung etalase toko secara realtime via WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Leads: <strong className="text-slate-800">{leads.length}</strong>
          </span>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, nomor WA, atau tipe HP..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Filter Type */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {[
              { id: "ALL", label: "Semua Tipe" },
              { id: "TRADE_IN", label: "Tukar Tambah" },
              { id: "SELL_ONLY", label: "Jual HP" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilterType(t.id)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  filterType === t.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Filter Status */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {[
              { id: "ALL", label: "Semua" },
              { id: "PENDING", label: "Pending" },
              { id: "FOLLOW_UP", label: "Follow-up" },
              { id: "DEAL", label: "Deal" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilterStatus(s.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition ${
                  filterStatus === s.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Leads Table List (Master View) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs space-y-1">
              <p>Belum ada data leads penawaran yang sesuai filter.</p>
              <p className="text-[11px] text-slate-300">
                Pengunjung etalase yang mengisi form Trade-In akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            filteredLeads.map((item) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
              const isTradeIn = item.type === "TRADE_IN";

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDrawer(item)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-blue-50/40 cursor-pointer transition group"
                >
                  {/* Left: Customer Info & Device */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Badge Icon Type */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isTradeIn
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-emerald-50 border-emerald-200 text-emerald-600"
                      }`}
                    >
                      {isTradeIn ? (
                        <RefreshCw className="w-5 h-5" />
                      ) : (
                        <DollarSign className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                            isTradeIn
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isTradeIn ? "Tukar Tambah" : "Jual HP Saja"}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                          {item.customerName}
                        </h3>
                        <span className="text-xs text-slate-400 font-mono">
                          ({item.customerPhone})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-slate-800">
                          HP Lama: {item.deviceModel}
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded text-[10px]">
                          {item.condition}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] text-slate-500">
                          {item.completeness}
                        </span>
                      </div>

                      {/* Target Unit & Pricing */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 pt-0.5">
                        {isTradeIn && (
                          <span className="text-blue-700 font-medium">
                            Mau tukar ke:{" "}
                            <strong>
                              {item.targetProductTitle || "Konsultasi Pilihan"}
                            </strong>
                          </span>
                        )}
                        {item.expectedPrice ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Target: {formatRupiah(item.expectedPrice)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">
                            Minta taksiran admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Quick Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      {cfg.label}
                    </span>

                    <a
                      href={getCustomerWhatsAppUrl(item)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition"
                      title="Chat WhatsApp Customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-current" />
                      <span>Chat WA</span>
                    </a>

                    <div className="text-slate-300 group-hover:text-blue-500 transition pl-1">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Slide-over Master-Detail Drawer ── */}
      {isDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseDrawer}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
              {/* Header Drawer */}
              <div className="px-6 py-4 border-b border-slate-200/90 flex items-center justify-between bg-slate-50/70 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      selectedLead.type === "TRADE_IN"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {selectedLead.type === "TRADE_IN"
                      ? "Tukar Tambah"
                      : "Jual HP Langsung"}
                  </span>
                  <span className="text-xs text-slate-500">
                    ID: #{selectedLead.id.slice(-6)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Detail Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs">
                {/* Customer Profile */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Data Pengunjung / Pelanggan
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(selectedLead.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedLead.customerName}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-bold text-slate-800">
                      {selectedLead.customerPhone}
                    </span>
                  </div>
                </div>

                {/* Status Follow-up Buttons */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">
                      Status Follow-up Transaksi:
                    </span>
                    {isUpdatingStatus && (
                      <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "PENDING", label: "Pending" },
                      { id: "FOLLOW_UP", label: "Follow-up" },
                      { id: "DEAL", label: "Deal Selesai" },
                    ].map((st) => {
                      const isActive =
                        selectedLead.status === st.id ||
                        (st.id === "FOLLOW_UP" && selectedLead.status === "CONTACTED");
                      return (
                        <button
                          key={st.id}
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() => handleStatusChange(st.id)}
                          className={`py-2 px-3 rounded-xl font-bold text-xs transition border flex items-center justify-center ${
                            isActive
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs font-black"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* HP Lama Spesifikasi */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    <span>Rincian HP Lama yang Ditawarkan</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Tipe Perangkat
                      </span>
                      <div className="font-black text-slate-900 text-sm mt-0.5">
                        {selectedLead.deviceModel}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Kondisi Fisik
                      </span>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedLead.condition}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Kelengkapan
                      </span>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {selectedLead.completeness}
                      </div>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Catatan Kejujuran Minus / BH dari Pelanggan:
                      </span>
                      <p className="leading-relaxed">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>

                {/* Ekspektasi Harga & Target Unit */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Ekspektasi Valuasi &amp; Tukar Unit</span>
                  </h4>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Target Harga Pelanggan:</span>
                      <span className="font-black text-slate-900 text-sm">
                        {selectedLead.expectedPrice
                          ? formatRupiah(selectedLead.expectedPrice)
                          : "Minta taksiran admin"}
                      </span>
                    </div>

                    {selectedLead.type === "TRADE_IN" && (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">Mau Tukar ke:</span>
                        <span className="font-bold text-blue-700">
                          {selectedLead.targetProductTitle || "Belum Menentukan"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catatan Internal Kasir / Admin */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Catatan Internal Kasir:</span>
                    </label>
                    <button
                      type="button"
                      disabled={isSavingNotes}
                      onClick={handleSaveNotes}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>{isSavingNotes ? "Menyimpan..." : "Simpan Catatan"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                    placeholder="Contoh: Sudah nego di harga 4.2jt, janji datang ke konter jam 16.00 WIB..."
                    className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 resize-none text-xs"
                  />
                </div>
              </div>

              {/* Fixed Footer Actions */}
              <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
                <a
                  href={getCustomerWhatsAppUrl(selectedLead)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat WhatsApp Sekarang</span>
                </a>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteLead}
                  className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                  title="Hapus Lead"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
