const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedCustomDomainDemo() {
  console.log("🌱 Menyiapkan seeder custom domain demo...");

  // 1. Toko Berkah Cell (Pro Tier) -> berkahcell.com (PENDING)
  const berkah = await prisma.store.findUnique({ where: { slug: "berkahcell" } });
  if (berkah) {
    await prisma.store.update({
      where: { id: berkah.id },
      data: {
        customDomain: "berkahcell.com",
        customDomainStatus: "PENDING",
        customDomainDnsType: "A",
        customDomainVerifiedAt: null,
      },
    });
    console.log(`✅ Berkah Cell updated: customDomain -> berkahcell.com (PENDING)`);
  }

  // 2. Toko Juragan HP Bandung (Advance Tier) -> juraganhpbandung.id (ACTIVE contoh terverifikasi)
  const juragan = await prisma.store.findUnique({ where: { slug: "juraganhp" } });
  if (juragan) {
    await prisma.store.update({
      where: { id: juragan.id },
      data: {
        customDomain: "juraganhpbandung.id",
        customDomainStatus: "ACTIVE",
        customDomainDnsType: "CNAME",
        customDomainVerifiedAt: new Date(),
      },
    });
    console.log(`✅ Juragan HP updated: customDomain -> juraganhpbandung.id (ACTIVE)`);
  }

  // Ringkasan
  const domains = await prisma.store.findMany({
    where: { customDomain: { not: null } },
    select: { name: true, slug: true, customDomain: true, customDomainStatus: true, tier: true },
  });
  console.log("📊 Daftar Toko dengan Custom Domain:", domains);
}

if (require.main === module) {
  seedCustomDomainDemo()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { seedCustomDomainDemo };
