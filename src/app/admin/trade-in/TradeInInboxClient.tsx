"use client";

import { useState } from "react";
import {
  MessageCircle,
  Clock,
  Smartphone,
  User,
  AlertCircle,
  DollarSign,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Phone,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { updateTradeInStatusAction } from "@/lib/actions/tradein-actions";
import type { TradeInStatus } from "@prisma/client";

interface TradeInOffer {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone?: string | null;
  customerWa: string;
  phoneModel?: string | null;
  deviceModel: string;
  condition?: string | null;
  conditionDesc: string;
  batteryHealth?: number | null;
  imeiStatus?: string | null;
  completeness?: string | null;
  expectedPrice: number | null;
  minusNotes: string | null;
  photoUrls: string[];
  status: TradeInStatus;
  createdAt: Date;
}

export function TradeInInboxClient({
  store,
  offers: initialOffers,
}: {
  store?: any;
  offers: TradeInOffer[];
}) {
  const [offers, setOffers] = useState<TradeInOffer[]>(initialOffers);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(offerId: string, newStatus: TradeInStatus) {
    setUpdatingId(offerId);
    const res = await updateTradeInStatusAction(offerId, newStatus);
    setUpdatingId(null);

    if (res.success) {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert(res.error || "Gagal mengubah status penawaran.");
    }
  }

  const statusBadges: Record<
    TradeInStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    PENDING: {
      label: "Menunggu Follow-up",
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
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
    REJECTED: {
      label: "Ditolak / Batal",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Inbox Pengajuan Trade-In
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar calon customer yang ingin menjual atau tukar tambah HP lama mereka ke toko Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offers List */}
        <div className="lg:col-span-2 space-y-3">
          {offers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center text-slate-400 text-xs">
              Belum ada pengajuan tukar tambah yang masuk.
            </div>
          ) : (
            offers.map((offer) => {
              const phone = offer.customerPhone || offer.customerWa;
              let cleanWa = phone.replace(/\D/g, "");
              if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

              const model = offer.phoneModel || offer.deviceModel;
              const cond = offer.condition || offer.conditionDesc;

              const negoMessage = encodeURIComponent(
                `Halo Kak ${offer.customerName},\n\n` +
                  `Terima kasih sudah mengajukan Trade-In HP *${model}* di ${
                    store?.name || "GadgetBdg"
                  }.\n` +
                  `Berdasarkan deskripsi unit:\n` +
                  `• Kondisi: ${cond}\n` +
                  (offer.batteryHealth ? `• Battery Health: ${offer.batteryHealth}%\n` : "") +
                  (offer.imeiStatus ? `• Legalitas IMEI: ${offer.imeiStatus}\n` : "") +
                  (offer.completeness ? `• Kelengkapan: ${offer.completeness}\n` : "") +
                  (offer.minusNotes ? `• Catatan Minus: ${offer.minusNotes}\n` : "") +
                  `\nKami bisa berikan estimasi taksiran awal di kisaran ${
                    offer.expectedPrice
                      ? formatRupiah(offer.expectedPrice)
                      : "harga pasaran tertinggi"
                  }.\n` +
                  `Boleh kirimkan video singkat kondisi fisik atau silakan mampir ke konter fisik kami untuk langsung run 3uTools & test fisik ya kak!`
              );

              const currentBadge = statusBadges[offer.status] || statusBadges.PENDING;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900">{model}</span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}
                        >
                          {currentBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-800">{offer.customerName}</span>
                        <span>•</span>
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{phone}</span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanWa}?text=${negoMessage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" /> Balas via WA
                    </a>
                  </div>

                  {/* Spesifikasi Lengkap Pengajuan */}
                  <div className="bg-slate-50 rounded-2xl p-3.5 text-xs space-y-2 border border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      <div>
                        <b>Kondisi Fisik:</b> {cond}
                      </div>
                      {offer.batteryHealth && (
                        <div className="flex items-center gap-1 font-semibold text-amber-700">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Battery Health: {offer.batteryHealth}%</span>
                        </div>
                      )}
                      {offer.imeiStatus && (
                        <div>
                          <b>IMEI:</b> {offer.imeiStatus}
                        </div>
                      )}
                      {offer.completeness && (
                        <div>
                          <b>Kelengkapan:</b> {offer.completeness}
                        </div>
                      )}
                    </div>

                    {offer.minusNotes && (
                      <div className="text-slate-600 flex items-start gap-1 pt-1 border-t border-slate-200/60">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <b>Minus:</b> {offer.minusNotes}
                        </span>
                      </div>
                    )}

                    {offer.expectedPrice && (
                      <div className="text-blue-700 font-bold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>Ekspektasi Harga: {formatRupiah(offer.expectedPrice)}</span>
                      </div>
                    )}
                  </div>

                  {/* Foto Fisik Unit HP */}
                  {offer.photoUrls && offer.photoUrls.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10.5px] font-bold text-slate-500">
                        Foto Fisik Unit ({offer.photoUrls.length} Foto):
                      </div>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {offer.photoUrls.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 hover:opacity-80 transition shrink-0"
                          >
                            <img
                              src={url}
                              alt={`Unit HP ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dropdown Update Status Penawaran */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">
                      Ubah Status Penawaran:
                    </span>
                    <select
                      value={offer.status}
                      disabled={updatingId === offer.id}
                      onChange={(e) =>
                        handleStatusChange(offer.id, e.target.value as TradeInStatus)
                      }
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="PENDING">Menunggu Follow-up</option>
                      <option value="CONTACTED">Sedang Dihubungi</option>
                      <option value="DEAL">Deal / Selesai COD</option>
                      <option value="REJECTED">Ditolak / Batal</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Trade-In Tips / Workflow Box */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SOP Taksir Harga Aman</span>
            </h3>
            <ul className="space-y-2 text-slate-600 leading-relaxed list-disc list-inside">
              <li>Cek Battery Health & status kelengkapan dus/box bawaan.</li>
              <li>
                Pastikan legalitas IMEI resmi (iBox / SEIN / Bea Cukai) untuk perlindungan hukum.
              </li>
              <li>
                Arahkan customer datang ke markas toko fisik untuk test 3uTools dan cek fungsional
                FaceID / TrueTone.
              </li>
              <li>
                Gunakan dropdown status untuk menandai lead yang sudah dihubungi atau sudah deal COD.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
