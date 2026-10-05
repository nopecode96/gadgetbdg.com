import { requireSaasAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PlansManagerClient } from "./PlansManagerClient";

export const metadata = {
  title: "Manajemen Paket Langganan | Super Admin",
};

export default async function SuperAdminPlansPage() {
  await requireSaasAdmin();

  const plansRaw = await prisma.subscriptionPlan.findMany({
    orderBy: {
      price: "asc",
    },
    include: {
      _count: {
        select: {
          stores: true,
        },
      },
    },
  });

  const plans = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    labelBadge: p.labelBadge,
    tagline: p.tagline,
    price: Number(p.price),
    originalPrice: Number(p.originalPrice),
    discountBadge: p.discountBadge,
    popularBadge: p.popularBadge,
    period: p.period,
    maxActiveProducts: p.maxActiveProducts,
    maxAdmins: p.maxAdmins,
    availableTemplatesCount: p.availableTemplatesCount,
    templateCooldownDays: p.templateCooldownDays,
    templateChangeRule: p.templateChangeRule,
    hasWatermark: p.hasWatermark,
    hasCustomDomain: p.hasCustomDomain,
    customDomain: p.customDomain,
    storeCount: p._count.stores,
    isArchived: p.id === "ADVANCE",
  }));

  return <PlansManagerClient initialPlans={plans} />;
}
