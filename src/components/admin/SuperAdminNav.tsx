import Link from "next/link";
import { ShieldAlert, Store, Globe, ArrowLeft, BarChart3, Database } from "lucide-react";

export function SuperAdminNav() {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/super-admin" className="flex items-center gap-2.5 font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span>GadgetBdg Super-Admin</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-300">
            <Link
              href="/super-admin"
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-1.5 transition"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Ringkasan Platform
            </Link>
            <Link
              href="/super-admin/stores"
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-1.5 transition"
            >
              <Store className="w-4 h-4 text-emerald-400" /> Manajemen Toko
            </Link>
            <Link
              href="/super-admin/domains"
              className="px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white flex items-center gap-1.5 transition"
            >
              <Globe className="w-4 h-4 text-blue-400" /> Custom Domains
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Portal SaaS
          </Link>
        </div>
      </div>
    </header>
  );
}
