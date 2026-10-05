"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { useAdminSidebar } from "./AdminSidebarContext";
import type { Role } from "@prisma/client";

interface AdminHeaderProps {
  currentSlug: string;
  storeName?: string;
  userName?: string;
  role?: Role;
}

const pageTitles: Record<string, { title: string; category?: string }> = {
  "/admin": { title: "Dashboard Ringkasan" },
  "/admin/products": { title: "Katalog Stok Unit", category: "Inventaris" },
  "/admin/products/new": { title: "Tambah Unit Baru", category: "Inventaris" },
  "/admin/trade-in": { title: "Inbox Tukar Tambah", category: "Transaksi" },
  "/admin/social-tools": { title: "Generator Medsos", category: "Pemasaran" },
  "/admin/marketing/qr-stands": { title: "QR Meja & Standee", category: "Pemasaran" },
  "/admin/team": { title: "Tim & Staf Toko", category: "Manajemen" },
  "/admin/settings": { title: "Pengaturan Toko", category: "Konfigurasi" },
};

export function AdminHeader({ currentSlug, storeName, userName, role }: AdminHeaderProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, toggleMobile } = useAdminSidebar();

  // Find matching breadcrumb / page title
  let matchedPage = pageTitles[pathname];
  if (!matchedPage) {
    if (pathname.startsWith("/admin/products/")) {
      matchedPage = { title: "Detail / Edit Produk", category: "Inventaris" };
    } else {
      matchedPage = { title: "Panel Admin" };
    }
  }

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* ── Left: Collapse Button & Breadcrumbs ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger toggle */}
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open mobile navigation"
          className="md:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Icon Button in Header */}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:flex p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
          title={isCollapsed ? "Buka Sidebar (Lebar)" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-slate-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Breadcrumbs / Page Title */}
        <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
          <span className="hidden sm:inline font-medium text-slate-400">Admin</span>
          {matchedPage.category && (
            <>
              <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline font-medium text-slate-400">{matchedPage.category}</span>
            </>
          )}
          <ChevronRight className="hidden sm:inline w-3 h-3 text-slate-400" />
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {matchedPage.title}
          </h1>
        </div>
      </div>

      {/* ── Right: Store Status Badge, Quick Storefront Link, Avatar ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Store Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Toko Aktif</span>
        </div>

        {/* Quick External Link to Storefront */}
        <Link
          href={`/${currentSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 shadow-sm shadow-blue-500/10 transition-all hover:scale-102"
          title={`Buka etalase toko ${currentSlug}.gadgetbdg.com`}
        >
          <span>Lihat Toko</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* User Avatar Circle */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-200/80">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white"
            title={`${userName || "User"} (${role === "STORE_OWNER" ? "Owner" : "Staf"})`}
          >
            {(userName || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
