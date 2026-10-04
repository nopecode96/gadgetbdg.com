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
 * Wraps all merchant admin pages with the modern collapsible left sidebar
 * and minimal top header (MerchantLayout).
 */

import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { MerchantLayout } from "@/components/admin/MerchantLayout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect if not authenticated / store not active
  const ctx = await requireStoreOwnerOrStaff();

  // Explicit multi-tenant access verification
  const { requireStoreAccess } = await import("@/lib/auth/tenant-guard");
  await requireStoreAccess(ctx.store.id);

  // Query pending trade-in offers count for the badge in sidebar
  const tradeInPendingCount = await prisma.tradeInOffer.count({
    where: {
      storeId: ctx.store.id,
      status: "PENDING",
    },
  });

  return (
    <MerchantLayout
      currentSlug={ctx.store.slug}
      storeName={ctx.store.name}
      userName={ctx.user.name}
      role={ctx.user.role}
      tier={ctx.store.tier}
      tradeInPendingCount={tradeInPendingCount}
      staffCount={ctx.usage.staffCount}
      maxStaff={ctx.limits.maxAdmins}
    >
      {children}
    </MerchantLayout>
  );
}
