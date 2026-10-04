import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TradeInLeadsClient } from "./TradeInLeadsClient";

export const revalidate = 0;

export default async function AdminTradeInsPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const leadWhere: any = { storeId: store.id };
  const offerWhere: any = { storeId: store.id };

  if (ctx.user.role === "STORE_STAFF" && ctx.user.branchId) {
    leadWhere.branchId = ctx.user.branchId;
    // legacy offers don't have branchId, so hide them from staff assigned to specific branches
    offerWhere.id = "none";
  }

  const [leads, offers] = await Promise.all([
    prisma.tradeInLead.findMany({
      where: leadWhere,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            slug: true,
            isMain: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tradeInOffer.findMany({
      where: offerWhere,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Normalize and map both TradeInLead (primary) and legacy TradeInOffer
  const normalizedLeads = [
    ...leads.map((l) => ({
      id: l.id,
      storeId: l.storeId,
      branchId: l.branchId,
      branch: l.branch ? { id: l.branch.id, name: l.branch.name, slug: l.branch.slug } : null,
      type: l.type as "TRADE_IN" | "SELL_ONLY",
      customerName: l.customerName,
      customerPhone: l.customerPhone,
      deviceModel: l.deviceModel,
      condition: l.condition,
      completeness: l.completeness,
      notes: l.notes,
      pricingType: l.pricingType as "APPRAISAL_REQUEST" | "EXPECTED_PRICE",
      expectedPrice: l.expectedPrice ? Number(l.expectedPrice) : null,
      targetProductId: l.targetProductId,
      targetProductTitle: l.targetProductTitle,
      status: l.status,
      adminNotes: l.adminNotes,
      createdAt: l.createdAt.toISOString(),
      source: "lead" as const,
    })),
    ...offers.map((o) => ({
      id: o.id,
      storeId: o.storeId,
      type: "TRADE_IN" as const,
      customerName: o.customerName,
      customerPhone: o.customerPhone || o.customerWa,
      deviceModel: o.phoneModel || o.deviceModel,
      condition: o.condition || o.conditionDesc,
      completeness: o.completeness || "FULLSET",
      notes: o.minusNotes,
      pricingType: (o.expectedPrice ? "EXPECTED_PRICE" : "APPRAISAL_REQUEST") as any,
      expectedPrice: o.expectedPrice ? Number(o.expectedPrice) : null,
      targetProductId: null,
      targetProductTitle: null,
      status: o.status,
      adminNotes: null,
      createdAt: o.createdAt.toISOString(),
      source: "legacy_offer" as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const serializedStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    whatsapp: store.whatsapp,
  };

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
      <TradeInLeadsClient store={serializedStore} initialLeads={normalizedLeads} />
    </div>
  );
}
