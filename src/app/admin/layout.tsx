/**
 * /admin Layout — Server Component
 *
 * Acts as the authentication + authorization boundary for ALL pages
 * under /admin. Calls requireStoreOwnerOrStaff() which:
 *   1. Reads gb_session cookie
 *   2. Fetches fresh user + store data from DB
 *   3. Validates store.isActive and subscription expiry
 *   4. Redirects to /login or /billing-suspended if invalid
 *
 * The resolved TenantContext is passed as props to children via
 * page-level props (Server Component pattern — no React Context needed).
 */

import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not authenticated / store not active
  const ctx = await requireStoreOwnerOrStaff();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNav
        currentSlug={ctx.store.slug}
        storeName={ctx.store.name}
        userName={ctx.user.name}
        role={ctx.user.role}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
