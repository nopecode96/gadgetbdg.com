const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const email = "sales.bdg01@gadgetbdg.com";
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Sales Bandung 01",
        passwordHash: await bcrypt.hash("Admin123!", 10),
        role: "SALES_AGENT",
        referralCode: "SALESBDG01",
        phone: "62895389974414",
      },
    });
  }
  const partner = await prisma.salesPartner.upsert({
    where: { code: "SALESBDG01" },
    update: { isActive: true },
    create: { userId: user.id, code: "SALESBDG01", name: user.name, phone: "62895389974414", isActive: true },
  });

  // Mirror registerStoreWithPaymentAction attribution
  const found = await prisma.salesPartner.findFirst({
    where: { code: { equals: "salesbdg01", mode: "insensitive" }, isActive: true },
  });
  const slug = "ref-test-store";
  await prisma.store.deleteMany({ where: { slug } });
  const store = await prisma.store.create({
    data: {
      name: "Ref Test Store", slug, tier: "STARTER", planId: "STARTER", whatsapp: "628111", isActive: false,
      salesUserId: found.userId, referredBySalesId: found.id,
    },
  });
  const check = await prisma.store.findUnique({ where: { id: store.id }, include: { referredBySales: true } });
  console.log("referredBySalesId:", check.referredBySalesId, "->", check.referredBySales.name, check.referredBySales.code);
  const count = await prisma.salesPartner.findUnique({ where: { id: partner.id }, include: { _count: { select: { stores: true } } } });
  console.log("stores count:", count._count.stores);
  await prisma.store.delete({ where: { id: store.id } });
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
