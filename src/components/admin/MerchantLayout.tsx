"use client";

import React from "react";
import { AdminSidebarProvider, useAdminSidebar } from "./AdminSidebarContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import type { Role, StoreTier } from "@prisma/client";

interface MerchantLayoutProps {
  children: React.ReactNode;
  currentSlug: string;
  storeName?: string;
  userName?: string;
  role?: Role;
  tier?: StoreTier;
  tradeInPendingCount?: number;
  staffCount?: number;
  maxStaff?: number;
}

function MerchantLayoutInner({
  children,
  currentSlug,
  storeName,
  userName,
  role,
  tier,
  tradeInPendingCount,
  staffCount,
  maxStaff,
}: MerchantLayoutProps) {
  const { isCollapsed } = useAdminSidebar();

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex">
      {/* 1. Collapsible Fixed Left Sidebar */}
      <AdminSidebar
        currentSlug={currentSlug}
        storeName={storeName}
        userName={userName}
        role={role}
        tier={tier}
        tradeInPendingCount={tradeInPendingCount}
        staffCount={staffCount}
        maxStaff={maxStaff}
      />

      {/* 2. Main Content Wrapper with dynamic responsive margin */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Sticky Top Header */}
        <AdminHeader
          currentSlug={currentSlug}
          storeName={storeName}
          userName={userName}
          role={role}
        />

        {/* Page Content */}
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}

export function MerchantLayout(props: MerchantLayoutProps) {
  return (
    <AdminSidebarProvider>
      <MerchantLayoutInner {...props} />
    </AdminSidebarProvider>
  );
}
