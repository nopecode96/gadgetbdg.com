import { getCurrentUser } from "@/lib/auth/session";
import type { SessionUser } from "@/types/global";

/**
 * Multi-Tenant Authorization Guard
 *
 * Ensures that the authenticated user belongs to the requested store.
 * If targetStoreId is provided, enforces user.storeId === targetStoreId.
 * Rejects with an error if user is unauthenticated or attempting cross-tenant access.
 */
export async function requireStoreAccess(targetStoreId?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.storeId) {
    throw new Error("UNAUTHORIZED: Sesi tidak valid atau pengguna belum login.");
  }

  // Super admin can access any store if explicitly permitted
  if (user.role === "SUPER_ADMIN" || user.role === "ADMIN_SAAS") {
    return user;
  }

  if (targetStoreId && user.storeId !== targetStoreId) {
    throw new Error("FORBIDDEN: Anda tidak memiliki izin akses ke toko ini!");
  }

  return user;
}

/**
 * Branch-level Access Guard
 *
 * Enforces branch restrictions:
 * - STORE_OWNER has access to all branches in user.storeId.
 * - STORE_STAFF with branchId is strictly constrained to their assigned branch.
 */
export function enforceBranchAccess(
  user: SessionUser,
  requestedBranchId?: string | null
): { allowed: boolean; effectiveBranchId: string | null; error?: string } {
  // If user is owner or super admin, they can access any branch within their store
  if (user.role === "STORE_OWNER" || user.role === "SUPER_ADMIN" || user.role === "ADMIN_SAAS") {
    return {
      allowed: true,
      effectiveBranchId: requestedBranchId || null,
    };
  }

  // If user is staff assigned to a specific branch
  if (user.role === "STORE_STAFF" && user.branchId) {
    if (requestedBranchId && requestedBranchId !== user.branchId) {
      return {
        allowed: false,
        effectiveBranchId: user.branchId,
        error: "FORBIDDEN: Staf cabang hanya memiliki izin kelola di cabang yang ditugaskan.",
      };
    }
    return {
      allowed: true,
      effectiveBranchId: user.branchId,
    };
  }

  return {
    allowed: true,
    effectiveBranchId: requestedBranchId || null,
  };
}
