const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function syncBillingDb() {
  console.log("🚀 Memulai sinkronisasi data billing PostgreSQL...");

  // 1. Update record lama yang kolom reviewedByName masih NULL
  const updateRes = await prisma.subscriptionPayment.updateMany({
    where: { reviewedByName: null },
    data: { reviewedByName: "Super Admin (System)" },
  });
  console.log(`✅ Berhasil memperbarui ${updateRes.count} record lama: reviewedByName -> "Super Admin (System)"`);

  // 2. Cek apakah sudah ada transaksi PENDING untuk tokyostreet / cybercell
  const existingPending = await prisma.subscriptionPayment.findFirst({
    where: { status: "PENDING" },
    include: { store: true },
  });

  if (existingPending) {
    console.log(`ℹ️ Sudah ada transaksi PENDING aktif untuk toko "${existingPending.store.name}" (${existingPending.id}).`);
  } else {
    // Ambil toko tokyostreet atau cybercell
    let targetStore = await prisma.store.findUnique({
      where: { slug: "tokyostreet" },
    });

    if (!targetStore) {
      targetStore = await prisma.store.findUnique({
        where: { slug: "cybercell" },
      });
    }

    if (!targetStore) {
      targetStore = await prisma.store.findFirst();
    }

    if (!targetStore) {
      throw new Error("Tidak ada toko ditemukan di database untuk dibuatkan transaksi pending.");
    }

    const proofUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800";

    const newPayment = await prisma.subscriptionPayment.create({
      data: {
        storeId: targetStore.id,
        tier: targetStore.tier || "PRO",
        planId: targetStore.planId || "PRO",
        amount: targetStore.planId === "STARTER" ? 300000 : 600000,
        status: "PENDING",
        receiptUrl: proofUrl,
        notes: "Perpanjangan langganan bulanan toko via Transfer Bank BCA",
        createdAt: new Date(),
      },
      include: {
        store: { select: { name: true, slug: true } },
      },
    });

    console.log(`✅ Berhasil membuat 1 data record riil transaksi PENDING baru:`);
    console.log(`   - ID Pembayaran: ${newPayment.id}`);
    console.log(`   - Toko: ${newPayment.store.name} (${newPayment.store.slug})`);
    console.log(`   - Paket / Tier: ${newPayment.planId}`);
    console.log(`   - Nominal: Rp ${newPayment.amount.toLocaleString("id-ID")}`);
    console.log(`   - Status: ${newPayment.status}`);
    console.log(`   - Bukti Transfer: ${newPayment.receiptUrl}`);
  }

  // 3. Verifikasi Data Terkini
  const [totalPending, totalApproved, payments] = await Promise.all([
    prisma.subscriptionPayment.count({ where: { status: "PENDING" } }),
    prisma.subscriptionPayment.count({ where: { status: "APPROVED" } }),
    prisma.subscriptionPayment.findMany({
      select: {
        id: true,
        tier: true,
        amount: true,
        status: true,
        reviewedByName: true,
        receiptUrl: true,
        store: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  console.log("\n=======================================================");
  console.log(`📊 RINGKASAN DATA BILLING TERKINI:`);
  console.log(`   - Transaksi Menunggu Konfirmasi (PENDING): ${totalPending}`);
  console.log(`   - Transaksi Selesai (APPROVED): ${totalApproved}`);
  console.log("=======================================================");
  payments.forEach((p, idx) => {
    console.log(
      `${idx + 1}. [${p.status.padEnd(8)}] ${p.store.name.padEnd(24)} | Rp ${p.amount.toLocaleString("id-ID").padStart(10)} | Admin: ${p.reviewedByName || "-"}`
    );
  });
  console.log("=======================================================\n");
}

if (require.main === module) {
  syncBillingDb()
    .catch((err) => {
      console.error("❌ Terjadi kesalahan saat sinkronisasi billing:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { syncBillingDb };
