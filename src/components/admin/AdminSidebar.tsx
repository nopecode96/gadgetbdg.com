"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  LayoutDashboard,
  Package,
  Repeat,
  Share2,
  QrCode,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X,
  Building2,
  Sparkles,
} from "lucide-react";
import { useAdminSidebar } from "./AdminSidebarContext";
import { merchantLogoutAction } from "@/lib/actions/login-actions";
import type { Role, StoreTier } from "@prisma/client";

interface AdminSidebarProps {
  currentSlug: string;
  storeName?: string;
  userName?: string;
  role?: Role;
  tier?: StoreTier;
  tradeInPendingCount?: number;
}

export function AdminSidebar({
  currentSlug,
  storeName,
  userName,
  role,
  tier = "STARTER",
  tradeInPendingCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse, isMobileOpen, setIsMobileOpen } = useAdminSidebar();

  const isOwner = role === "STORE_OWNER";

  const navigationItems = [
    {
      title: "Dashboard Ringkasan",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Katalog Stok Unit",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Inbox Tukar Tambah",
      href: "/admin/trade-in",
      icon: Repeat,
      badge: tradeInPendingCount > 0 ? tradeInPendingCount : null,
    },
    {
      title: "Generator Medsos",
      href: "/admin/social-tools",
      icon: Share2,
    },
    {
      title: "QR Meja & Standee",
      href: "/admin/marketing/qr-stands",
      icon: QrCode,
    },
    ...(isOwner
      ? [
          {
            title: "Tim & Staf Toko",
            href: "/admin/team",
            icon: Users,
          },
          {
            title: "Kelola Cabang",
            href: "/admin/branches",
            icon: Building2,
          },
          {
            title: "Pengaturan Toko",
            href: "/admin/settings",
            icon: Settings,
          },
        ]
      : []),
  ];

  const tierColors: Record<StoreTier, { bg: string; text: string; border: string }> = {
    STARTER: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" },
    PRO: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    ADVANCE: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  };

  const currentTierBadge = tierColors[tier] || tierColors.STARTER;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* ── TOP SECTION: Brand Header & Merchant Profile ── */}
      <div>
        {/* Brand & Store Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-200/80 px-4 transition-all duration-300 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          <Link
            href="/admin"
            className="flex items-center gap-3 min-w-0 group"
            title={storeName || "GadgetBdg Admin"}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex flex-col">
                <span className="font-bold text-slate-900 text-sm truncate leading-tight group-hover:text-blue-600 transition-colors">
                  {storeName || "GadgetBdg Admin"}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${currentTierBadge.bg} ${currentTierBadge.text} ${currentTierBadge.border}`}
                  >
                    {tier}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate">
                    {currentSlug}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Toggle Button on Desktop */}
          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title={isCollapsed ? "Perlebar Sidebar" : "Lipat Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Close button for Mobile drawer */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close mobile sidebar"
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Merchant Mini Profile (Below Header) */}
        {!isCollapsed ? (
          <div className="px-4 py-3 mx-2 my-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
              {(userName || "O").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {userName || "Pemilik Toko"}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {role === "STORE_OWNER" ? "Owner Toko" : "Staf Toko"}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-100">
            <div
              className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold flex items-center justify-center text-xs"
              title={`${userName || "Owner"} (${role === "STORE_OWNER" ? "Owner Toko" : "Staf Toko"})`}
            >
              {(userName || "O").charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* ── VERTICAL NAVIGATION MENU ── */}
        <nav className="px-2 py-2 space-y-1">
          {navigationItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold shadow-sm shadow-blue-500/10"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  } ${isCollapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.title}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-blue-600 text-white shrink-0 animate-pulse">
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator Bar on Left */}
                  {isActive && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-blue-600" />
                  )}
                </Link>

                {/* Tooltip on Collapsed Mode */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    <div className="flex items-center gap-1.5">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* ── FOOTER SECTION: Logout ── */}
      <div className="p-3 border-t border-slate-200/80">
        <form action={merchantLogoutAction}>
          <button
            type="submit"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200/60 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title="Keluar Toko"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
            {!isCollapsed && <span className="truncate font-bold">Keluar Toko</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Backdrop & Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
