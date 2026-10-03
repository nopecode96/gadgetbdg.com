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
          storeImage: true,
          mapsUrl: true,
          googleReviewUrl: true,
          operationalHours: true,
          warrantyPolicy: true,
          verifiedBadge: true,
          tier: true,
          planId: true,
          plan: true,
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
          plan: user.store.plan
            ? {
                ...user.store.plan,
                price: Number(user.store.plan.price),
                originalPrice: Number(user.store.plan.originalPrice),
              }
            : null,
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Strictly redirect SALES users to /sales portal
  if (user.role === "SALES" || user.role === "SALES_AGENT") {
    redirect("/sales");
  }

  if (user.role !== "STORE_OWNER" && user.role !== "STORE_STAFF") {
    throw new Error("403: Akses ditolak. Hanya Store Owner dan Staff yang dapat mengakses merchant panel.");
  }

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
  const fallbackLimits = TIER_LIMITS[tier] || TIER_LIMITS.STARTER;
  const dbPlan = store.plan;

  const maxActiveProducts = dbPlan
    ? (dbPlan.maxActiveProducts >= 999999 ? Infinity : dbPlan.maxActiveProducts)
    : fallbackLimits.maxActiveProducts;
  const maxAdmins = dbPlan ? dbPlan.maxAdmins : fallbackLimits.maxAdmins;
  const allowedTemplates = dbPlan ? dbPlan.availableTemplatesCount : fallbackLimits.allowedTemplates;
  const templateChangeCooldownDays = dbPlan ? dbPlan.templateCooldownDays : fallbackLimits.templateChangeCooldownDays;
  const hasWatermark = dbPlan ? dbPlan.hasWatermark : fallbackLimits.hasWatermark;
  const customDomain = dbPlan ? dbPlan.hasCustomDomain : fallbackLimits.customDomain;

  const remainingProductQuota =
    maxActiveProducts === Infinity
      ? Infinity
      : Math.max(0, maxActiveProducts - activeProductCount);

  return {
    user,
    store: {
      ...store,
      tier,
    },
    limits: {
      maxActiveProducts,
      maxAdmins,
      allowedTemplates,
      templateChangeCooldownDays,
      hasWatermark,
      customDomain,
    },
    usage: {
      activeProductCount,
      staffCount,
      remainingProductQuota,
    },
    permissions: {
      canAddProduct: remainingProductQuota > 0,
      canAddStaff: staffCount < maxAdmins,
      canUseCustomDomain: customDomain,
      isOwner: user.role === "STORE_OWNER",
    },
  };
}

// ─── 4. requireSaasAdmin ──────────────────────────────────────────
/**
 * Guard for Super Admin panel (/super-admin).
 * Allows SUPER_ADMIN and ADMIN_SAAS roles only.
 * Rejects SALES and merchant roles with 403.
 */
export async function requireSaasAdmin(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "SALES" || user.role === "SALES_AGENT") {
    redirect("/sales");
  }

  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SAAS") {
    throw new Error("403: Akses ditolak. Hanya Super Admin SaaS yang diizinkan.");
  }

  return user;
}

// ─── 5. requireSalesAgent (Backward Compat) ──────────────────────
export async function requireSalesAgent(): Promise<SessionUser> {
  return requireAuth(["SUPER_ADMIN", "ADMIN_SAAS", "SALES", "SALES_AGENT"]);
}

// ─── 6. requireSalesPartner ───────────────────────────────────────
/**
 * Guard for Sales Portal (/sales).
 * Strictly authenticates user, ensures role is SALES or SALES_AGENT,
 * and fetches or ensures their SalesPartner profile.
 */
export async function requireSalesPartner() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "STORE_OWNER" || user.role === "STORE_STAFF") {
    redirect("/admin");
  }

  // Super admins can also view or we check if user is SALES / SALES_AGENT
  if (user.role !== "SALES" && user.role !== "SALES_AGENT" && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN_SAAS") {
    throw new Error("403: Akses ditolak. Anda bukan Sales Partner.");
  }

  // Look up SalesPartner record for this user
  let partner = await prisma.salesPartner.findUnique({
    where: { userId: user.id },
  });

  // If partner doesn't exist yet, auto-create one from user data
  if (!partner) {
    const rawUser = await prisma.user.findUnique({ where: { id: user.id } });
    const code = rawUser?.referralCode || `SALES-${user.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6) || "AGENT"}`;
    partner = await prisma.salesPartner.create({
      data: {
        userId: user.id,
        code,
        name: user.name,
        phone: user.phone || "6281234567890",
        bankName: rawUser?.bankName || null,
        bankAccount: rawUser?.bankNumber || null,
        bankHolder: rawUser?.bankHolder || user.name,
      },
    });
  }

  return {
    user,
    partner,
  };
}
