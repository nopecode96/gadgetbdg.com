"use client";

import { useState } from "react";
import {
  Users,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Calendar,
  Layers,
  Phone,
  Store,
  CreditCard,
  AlertCircle,
  Clock,
} from "lucide-react";
import { manualActivateStoreAction } from "@/lib/actions";

interface LeadStore {
  id: string;
  name: string;
  slug: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  whatsapp: string;
  templateId: string;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  payments: Array<{
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    receiptUrl: string | null;
    createdAt: string;
  }>;
}

export function LeadsManagerClient({ initialLeads }: { initialLeads: LeadStore[] }) {
  const [leads, setLeads] = useState<LeadStore[]>(initialLeads);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [daysToActivate, setDaysToActivate] = useState<Record<string, number>>({});
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = leads.filter((item) => {
    const matchTier = filterTier === "ALL" || item.tier === filterTier;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.whatsapp.includes(search) ||
      (item.owner && item.owner.name.toLowerCase().includes(search.toLowerCase())) ||
      (item.owner && item.owner.email.toLowerCase().includes(search.toLowerCase()));
    return matchTier && matchSearch;
  });

  async function handleManualActivate(lead: LeadStore) {
    const days = daysToActivate[lead.id] || 30;
    if (
      !confirm(
        `Aktivasi manual toko "${lead.name}" (${lead.tier}) selama ${days} hari?\n\nTindakan ini akan mengaktifkan website toko dan admin panel tanpa harus menunggu upload bukti transfer.`
      )
    ) {
      return;
    }

    setLoadingId(lead.id);
    const res = await manualActivateStoreAction(lead.id, days);
    setLoadingId(null);

    if (res.success) {
      alert(res.message);
      // Hapus dari list calon klien karena sekarang toko sudah aktif
      setLeads((prev) => prev.filter((s) => s.id !== lead.id));
    } else {
      alert(res.error || "Gagal mengaktivasi toko.");
    }
  }

  function getWhatsAppFollowUpLink(lead: LeadStore) {
    const ownerName = lead.owner ? lead.owner.name : lead.name;
    const msg = encodeURIComponent(
      `Halo Kak ${ownerName} dari *${lead.name}*!\n\nKami melihat Anda telah mendaftarkan toko gadget di GadgetBdg.com dengan paket *${lead.tier}*.\n\nApakah ada kendala dalam proses transfer QRIS atau aktivasi website Anda?\n\nKami siap membantu agar katalog HP ${lead.name} bisa langsung online hari ini: https://${lead.slug}.gadgetbdg.com\n\nTerima kasih!`
    );
    return `https://wa.me/${lead.whatsapp}?text=${msg}`;
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Calon Klien &amp; Pipeline Aktivasi</span>
            <span className="text-xs font-mono bg-sky-950 text-sky-400 px-2.5 py-0.5 rounded-full border border-sky-800">
              {leads.length} Menunggu
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Daftar calon merchant yang telah mendaftar namun tokonya belum aktif (belum bayar / pending verifikasi / kemitraan khusus).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari toko, nama owner, nomor WA..."
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Paket</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
            <option value="ADVANCE">Advance</option>
          </select>
        </div>
      </div>

      {/* Leads List Cards */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-bold text-white">Tidak Ada Calon Klien Tertunda</h3>
          <p className="text-xs text-slate-400 mt-1">
            Seluruh pendaftaran toko yang masuk sudah aktif atau tidak ada yang cocok dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((lead) => {
            const isLoading = loadingId === lead.id;
            const days = daysToActivate[lead.id] || 30;
            const pendingPayment = lead.payments.find((p) => p.status === "PENDING");
            const hasPayments = lead.payments.length > 0;

            return (
              <div
                key={lead.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Store & Owner Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center font-black text-sm">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white">{lead.name}</h2>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              lead.tier === "ADVANCE"
                                ? "bg-purple-950 text-purple-300 border-purple-800"
                                : lead.tier === "PRO"
                                ? "bg-blue-950 text-blue-300 border-blue-800"
                                : "bg-slate-700 text-slate-300 border-slate-600"
                            }`}
                          >
                            {lead.tier}
                          </span>
                        </div>
                        <a
                          href={`/${lead.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-0.5"
                        >
                          <span>{lead.slug}.gadgetbdg.com</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300 pt-2 pl-11">
                      <div>
                        <span className="text-slate-500">Admin Utama:</span>{" "}
                        <span className="font-semibold text-white">
                          {lead.owner ? `${lead.owner.name} (${lead.owner.email})` : "Belum dibuat"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">WhatsApp:</span>{" "}
                        <span className="font-mono font-semibold text-white">+{lead.whatsapp}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Template Terpilih:</span>{" "}
                        <span className="font-mono text-slate-300">{lead.templateId}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Terdaftar Pada:</span>{" "}
                        <span>{new Date(lead.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                    {pendingPayment ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
                        <CreditCard className="w-3.5 h-3.5" /> Sudah Upload Bukti (Pending Review)
                      </span>
                    ) : hasPayments ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        <AlertCircle className="w-3.5 h-3.5" /> Pembayaran Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <Clock className="w-3.5 h-3.5" /> Belum Melakukan Transfer
                      </span>
                    )}

                    {pendingPayment?.receiptUrl && (
                      <a
                        href={pendingPayment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1"
                      >
                        Lihat Bukti Transfer <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 border-t border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <a
                    href={getWhatsAppFollowUpLink(lead)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-600/40 text-xs font-bold transition"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Follow-up WhatsApp Merchant</span>
                  </a>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs text-slate-400 hidden sm:inline">Masa Aktif:</span>
                    <select
                      value={days}
                      onChange={(e) =>
                        setDaysToActivate((prev) => ({ ...prev, [lead.id]: parseInt(e.target.value, 10) }))
                      }
                      className="bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={7}>7 Hari (Trial)</option>
                      <option value={14}>14 Hari (Promo)</option>
                      <option value={30}>30 Hari (1 Bulan)</option>
                      <option value={90}>90 Hari (3 Bulan)</option>
                      <option value={365}>365 Hari (1 Tahun)</option>
                    </select>

                    <button
                      onClick={() => handleManualActivate(lead)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Aktivasi Manual (Bypass)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
