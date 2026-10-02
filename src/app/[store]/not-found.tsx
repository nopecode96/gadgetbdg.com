import Link from "next/link";
import { Store, ArrowLeft, Smartphone } from "lucide-react";

export default function StoreNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <Store className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            404 • TOKO TIDAK DITEMUKAN
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Toko Belum Terdaftar atau Nonaktif
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Halaman toko HP yang Anda tuju belum terdaftar di platform GadgetBdg atau saat ini sedang ditutup/dinonaktifkan oleh pemiliknya.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Buka Website gadgetbdg.com
          </Link>
          <Link
            href="/admin"
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-100 transition"
          >
            Masuk ke Portal Admin Toko
          </Link>
        </div>
      </div>
    </div>
  );
}
