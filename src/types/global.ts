/**
 * Global Type Definitions — GadgetBdg SaaS Platform
 *
 * These types are the single source of truth across server components,
 * server actions, and client components (passed as props).
 */

import type { Role, StoreTier } from "@prisma/client";

// ─── Re-export for convenience ────────────────────────────────────
export type { Role, StoreTier };

// ─── Serializable Store shape (safe to pass from server → client) ─
export interface SerializedStore {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  whatsapp: string;
  address: string | null;
  storeImage: string | null;
  mapsUrl: string | null;
  googleReviewUrl: string | null;
  operationalHours: string | null;
  warrantyPolicy: string | null;
  verifiedBadge: boolean;
  tier: StoreTier;
  templateId: string;
  primaryColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  hasWatermark: boolean;
  isActive: boolean;
  subscriptionExpiresAt: Date | null;
  lastTemplateChangeAt: Date | null;
  salesUserId: string | null;
}

// ─── Session User ─────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  storeId: string | null;
  store: SerializedStore | null;
}

// ─── Tier Limits snapshot ─────────────────────────────────────────
export interface TierLimitsSnapshot {
  maxActiveProducts: number; // Infinity → use Number.POSITIVE_INFINITY in display
  maxAdmins: number;
  allowedTemplates: number;
  templateChangeCooldownDays: number;
  hasWatermark: boolean;
  customDomain: boolean;
}

// ─── Live usage counters ──────────────────────────────────────────
export interface TenantUsage {
  activeProductCount: number;
  staffCount: number;
  remainingProductQuota: number; // Infinity when unlimited
}

// ─── Derived permissions ──────────────────────────────────────────
export interface TenantPermissions {
  canAddProduct: boolean;
  canAddStaff: boolean;
  canUseCustomDomain: boolean;
  isOwner: boolean; // role === STORE_OWNER
}

// ─── Full Tenant Context (returned by requireStoreOwnerOrStaff) ───
export interface TenantContext {
  user: SessionUser;
  store: SerializedStore;
  limits: TierLimitsSnapshot;
  usage: TenantUsage;
  permissions: TenantPermissions;
}

// ─── Action response shape ────────────────────────────────────────
export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

// ─── Serialized timestamps for client components ──────────────────
export type WithSerializedDates<T, K extends keyof T = never> = Omit<T, K> & {
  [P in K]: T[P] extends Date ? string : T[P] extends Date | null ? string | null : T[P];
};
