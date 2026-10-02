import Link from "next/link";
import { Store, Package, RefreshCw, Share2, ExternalLink } from "lucide-react";

export function AdminNav({ currentSlug }: { currentSlug?: string }) {
  const current = currentSlug || "berkahcell";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <span>GadgetBdg Admin</span>
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
              href="/admin/social-tools"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" /> Generator Medsos
            </Link>
            <Link
              href="/admin/team"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <span>👥 Tim &amp; Staf</span>
            </Link>
            <Link
              href="/admin/settings"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <span>⚙️ Pengaturan Toko</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/${current}`}
            target="_blank"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
          >
            <span>Preview Toko</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
