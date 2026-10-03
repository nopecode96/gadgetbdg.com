"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Receipt,
  Wallet,
  Store as StoreIcon,
  Inbox,
  X,
  ImageOff,
  MessageSquare,
} from "lucide-react";
import {
  approveSubscriptionPaymentAction,
  rejectSubscriptionPaymentAction,
  type BillingOverview,
  type BillingPaymentRow,
} from "@/lib/actions/billing-actions";

function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const tierColor = (tier: string) =>
  tier === "ADVANCE"
    ? "bg-purple-100 text-purple-800"
    : tier === "PRO"
    ? "bg-blue-100 text-blue-800"
    : "bg-slate-200 text-slate-800";

type ToastState = { type: "success" | "error"; message: string } | null;

export function BillingManagerClient({ initialOverview }: { initialOverview: BillingOverview }) {
  const [overview, setOverview] = useState(initialOverview);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<BillingPaymentRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BillingPaymentRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  function moveToHistory(
    id: string,
    patch: Partial<BillingPaymentRow>,
    revenueDelta: number,
    activeDelta: number
  ) {
    setOverview((prev) => {
      const target = prev.pending.find((p) => p.id === id);
      if (!target) return prev;
      const updated = { ...target, ...patch };
      return {
        ...prev,
        totalRevenue: prev.totalRevenue + revenueDelta,
        activeStores: prev.activeStores + activeDelta,
        pendingCount: prev.pendingCount - 1,
        pending: prev.pending.filter((p) => p.id !== id),
        history: [updated, ...prev.history].slice(0, 20),
      };
    });
  }

  async function confirmApprove() {
    if (!approveTarget) return;
    const payment = approveTarget;
    setLoadingId(payment.id);
    const res = await approveSubscriptionPaymentAction(payment.id);
    setLoadingId(null);
    setApproveTarget(null);

    if (res.success) {
      const wasInactive =
        !payment.store.subscriptionExpiresAt ||
        new Date(payment.store.subscriptionExpiresAt) < new Date();
      moveToHistory(
        payment.id,
        {
          status: "APPROVED",
          paidAt: new Date().toISOString(),
          reviewedByName: "Anda",
        },
        payment.amount,
        wasInactive ? 1 : 0
      );
      setToast({
        type: "success",
        message: `Toko "${payment.store.name}" aktif hingga ${formatDate(res.subscriptionExpiresAt)}.`,
      });
    } else {
      setToast({ type: "error", message: res.error });
    }
  }

  async function confirmReject() {
    if (!rejectTarget) return;
    const payment = rejectTarget;
    if (!rejectReason.trim()) {
      setToast({ type: "error", message: "Alasan penolakan wajib diisi." });
      return;
    }
    setLoadingId(payment.id);
    const res = await rejectSubscriptionPaymentAction(payment.id, rejectReason);
    setLoadingId(null);

    if (res.success) {
      moveToHistory(
        payment.id,
        { status: "REJECTED", notes: rejectReason.trim(), reviewedByName: "Anda" },
        0,
        0
      );
      setToast({ type: "success", message: `Pembayaran "${payment.store.name}" ditolak.` });
      setRejectTarget(null);
      setRejectReason("");
    } else {
      setToast({ type: "error", message: res.error });
    }
  }

  function buildWaLink(p: BillingPaymentRow) {
    const msg = encodeURIComponent(
      `Halo ${p.store.name}, pembayaran paket *${p.tier}* sebesar *${formatRupiah(p.amount)}* sudah kami terima dan toko Anda AKTIF ✅`
    );
    return `https://wa.me/${p.store.whatsapp.replace(/\D/g, "")}?text=${msg}`;
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed top-5 right-5 z-[60] max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-2xl ${
            toast.type === "success"
              ? "bg-emerald-950 border-emerald-700 text-emerald-200"
              : "bg-rose-950 border-rose-700 text-rose-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-amber-400" />
          Billing &amp; Subscription Control
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Verifikasi pembayaran QRIS/Transfer dan kelola masa aktif toko klien
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
            <Wallet className="w-4 h-4 text-indigo-400" /> Total Pendapatan SaaS
          </div>
          <div className="mt-2 text-2xl font-black text-white">{formatRupiah(overview.totalRevenue)}</div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
            <StoreIcon className="w-4 h-4 text-emerald-400" /> Toko Aktif Berlangganan
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-black text-white">{overview.activeStores}</span>
            <span className="rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
              AKTIF
            </span>
          </div>
        </div>
        <div
          className={`rounded-2xl border p-5 ${
            overview.pendingCount > 0
              ? "border-amber-600 bg-amber-950/40"
              : "border-slate-700 bg-slate-800/70"
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
            <Clock className="w-4 h-4 text-amber-400" /> Tagihan Menunggu Tindakan
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-black text-white">{overview.pendingCount}</span>
            {overview.pendingCount > 0 && (
              <span className="animate-pulse rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[11px] font-black">
                PERLU VERIFIKASI
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Payment Setting Reference */}
      {overview.paymentSetting && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Rekening Penampung SaaS Resmi
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{overview.paymentSetting.bankName}:</span>
                <span className="font-mono text-emerald-400 font-bold">{overview.paymentSetting.bankAccountNumber}</span>
                <span className="text-slate-400 font-normal">a.n. {overview.paymentSetting.bankAccountHolder}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            Pastikan mutasi bank merchant sesuai dengan rekening tujuan di atas sebelum mengonfirmasi pembayaran.
          </div>
        </div>
      )}

      {/* Pending queue */}
      <section className="space-y-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wide">Menunggu Konfirmasi</h2>
        {overview.pending.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-12 text-center">
            <Inbox className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              Semua tagihan telah diproses. Tidak ada antrean verifikasi saat ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Waktu Masuk</th>
                  <th className="px-4 py-3">Toko</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Bukti</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {overview.pending.map((p) => {
                  const busy = loadingId === p.id;
                  return (
                    <tr key={p.id} className="align-top">
                      <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{p.store.name}</div>
                        <div className="text-xs font-mono text-slate-400">{p.store.slug}.gadgetbdg.com</div>
                        <a
                          href={`https://wa.me/${p.store.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          WA: {p.store.whatsapp}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tierColor(p.tier)}`}
                        >
                          {p.plan?.name ?? p.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-black text-indigo-300 whitespace-nowrap">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {p.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setLightbox(p.receiptUrl)}
                            className="block h-16 w-16 overflow-hidden rounded-lg border border-slate-600 hover:border-indigo-400 transition"
                            title="Klik untuk memperbesar"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.receiptUrl} alt="Bukti transfer" className="h-full w-full object-cover" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                            <ImageOff className="w-4 h-4" /> Belum ada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col sm:flex-row justify-end gap-2">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setApproveTarget(p)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-black text-white disabled:opacity-50 transition"
                          >
                            {busy ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Setujui &amp; Aktifkan
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setRejectTarget(p);
                              setRejectReason("");
                            }}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-800 bg-rose-950/60 hover:bg-rose-900/60 px-3 py-2 text-xs font-bold text-rose-300 disabled:opacity-50 transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-sm font-black text-white uppercase tracking-wide">Riwayat Billing</h2>
        {overview.history.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-8 text-center text-sm text-slate-500">
            Belum ada riwayat transaksi.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Tanggal Proses</th>
                  <th className="px-4 py-3">Toko</th>
                  <th className="px-4 py-3">Paket</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {overview.history.map((p) => (
                  <tr key={p.id} className="align-top">
                    <td className="px-4 py-3 text-xs text-slate-300 whitespace-nowrap">
                      {formatDate(p.paidAt ?? p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{p.store.name}</div>
                      <div className="text-xs font-mono text-slate-400">{p.store.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tierColor(p.tier)}`}
                      >
                        {p.plan?.name ?? p.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-200 whitespace-nowrap">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "APPROVED" ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800 bg-emerald-950 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" /> Disetujui
                          </span>
                          <a
                            href={buildWaLink(p)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" /> Kabari via WA
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-800 bg-rose-950 px-2.5 py-0.5 text-[11px] font-bold text-rose-300">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </span>
                          {p.notes && <div className="text-[11px] italic text-rose-300/80">{p.notes}</div>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-300">{p.reviewedByName ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-slate-800 p-2 text-white hover:bg-slate-700"
            onClick={() => setLightbox(null)}
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt="Bukti transfer"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Approve confirm */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Setujui &amp; Aktifkan Toko?</h3>
            <p className="text-sm text-slate-300">
              Toko <b>{approveTarget.store.name}</b> akan diaktifkan pada paket{" "}
              <b>{approveTarget.plan?.name ?? approveTarget.tier}</b> senilai{" "}
              <b>{formatRupiah(approveTarget.amount)}</b>. Masa aktif bertambah 30 hari.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmApprove}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500"
              >
                Ya, Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 space-y-4">
            <h3 className="text-lg font-black text-white">Tolak Pembayaran</h3>
            <p className="text-sm text-slate-300">
              Toko <b>{rejectTarget.store.name}</b> — {formatRupiah(rejectTarget.amount)}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Alasan penolakan (wajib), mis. nominal tidak sesuai / bukti tidak terbaca"
              className="w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={loadingId === rejectTarget.id}
                onClick={confirmReject}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white hover:bg-rose-500 disabled:opacity-50"
              >
                Tolak Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
