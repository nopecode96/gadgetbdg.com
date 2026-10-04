/**
 * prisma/cleanup-old-stores.js
 * 
 * Script pembersihan database untuk menghapus 5 toko lama/pseudo-klien
 * ('goldcell', 'cybercell', 'tokyostreet', 'gamersgadget', 'berkahcell', dll)
 * sehingga di database HANYA tersisa demo1-demo6 dan akun SUPER_ADMIN.
 * 
 * Tab "Klien Riil" di Super Admin (/super-admin/stores) dijamin kembali 0.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OFFICIAL_DEMO_SLUGS = ["demo1", "demo2", "demo3", "demo4", "demo5", "demo6"];

async function main() {
  console.log("🧹 Memulai pembersihan database: menghapus toko lama & pseudo-klien...");

  // 1. Identifikasi toko yang harus dihapus:
  // - Toko dengan slug lama: goldcell, cybercell, tokyostreet, gamersgadget, berkahcell, dll.
  // - Atau seluruh toko non-demo (isDemo: false) yang bukan demo resmi
  const storesToDelete = await prisma.store.findMany({
    where: {
      OR: [
        {
          slug: {
            in: [
              "goldcell",
              "cybercell",
              "tokyostreet",
              "gamersgadget",
              "berkahcell",
              "bandungcell",
              "juraganhp",
              "uat-gadgetstore",
              "uat-mitracell",
              "uat-bintangcell",
            ],
          },
        },
        {
          AND: [
            { isDemo: false },
            { slug: { notIn: OFFICIAL_DEMO_SLUGS } },
          ],
        },
      ],
    },
    select: { id: true, name: true, slug: true, isDemo: true },
  });

  console.log(`🔍 Ditemukan ${storesToDelete.length} toko yang akan dibersihkan.`);

  for (const store of storesToDelete) {
    console.log(`⏳ Menghapus toko: ${store.name} (${store.slug}) [ID: ${store.id}]...`);

    // 1. Hapus leads & offers
    await prisma.tradeInLead.deleteMany({ where: { storeId: store.id } });
    await prisma.tradeInOffer.deleteMany({ where: { storeId: store.id } });

    // 2. Hapus reviews
    await prisma.storeReview.deleteMany({ where: { storeId: store.id } });

    // 3. Hapus komisi & payments
    await prisma.salesCommissionLog.deleteMany({ where: { storeId: store.id } });
    await prisma.salesCommission.deleteMany({ where: { storeId: store.id } });
    await prisma.subscriptionPayment.deleteMany({ where: { storeId: store.id } });

    // 4. Hapus products
    await prisma.product.deleteMany({ where: { storeId: store.id } });

    // 5. Hapus users milik toko
    await prisma.user.deleteMany({ where: { storeId: store.id } });

    // 6. Hapus branches
    await prisma.branch.deleteMany({ where: { storeId: store.id } });

    // 7. Hapus toko utama
    await prisma.store.delete({ where: { id: store.id } });

    console.log(`   ✅ Berhasil dihapus: ${store.slug}`);
  }

  // 2. Verifikasi sisa toko di database
  const remainingStores = await prisma.store.findMany({
    select: { id: true, slug: true, name: true, isDemo: true, tier: true },
    orderBy: { slug: "asc" },
  });

  const realStores = remainingStores.filter((s) => !s.isDemo);
  const demoStores = remainingStores.filter((s) => s.isDemo);

  console.log("\n================================================================================");
  console.log("📊 STATUS AKHIR DATABASE:");
  console.log("================================================================================");
  console.log(`• Total Toko Demo Resmi (demo1-demo6) : ${demoStores.length} toko`);
  demoStores.forEach((s) => {
    console.log(`  - [DEMO] ${s.slug} (${s.name}) [${s.tier}]`);
  });

  console.log(`\n• Total Klien Riil (isDemo: false)     : ${realStores.length} toko`);
  if (realStores.length > 0) {
    realStores.forEach((s) => {
      console.log(`  - [REAL] ${s.slug} (${s.name})`);
    });
    console.warn("⚠️ PERINGATAN: Masih ada toko klien riil di database!");
  } else {
    console.log("✨ SUKSES MUTLAK: Tab 'Klien Riil' pada Super-Admin kini bernilai 0 (KOSONG & BERSIH)!");
  }
  console.log("================================================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
