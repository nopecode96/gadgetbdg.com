"use server";

import { prisma } from "@/lib/prisma";

export interface SerializedSubscriptionPlan {
  id: string;
  name: string;
  labelBadge: string;
  tagline: string;
  price: number;
  originalPrice: number;
  discountBadge: string | null;
  popularBadge: string | null;
  period: string;
  maxActiveProducts: number;
  maxAdmins: number;
  availableTemplatesCount: number;
  templateCooldownDays: number;
  templateChangeRule: string;
  hasWatermark: boolean;
  hasQrWebsite: boolean;
  hasQrGoogleReview: boolean;
  hasStoryMaker: boolean;
  hasCustomDomain: boolean;
  reportsLevel: string;
  description: string | null;
}

export async function getSubscriptionPlansAction(): Promise<{
  success: boolean;
  plans: SerializedSubscriptionPlan[];
}> {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });

    return {
      success: true,
      plans: plans.map((p) => ({
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
        hasQrWebsite: p.hasQrWebsite,
        hasQrGoogleReview: p.hasQrGoogleReview,
        hasStoryMaker: p.hasStoryMaker,
        hasCustomDomain: p.hasCustomDomain,
        reportsLevel: p.reportsLevel,
        description: p.description,
      })),
    };
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return { success: false, plans: [] };
  }
}
