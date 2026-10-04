/**
 * prisma/cleanup-old-stores.js
 * Script pembersihan database untuk menghapus 5 toko lama/pseudo-klien
 * sehingga di database HANYA tersisa demo1-demo6 dan akun SUPER_ADMIN.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const slugsToDelete = [
    "goldcell",
    "cybercell",
    "tokyostreet",
    "gamersgadget",
    "berkahcell",
  ];

  console.log("🧹 Memeriksa dan membersihkan toko lama di luar demo1-demo6...");

  for (const slug of slugsToDelete) {
    const store = await prisma.store.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (store) {
      console.log(`⏳ Menghapus dependensi toko: ${store.name} (${slug})...`);

      // 1. Hapus leads & offers
      await prisma.tradeInLead.deleteMany({ where: { storeId: store.id } });
      await prisma.tradeInOffer.deleteMany({ where: { storeId: store.id } });

      // 2. Hapus reviews
      await prisma.storeReview.deleteMany({ where: { storeId: store.id } });

      // 3. Hapus logs, commissions, & payments
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

      console.log(`✅ Berhasil menghapus toko: ${store.name} (${slug})`);
    } else {
      console.log(`ℹ️ Toko "${slug}" sudah tidak ada di database.`);
    }
  }

  // Verifikasi sisa toko di database
  const remainingStores = await prisma.store.findMany({
    select: { id: true, slug: true, name: true, isDemo: true },
    orderBy: { slug: "asc" },
  });

  const realStoresCount = remainingStores.filter((s) => !s.isDemo).length;
  const demoStoresCount = remainingStores.filter((s) => s.isDemo).length;

  console.log("\n📊 HASIL AKHIR DATABASE:");
  console.log(`• Total Toko Demo: ${demoStoresCount}`);
  console.log(`• Total Klien Riil: ${realStoresCount}`);
  console.log("• Daftar Toko Aktif:", remainingStores.map((s) => `${s.slug} (${s.isDemo ? "DEMO" : "REAL"})`));

  if (realStoresCount === 0) {
    console.log("✨ SUKSES: Tab 'Klien Riil' pada Super-Admin kini 0 (bersih).");
  } else {
    console.warn("⚠️ Peringatan: Masih ada klien riil di database.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Cleanup error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
