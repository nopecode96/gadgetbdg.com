"use client";

import { useState } from "react";
import { MessageCircle, Clock, Smartphone, User, AlertCircle, DollarSign, Image as ImageIcon } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface TradeInOffer {
  id: string;
  storeId: string;
  customerName: string;
  customerWa: string;
  deviceModel: string;
  expectedPrice: number | null;
  conditionDesc: string;
  minusNotes: string | null;
  photoUrls: string[];
  createdAt: Date;
}

export function TradeInInboxClient({
  store,
  offers,
}: {
  store?: any;
  offers: TradeInOffer[];
}) {
  const [selectedOffer, setSelectedOffer] = useState<TradeInOffer | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inbox Pengajuan Trade-In</h1>
        <p className="text-xs text-slate-500 mt-1">
          Daftar calon customer yang ingin menjual atau tukar tambah HP lama mereka.
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
              // Construct WhatsApp negotiation message
              let cleanWa = offer.customerWa.replace(/\D/g, "");
              if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

              const negoMessage = encodeURIComponent(
                `Halo Kak ${offer.customerName},\n\n` +
                  `Terima kasih sudah mengajukan Trade-In HP *${offer.deviceModel}* di ${store?.name || "GadgetBdg"}.\n` +
                  `Berdasarkan deskripsi: ${offer.conditionDesc}` +
                  (offer.minusNotes ? ` (Minus: ${offer.minusNotes})` : "") +
                  `,\n\n` +
                  `Kami bisa berikan estimasi taksiran awal di kisaran ${
                    offer.expectedPrice ? formatRupiah(offer.expectedPrice) : "harga terbaik"
                  }.\n` +
                  `Boleh kami minta video singkat kondisi unit atau silakan mampir ke toko kami untuk pengecekan fisik langsung ya kak!`
              );

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{offer.deviceModel}</span>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          Trade-In Lead
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{offer.customerName}</span>
                        <span>•</span>
                        <span>{offer.customerWa}</span>
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

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="text-slate-700">
                      <b>Kondisi:</b> {offer.conditionDesc}
                    </div>
                    {offer.minusNotes && (
                      <div className="text-slate-600 flex items-start gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <b>Minus:</b> {offer.minusNotes}
                        </span>
                      </div>
                    )}
                    {offer.expectedPrice && (
                      <div className="text-blue-700 font-bold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>Ekspektasi Harga: {formatRupiah(offer.expectedPrice)}</span>
                      </div>
                    )}
                  </div>

                  {offer.photoUrls && offer.photoUrls.length > 0 && (
                    <div className="flex items-center gap-2">
                      {offer.photoUrls.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 hover:opacity-80 transition relative"
                        >
                          <img src={url} alt="Foto Unit" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Trade-In Tips / Workflow Box */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">💡 Tips Taksir Harga Cepat</h3>
            <ul className="space-y-2 text-slate-600 leading-relaxed list-disc list-inside">
              <li>Cek Battery Health & status kelengkapan dus/box bawaan.</li>
              <li>Pastikan garansi resmi (iBox / SEIN) untuk nilai jual kembali yang tinggi.</li>
              <li>Arahkan customer datang ke toko untuk final cek fisik & run diagnostic 3uTools.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
