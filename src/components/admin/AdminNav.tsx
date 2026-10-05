import Link from "next/link";
import { Store, Package, RefreshCw, Share2, ExternalLink, LogOut, Users, Settings, QrCode, Building2 } from "lucide-react";
import { merchantLogoutAction } from "@/lib/actions/login-actions";
import type { Role } from "@prisma/client";

interface AdminNavProps {
  currentSlug: string;
  storeName?: string;
  userName?: string;
  role?: Role;
}

export function AdminNav({ currentSlug, storeName, userName, role }: AdminNavProps) {
  const isOwner = role === "STORE_OWNER";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline">{storeName || "GadgetBdg Admin"}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Link
              href="/admin/products"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Package className="w-4 h-4" /> Manajemen Stok
            </Link>
            <Link
              href="/admin/trade-in"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-4 h-4" /> Inbox Trade-In
            </Link>
            <Link
              href="/admin/marketing"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" /> Marketing &amp; Medsos
            </Link>
            <Link
              href="/admin/marketing/qr-stands"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition text-indigo-700 bg-indigo-50/60 font-bold"
            >
              <QrCode className="w-4 h-4 text-indigo-600" /> QR Cetak Meja
            </Link>
            {isOwner && (
              <>
                <Link
                  href="/admin/team"
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
                >
                  <Users className="w-4 h-4" /> Tim &amp; Staf
                </Link>
                <Link
                  href="/admin/settings"
                  className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
                >
                  <Settings className="w-4 h-4" /> Pengaturan
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview storefront */}
          <Link
            href={`/${currentSlug}`}
            target="_blank"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <span className="hidden sm:inline">Preview Toko</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* User badge + logout */}
          <div className="flex items-center gap-2">
            {userName && (
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-slate-700 leading-tight">
                  {userName}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {role === "STORE_OWNER" ? "Pemilik Toko" : "Staf Toko"}
                </span>
              </div>
            )}
            <form action={merchantLogoutAction}>
              <button
                type="submit"
                title="Keluar dari Panel Admin Toko"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition text-xs font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
