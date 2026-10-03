"use server";

import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";

export interface PlanDistributionMetric {
  planId: string;
  name: string;
  labelBadge: string;
  price: number;
  period: string;
  maxActiveProducts: number;
  maxAdmins: number;
  availableTemplatesCount: number;
  activeStoreCount: number;
  storeCountPercentage: number;
  revenue: number;
  mrrPercentage: number;
}

export interface RecentStoreItem {
  id: string;
  name: string;
  slug: string;
  tier: string;
  planName: string;
  templateId: string;
  hasWatermark: boolean;
  isActive: boolean;
  productCount: number;
  owner: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface SuperAdminDashboardMetrics {
  totalRegisteredStores: number;
  totalActiveStores: number;
  totalInactiveStores: number;
  dynamicMRR: number;
  totalRealizedRevenue: number;
  totalCatalogUnits: number;
  totalCustomDomains: number;
  planDistributions: PlanDistributionMetric[];
  recentStores: RecentStoreItem[];
  dbHealthy: boolean;
  dbLatencyMs: number;
}

/**
 * Server Action: Query all live executive metrics from PostgreSQL database
 */
export async function getSuperAdminDashboardMetricsAction(): Promise<SuperAdminDashboardMetrics> {
  await requireSaasAdmin();

  let dbHealthy = false;
  let dbLatencyMs = 0;

  try {
    const pingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - pingStart;
    dbHealthy = true;
  } catch (error) {
    console.error("Database health check ping failed:", error);
    dbHealthy = false;
  }

  // 1. Parallel live metric queries
  const [
    totalStores,
    activeStores,
    totalProducts,
    customDomainsCount,
    allPlans,
    activeStoresWithPlan,
    storePlanGroups,
    realizedRevenueAgg,
    recentStoresRaw,
  ] = await Promise.all([
    // a. Total stores (excluding demo)
    prisma.store.count({ where: { isDemo: false } }),
    // a. Active paying stores (excluding demo)
    prisma.store.count({ where: { isActive: true, isDemo: false } }),
    // c. Total products in catalog (excluding demo store products)
    prisma.product.count({ where: { store: { isDemo: false } } }),
    // d. Active stores with custom domain (excluding demo)
    prisma.store.count({
      where: {
        isDemo: false,
        AND: [
          { customDomain: { not: null } },
          { customDomain: { not: "" } },
        ],
      },
    }),
    // e. All Subscription Plans from DB
    prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    }),
    // b. Active stores with assigned plan for accurate dynamic MRR (Strictly isDemo: false)
    prisma.store.findMany({
      where: { isActive: true, isDemo: false },
      include: { plan: true },
    }),
    // e. Distribution count per planId (excluding demo)
    prisma.store.groupBy({
      by: ["planId"],
      where: { isActive: true, isDemo: false },
      _count: { id: true },
    }),
    // b. Realized revenue from completed/approved payments (excluding demo)
    prisma.subscriptionPayment.aggregate({
      where: { status: "APPROVED", store: { isDemo: false } },
      _sum: { amount: true },
    }),
    // f. 5 most recent stores
    prisma.store.findMany({
      where: { isDemo: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          where: { role: "STORE_OWNER" },
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { name: true },
        },
        _count: {
          select: { products: true },
        },
      },
    }),
  ]);

  const inactiveStores = Math.max(0, totalStores - activeStores);

  // b. Dynamic MRR calculated from active paying stores' current plan prices (Excludes Demo)
  const dynamicMRR = activeStoresWithPlan.reduce((acc, store) => {
    return acc + Number(store.plan?.price || 0);
  }, 0);

  const totalRealizedRevenue = realizedRevenueAgg._sum.amount || 0;

  // e. Plan distributions calculated mathematically from DB data
  const planDistributions: PlanDistributionMetric[] = allPlans.map((plan) => {
    const group = storePlanGroups.find((g) => g.planId === plan.id);
    const count = group?._count?.id || 0;
    const priceNum = Number(plan.price);
    const revenue = count * priceNum;
    const storeCountPercentage =
      activeStores > 0 ? Math.round((count / activeStores) * 100) : 0;
    const mrrPercentage =
      dynamicMRR > 0 ? Math.round((revenue / dynamicMRR) * 100) : 0;

    return {
      planId: plan.id,
      name: plan.name,
      labelBadge: plan.labelBadge,
      price: priceNum,
      period: plan.period,
      maxActiveProducts: plan.maxActiveProducts,
      maxAdmins: plan.maxAdmins,
      availableTemplatesCount: plan.availableTemplatesCount,
      activeStoreCount: count,
      storeCountPercentage,
      revenue,
      mrrPercentage,
    };
  });

  // f. 5 Recent Stores formatted
  const recentStores: RecentStoreItem[] = recentStoresRaw.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    tier: s.tier,
    planName: s.plan?.name || s.tier,
    templateId: s.templateId,
    hasWatermark: s.hasWatermark,
    isActive: s.isActive,
    productCount: s._count.products,
    owner: s.users[0] || null,
    createdAt: s.createdAt.toISOString(),
  }));

  return {
    totalRegisteredStores: totalStores,
    totalActiveStores: activeStores,
    totalInactiveStores: inactiveStores,
    dynamicMRR,
    totalRealizedRevenue,
    totalCatalogUnits: totalProducts,
    totalCustomDomains: customDomainsCount,
    planDistributions,
    recentStores,
    dbHealthy,
    dbLatencyMs,
  };
}
