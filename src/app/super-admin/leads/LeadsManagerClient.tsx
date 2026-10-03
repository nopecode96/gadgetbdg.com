"use client";

import { useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Store,
  CreditCard,
  AlertCircle,
  Clock,
  Trash2,
  Search,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  activateLeadDirectlyAction,
  deleteLeadAction,
  LeadStoreItem,
} from "@/lib/actions/leads-actions";

function formatRupiah(n: number) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadsManagerClient({
  initialLeads,
  initialCount,
}: {
  initialLeads: LeadStoreItem[];
  initialCount: number;
}) {
  const [leads, setLeads] = useState<LeadStoreItem[]>(initialLeads);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filtered = leads.filter((item) => {
    const matchTier = filterTier === "ALL" || item.tier === filterTier;
    const q = search.toLowerCase();
    const matchSearch =
      item.name.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      item.whatsapp.includes(q) ||
      (item.owner && item.owner.name.toLowerCase().includes(q)) ||
      (item.owner && item.owner.email.toLowerCase().includes(q)) ||
      (item.salesPartner && item.salesPartner.code.toLowerCase().includes(q)) ||
      (item.salesPartner && item.salesPartner.name.toLowerCase().includes(q));

    return matchTier && matchSearch;
  });

  async function handleDirectActivate(lead: LeadStoreItem) {
    const isConfirm = window.confirm(
      `Aktivasi langsung toko "${lead.name}" (${lead.tier}) selama 30 hari?\n\nToko dan dashboard merchant akan langsung aktif tanpa menunggu verifikasi manual transfer.`
    );
    if (!isConfirm) return;

    setLoadingId(lead.id);
    setLoadingAction("activate");
    setToast(null);

    const res = await activateLeadDirectlyAction(lead.id, 30);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success) {
      setToast({ type: "success", message: res.message || "Toko berhasil diaktifkan langsung!" });
      setLeads((prev) => prev.filter((s) => s.id !== lead.id));
    } else {
      setToast({ type: "error", message: res.error || "Gagal mengaktifkan toko." });
    }
  }

  async function handleDeleteLead(lead: LeadStoreItem) {
    const isConfirm = window.confirm(
      `Hapus calon toko "${lead.name}" dari pipeline leads?\nTindakan ini akan membatalkan pendaftaran dan menghapus akun calon toko.`
    );
    if (!isConfirm) return;

    setLoadingId(lead.id);
    setLoadingAction("delete");
    setToast(null);

    const res = await deleteLeadAction(lead.id);
    setLoadingId(null);
    setLoadingAction(null);

    if (res.success) {
      setToast({ type: "success", message: res.message || "Pendaftaran berhasil dihapus." });
      setLeads((prev) => prev.filter((s) => s.id !== lead.id));
    } else {
      setToast({ type: "error", message: res.error || "Gagal menghapus calon toko." });
    }
  }

  function getWhatsAppFollowUpLink(lead: LeadStoreItem) {
    const ownerName = lead.owner ? lead.owner.name : lead.name;
    const cleanWa = lead.whatsapp.replace(/\D/g, "");
    const targetWa = cleanWa.startsWith("0") ? `62${cleanWa.slice(1)}` : cleanWa.startsWith("62") ? cleanWa : `62${cleanWa}`;

    const msg = encodeURIComponent(
      `Halo Kak ${ownerName} dari *${lead.name}*!\n\n` +
      `Terima kasih telah mendaftarkan toko gadget Anda di GadgetBdg.com dengan paket *${lead.tier}*.\n\n` +
      `Apakah ada kendala dalam proses transfer atau aktivasi website Anda?\n\n` +
      `Kami siap membantu agar katalog HP online *${lead.name}* bisa langsung tayang hari ini di:\n` +
      `https://${lead.slug}.gadgetbdg.com\n\n` +
      `Salam hangat,\nTim Support GadgetBdg.com`
    );
    return `https://wa.me/${targetWa}?text=${msg}`;
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              ACTIVATION PIPELINE
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PostgreSQL Multi-Tenant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Calon Klien &amp; Pipeline Aktivasi</span>
            <span className="text-xs font-mono bg-sky-950 text-sky-400 px-2.5 py-1 rounded-full border border-sky-800">
              {leads.length} Menunggu
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar pendaftaran merchant toko baru yang belum aktif. Lakukan follow-up via WhatsApp atau aktivasi langsung.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari toko, owner, wa, sales..."
              className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
          >
            <option value="ALL">Semua Paket</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ADVANCE">Advance</option>
          </select>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-700">
              <tr>
                <th className="px-5 py-4">Toko &amp; Kontak Owner</th>
                <th className="px-5 py-4">Paket Diajukan</th>
                <th className="px-5 py-4">Sumber Lead / Sales</th>
                <th className="px-5 py-4">Status Pembayaran</th>
                <th className="px-5 py-4">Tanggal Mendaftar</th>
                <th className="px-5 py-4 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    Tidak ada calon toko yang menunggu aktivasi saat ini.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const isBusy = loadingId === lead.id;
                  const isActivating = isBusy && loadingAction === "activate";
                  const isDeleting = isBusy && loadingAction === "delete";
                  const p = lead.latestPayment;
                  const hasProof = p && p.receiptUrl;

                  return (
                    <tr key={lead.id} className="hover:bg-slate-750/50 transition align-top">
                      {/* Kolom 1: Toko & Kontak */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center font-black text-sm shrink-0">
                            {lead.name.charAt(0)}
                          </div>
                          <span>{lead.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 pl-9 space-y-0.5">
                          <a
                            href={`/${lead.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 hover:underline font-mono inline-flex items-center gap-1"
                          >
                            <span>{lead.slug}.gadgetbdg.com</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <div className="text-slate-300 font-medium">
                            👤 {lead.owner ? `${lead.owner.name} (${lead.owner.email})` : "Belum ada user"}
                          </div>
                          <div className="font-mono text-emerald-400">
                            WA: +{lead.whatsapp}
                          </div>
                        </div>
                      </td>

                      {/* Kolom 2: Paket Diajukan */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            lead.tier === "ADVANCE"
                              ? "bg-purple-950 text-purple-300 border-purple-800"
                              : lead.tier === "PRO"
                              ? "bg-blue-950 text-blue-300 border-blue-800"
                              : "bg-slate-700 text-slate-300 border-slate-600"
                          }`}
                        >
                          {lead.tier}
                        </span>
                        <div className="font-mono text-slate-200 font-bold mt-1.5 text-xs">
                          {formatRupiah(lead.planPrice)}
                        </div>
                        <div className="text-[10px] text-slate-500">/ bulan</div>
                      </td>

                      {/* Kolom 3: Sumber Lead / Sales */}
                      <td className="px-5 py-4">
                        {lead.salesPartner ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-800">
                              <Users className="w-3 h-3" /> Closing: {lead.salesPartner.code}
                            </span>
                            <div className="text-[11px] text-slate-400">
                              {lead.salesPartner.name}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                            Organik / Web
                          </span>
                        )}
                      </td>

                      {/* Kolom 4: Status Pembayaran */}
                      <td className="px-5 py-4">
                        {p?.status === "PENDING" && hasProof ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              <CreditCard className="w-3 h-3" /> Bukti Terupload
                            </span>
                            <div>
                              <a
                                href={p.receiptUrl!}
                                target="_blank"
                                rel="noreferrer"
                                className="block h-12 w-12 rounded-lg overflow-hidden border border-slate-600 hover:border-amber-400 transition"
                                title="Klik untuk lihat bukti transfer"
                              >
                                <img
                                  src={p.receiptUrl!}
                                  alt="Bukti Transfer"
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              <Clock className="w-3 h-3" /> Menunggu Transfer
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono">Belum ada struk</div>
                          </div>
                        )}
                      </td>

                      {/* Kolom 5: Tanggal Mendaftar */}
                      <td className="px-5 py-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(lead.createdAt)}
                      </td>

                      {/* Kolom 6: Aksi Operasional */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                          {/* Tombol Follow Up WhatsApp */}
                          <a
                            href={getWhatsAppFollowUpLink(lead)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs font-bold transition shadow-sm"
                            title="Buka WhatsApp Web follow-up konter"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Hubungi WA</span>
                          </a>

                          {/* Tombol Aktivasi Langsung */}
                          <button
                            type="button"
                            onClick={() => handleDirectActivate(lead)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm shadow-sky-600/20"
                            title="Aktifkan toko sekarang selama 30 hari"
                          >
                            {isActivating ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Zap className="w-3.5 h-3.5" />
                            )}
                            <span>{isActivating ? "Mengaktifkan..." : "Aktivasi Langsung"}</span>
                          </button>

                          {/* Tombol Hapus Lead */}
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead)}
                            disabled={isBusy}
                            className="p-1.5 rounded-xl bg-slate-700/60 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-600 transition disabled:opacity-50"
                            title="Batalkan pendaftaran toko ini"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
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
    </div>
  );
}
