import Link from "next/link";
import { AlertTriangle, ArrowLeft, MessageCircle } from "lucide-react";

export default function BillingSuspendedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">Toko Ditangguhkan</h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Masa aktif langganan toko Anda telah berakhir atau toko belum diaktifkan oleh admin
            GadgetBdg. Silakan hubungi tim kami untuk memperpanjang atau mengaktifkan toko Anda.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Langkah selanjutnya
          </p>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">1.</span>
              Transfer biaya perpanjangan ke QRIS GadgetBdg
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">2.</span>
              Kirim bukti transfer via WhatsApp ke admin
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">3.</span>
              Toko akan diaktifkan kembali dalam 1×24 jam
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6281234567890?text=Halo+admin+GadgetBdg%2C+saya+ingin+memperpanjang+langganan+toko+saya."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Admin WA
          </a>
          <Link
            href="/login"
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali Login
          </Link>
        </div>
      </div>
    </div>
  );
}
