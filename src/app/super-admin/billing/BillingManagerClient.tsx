"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { approvePaymentAction, rejectPaymentAction } from "@/lib/actions";

interface PaymentItem {
  id: string;
  tier: "STARTER" | "PRO" | "ADVANCE";
  amount: number;
  receiptUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  store: {
    id: string;
    name: string;
    slug: string;
    whatsapp: string;
  };
}

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BillingManagerClient({ initialPayments }: { initialPayments: PaymentItem[] }) {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const filtered = payments.filter((p) => filter === "ALL" || p.status === filter);

  const pendingCount = payments.filter((p) => p.status === "PENDING").length;

  async function handleApprove(payment: PaymentItem) {
    if (!confirm(`Setujui pembayaran toko "${payment.store.name}"?\nIni akan mengaktifkan toko selama 30 hari.`)) return;
    setLoadingId(payment.id);
    const res = await approvePaymentAction(payment.id);
    setLoadingId(null);

    if (res.success) {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, status: "APPROVED" } : p))
      );
    } else {
      alert(res.error || "Gagal menyetujui pembayaran.");
    }
  }

  async function handleReject(payment: PaymentItem) {
    const notes = rejectNotes[payment.id] || "";
    if (!confirm(`Tolak pembayaran toko "${payment.store.name}"?`)) return;
    setLoadingId(payment.id);
    const res = await rejectPaymentAction(payment.id, notes);
    setLoadingId(null);

    if (res.success) {
      setPayments((prev) =>
        prev.map((p) => (p.id === payment.id ? { ...p, status: "REJECTED", notes } : p))
      );
    } else {
      alert(res.error || "Gagal menolak pembayaran.");
    }
  }

  function buildWaMessage(payment: PaymentItem) {
    const msg = encodeURIComponent(
      `Halo ${payment.store.name},\n\nPembayaran paket *${payment.tier}* sebesar *${formatRupiah(payment.amount)}* telah kami terima dan akun Anda sudah AKTIF ✅\n\nWebsite Toko Online:\nhttps://${payment.store.slug}.gadgetbdg.com\n\nLogin Dashboard Admin Toko:\nhttps://toko.gadgetbdg.com\n\nTerima kasih telah berlangganan GadgetBDG.com! 🎉`
    );
    return `https://wa.me/${payment.store.whatsapp}?text=${msg}`;
  }

  const tierColor = (tier: string) =>
    tier === "ADVANCE"
      ? "bg-purple-100 text-purple-800"
      : tier === "PRO"
      ? "bg-blue-100 text-blue-800"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>Verifikasi Pembayaran QRIS</span>
            {pendingCount > 0 && (
              <span className="text-xs font-mono bg-amber-500 text-white px-2.5 py-0.5 rounded-full">
                {pendingCount} Menunggu
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Antrian verifikasi bukti transfer berlangganan dari merchant baru.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
              filter === f
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
            }`}
          >
            {f === "ALL" ? "Semua" : f === "PENDING" ? `⏳ Pending (${pendingCount})` : f === "APPROVED" ? "✅ Disetujui" : "❌ Ditolak"}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-12 text-center text-slate-500 text-sm">
          Tidak ada pembayaran dengan status ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((payment) => {
            const isLoading = loadingId === payment.id;
            return (
              <div
                key={payment.id}
                className={`bg-slate-800/80 border rounded-2xl p-5 space-y-4 ${
                  payment.status === "PENDING"
                    ? "border-amber-700/60"
                    : payment.status === "APPROVED"
                    ? "border-emerald-800/60"
                    : "border-rose-900/60"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-black text-white text-base">{payment.store.name}</div>
                    <div className="text-xs font-mono text-slate-400">{payment.store.slug}.gadgetbdg.com</div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formatDate(payment.createdAt)}</span>
                      <span>·</span>
                      <span>WA: {payment.store.whatsapp}</span>
                    </div>
                  </div>

                  <div className="text-right space-y-1.5 shrink-0">
                    <div className="text-lg font-black text-indigo-400">{formatRupiah(payment.amount)}</div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tierColor(payment.tier)}`}>
                      {payment.tier}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {payment.status === "PENDING" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800">
                      <Clock className="w-3.5 h-3.5" /> Menunggu Verifikasi
                    </span>
                  ) : payment.status === "APPROVED" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui & Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-400 border border-rose-800">
                      <XCircle className="w-3.5 h-3.5" /> Ditolak
                    </span>
                  )}

                  {/* Receipt link */}
                  {payment.receiptUrl && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
                    >
                      <ExternalLink className="w-3 h-3" /> Lihat Bukti Transfer
                    </a>
                  )}
                </div>

                {/* Receipt image preview if available */}
                {payment.receiptUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-700 max-w-xs">
                    <img
                      src={payment.receiptUrl}
                      alt="Bukti Transfer"
                      className="w-full object-cover max-h-48"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}

                {/* Actions for PENDING */}
                {payment.status === "PENDING" && (
                  <div className="space-y-3">
                    {/* Reject notes */}
                    <input
                      type="text"
                      placeholder="Catatan penolakan (opsional)..."
                      value={rejectNotes[payment.id] || ""}
                      onChange={(e) => setRejectNotes((prev) => ({ ...prev, [payment.id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <div className="flex items-center gap-3">
                      {/* Approve */}
                      <button
                        onClick={() => handleApprove(payment)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Setujui & Aktifkan Toko
                      </button>

                      {/* Reject */}
                      <button
                        onClick={() => handleReject(payment)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl font-bold text-xs text-rose-300 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak Pembayaran
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp notification button for APPROVED */}
                {payment.status === "APPROVED" && (
                  <a
                    href={buildWaMessage(payment)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 transition"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Kirim Notifikasi Aktivasi via WhatsApp
                  </a>
                )}

                {/* Rejection notes display */}
                {payment.status === "REJECTED" && payment.notes && (
                  <p className="text-xs text-rose-400 italic">Catatan: {payment.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
