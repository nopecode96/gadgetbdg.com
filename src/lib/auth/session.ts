/**
 * Unified Session Helper — Server-side only
 *
 * Strategy: Cookie-based session (no NextAuth).
 * The session cookie "gb_session" is a JSON string:
 *   { userId: string, storeId: string | null, role: string }
 *
 * It is set by loginAction (auth-actions.ts) on successful login
 * and cleared by logoutAction.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";
import type { Role, StoreTier } from "@prisma/client";
import type { SessionUser, TenantContext } from "@/types/global";

// ─── Cookie name constant ─────────────────────────────────────────
export const SESSION_COOKIE = "gb_session";

// ─── Raw payload stored in cookie ────────────────────────────────
export interface SessionPayload {
  userId: string;
  storeId: string | null;
  role: Role;
}

// ─── Parse cookie ────────────────────────────────────────────────
export function parseSessionCookie(): SessionPayload | null {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(SESSION_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw) as SessionPayload;
  } catch {
    return null;
  }
}

// ─── 1. getCurrentUser ────────────────────────────────────────────
/**
 * Returns the current logged-in user with fresh DB data.
 * Returns null when not logged in.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const payload = parseSessionCookie();
  if (!payload?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          customDomain: true,
          whatsapp: true,
          address: true,
          mapsUrl: true,
          tier: true,
          templateId: true,
          primaryColor: true,
          logoUrl: true,
          bannerUrl: true,
          hasWatermark: true,
          isActive: true,
          subscriptionExpiresAt: true,
          lastTemplateChangeAt: true,
          salesUserId: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    storeId: user.storeId,
    store: user.store
      ? {
          ...user.store,
          subscriptionExpiresAt: user.store.subscriptionExpiresAt ?? null,
          lastTemplateChangeAt: user.store.lastTemplateChangeAt ?? null,
        }
      : null,
  };
}

// ─── 2. requireAuth ───────────────────────────────────────────────
/**
 * Guard: requires login. Optionally restricts to specific roles.
 * Redirects to /login if not authenticated.
 * Throws 403 if role is not in allowedRoles.
 */
export async function requireAuth(allowedRoles?: Role[]): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new Error("403: Akses ditolak. Anda tidak memiliki izin untuk halaman ini.");
  }

  return user;
}

// ─── 3. requireStoreOwnerOrStaff ─────────────────────────────────
/**
 * Guard for merchant admin panel (/admin).
 * Ensures user has a valid storeId and the store is active.
 * Redirects to /billing-suspended if store is inactive or expired.
 */
export async function requireStoreOwnerOrStaff(): Promise<TenantContext> {
  const user = await requireAuth(["STORE_OWNER", "STORE_STAFF"]);

  if (!user.storeId || !user.store) {
    redirect("/login?error=no_store");
  }

  const store = user.store;

  // Check if subscription is expired
  const isExpired =
    store.subscriptionExpiresAt !== null &&
    new Date(store.subscriptionExpiresAt) < new Date();

  if (!store.isActive || isExpired) {
    redirect("/billing-suspended");
  }

  // Fetch live quota counts
  const [activeProductCount, staffCount] = await Promise.all([
    prisma.product.count({
      where: { storeId: store.id, status: { in: ["AVAILABLE", "BOOKED"] } },
    }),
    prisma.user.count({ where: { storeId: store.id } }),
  ]);

  const tier = store.tier as StoreTier;
  const limits = TIER_LIMITS[tier];

  const remainingProductQuota =
    limits.maxActiveProducts === Infinity
      ? Infinity
      : limits.maxActiveProducts - activeProductCount;

  return {
    user,
    store: {
      ...store,
      tier,
    },
    limits: {
      maxActiveProducts: limits.maxActiveProducts,
      maxAdmins: limits.maxAdmins,
      allowedTemplates: limits.allowedTemplates,
      templateChangeCooldownDays: limits.templateChangeCooldownDays,
      hasWatermark: limits.hasWatermark,
      customDomain: limits.customDomain,
    },
    usage: {
      activeProductCount,
      staffCount,
      remainingProductQuota,
    },
    permissions: {
      canAddProduct: remainingProductQuota > 0,
      canAddStaff: staffCount < limits.maxAdmins,
      canUseCustomDomain: limits.customDomain,
      isOwner: user.role === "STORE_OWNER",
    },
  };
}

// ─── 4. requireSaasAdmin ──────────────────────────────────────────
/**
 * Guard for Super Admin panel (/super-admin).
 * Allows SUPER_ADMIN and ADMIN_SAAS roles.
 */
export async function requireSaasAdmin(): Promise<SessionUser> {
  return requireAuth(["SUPER_ADMIN", "ADMIN_SAAS"]);
}

// ─── 5. requireSalesAgent ─────────────────────────────────────────
/**
 * Guard for Sales Portal.
 * Allows SUPER_ADMIN, ADMIN_SAAS, and SALES_AGENT roles.
 */
export async function requireSalesAgent(): Promise<SessionUser> {
  return requireAuth(["SUPER_ADMIN", "ADMIN_SAAS", "SALES_AGENT"]);
}
