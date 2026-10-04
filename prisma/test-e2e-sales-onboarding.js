/**
 * E2E Test Suite: Sales Partner Onboarding & Referral Attribution
 *
 * Skenario Pengujian:
 * 1. Pendaftaran 1 akun Sales Partner baru ("Rian Sales BDG", RIANBDG)
 * 2. Registrasi merchant baru menggunakan Kode Referral RIANBDG
 * 3. Verifikasi query super-admin:
 *    - Toko terdaftar dengan referredBySalesId & salesUserId yang tepat
 *    - Muncul di query getAllStoresAction ("Klien Riil")
 *    - Label Owner/Sales menampilkan "Sales: Rian Sales BDG (RIANBDG)"
 *    - Agregasi _count.stores pada SalesPartner bernilai 1
 *    - Sales portal query menampilkan toko dalam portofolio
 * 4. Pembersihan otomatis (Clean up) dengan opsi flag --keep
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const KEEP_DATA = process.argv.includes("--keep");

async function runE2ETest() {
  console.log("================================================================================");
  console.log("🧪 STARTING E2E TEST: SALES PARTNER ONBOARDING & REFERRAL ATTRIBUTION");
  console.log("================================================================================\n");

  const salesData = {
    name: "Rian Sales BDG",
    email: "sales.rian@gadgetbdg.com",
    rawPhone: "081223344556",
    formattedPhone: "6281223344556",
    referralCode: "RIANBDG",
    password: "Password123!",
  };

  const storeData = {
    name: "Galaxy Phone Bandung",
    slug: "galaxyphone",
    ownerName: "Budi Santoso",
    email: "budi@galaxyphone.com",
    rawPhone: "081987654321",
    formattedPhone: "6281987654321",
    password: "Password123!",
    tier: "STARTER",
    templateId: "minimal-clean",
  };

  try {
    // -------------------------------------------------------------------------
    // 0. Pre-cleaning (jika ada sisa pengujian sebelumnya)
    // -------------------------------------------------------------------------
    console.log("🧹 [PRE-CHECK] Memastikan lingkungan uji bersih...");
    await prisma.subscriptionPayment.deleteMany({
      where: { store: { slug: storeData.slug } },
    });
    await prisma.product.deleteMany({
      where: { store: { slug: storeData.slug } },
    });
    await prisma.user.deleteMany({
      where: { email: storeData.email },
    });
    await prisma.store.deleteMany({
      where: { slug: storeData.slug },
    });
    await prisma.salesPartner.deleteMany({
      where: { code: salesData.referralCode },
    });
    await prisma.user.deleteMany({
      where: { email: salesData.email },
    });
    console.log("   ✅ Lingkungan uji siap.\n");

    // -------------------------------------------------------------------------
    // LANGKAH 1: Pembuatan Akun Sales Partner
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 1: Pembuatan Akun Sales Partner di Super-Admin");
    console.log("--------------------------------------------------------------------------------");
    console.log(`   Input:`);
    console.log(`   - Nama: ${salesData.name}`);
    console.log(`   - Email: ${salesData.email}`);
    console.log(`   - No WA: ${salesData.rawPhone} -> ${salesData.formattedPhone}`);
    console.log(`   - Kode Referral: ${salesData.referralCode}`);

    // Eksekusi logika createInternalAdminAction
    const cleanEmail = salesData.email.toLowerCase().trim();
    const cleanRefCode = salesData.referralCode.trim().toUpperCase();
    let cleanPhone = salesData.rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) cleanPhone = "62" + cleanPhone.slice(1);

    const passwordHash = await bcrypt.hash(salesData.password, 10);

    const createdSalesUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: salesData.name,
          email: cleanEmail,
          passwordHash,
          role: "SALES",
          phone: cleanPhone,
          storeId: null,
          referralCode: cleanRefCode,
        },
      });

      const partner = await tx.salesPartner.create({
        data: {
          userId: user.id,
          code: cleanRefCode,
          name: user.name,
          phone: cleanPhone,
          isActive: true,
        },
      });

      return { user, partner };
    });

    console.log(`\n   🔍 [ASSERTION 1.1] Verifikasi record SalesPartner di PostgreSQL...`);
    const verifiedPartner = await prisma.salesPartner.findUnique({
      where: { code: cleanRefCode },
      include: { user: true },
    });

    if (!verifiedPartner) throw new Error("ASSERTION FAILED: Record SalesPartner tidak ditemukan di DB!");
    if (verifiedPartner.code !== "RIANBDG") throw new Error(`ASSERTION FAILED: Kode referral mismatch: ${verifiedPartner.code}`);
    if (verifiedPartner.isActive !== true) throw new Error("ASSERTION FAILED: SalesPartner harus isActive: true!");
    if (verifiedPartner.phone !== "6281223344556") throw new Error(`ASSERTION FAILED: Phone mismatch: ${verifiedPartner.phone}`);

    console.log(`   ✅ PASS: SalesPartner '${verifiedPartner.name}' ID=${verifiedPartner.id}`);
    console.log(`            Kode=${verifiedPartner.code}, Phone=${verifiedPartner.phone}, isActive=${verifiedPartner.isActive}\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 2: Registrasi Toko Baru Menggunakan Kode Referral RIANBDG
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 2: Registrasi Merchant Baru via URL Referral (?ref=RIANBDG)");
    console.log("--------------------------------------------------------------------------------");
    console.log(`   Simulasi URL: https://gadgetbdg.com/register?ref=${cleanRefCode}`);
    console.log(`   Data Toko: ${storeData.name} (${storeData.slug})`);
    console.log(`   Owner: ${storeData.ownerName} (${storeData.email})`);

    // Logika verifikasi referral saat registrasi (seperti di registerStoreWithPaymentAction)
    const matchedPartner = await prisma.salesPartner.findFirst({
      where: {
        code: { equals: cleanRefCode, mode: "insensitive" },
        isActive: true,
      },
      select: { id: true, userId: true, name: true, code: true },
    });

    if (!matchedPartner) {
      throw new Error(`ASSERTION FAILED: Kode referral ${cleanRefCode} gagal divalidasi oleh sistem!`);
    }
    console.log(`   ✅ Validasi Referral Berhasil: Kode '${cleanRefCode}' valid milik '${matchedPartner.name}'`);

    let cleanStoreWa = storeData.rawPhone.replace(/\D/g, "");
    if (cleanStoreWa.startsWith("0")) cleanStoreWa = "62" + cleanStoreWa.slice(1);
    const ownerPasswordHash = await bcrypt.hash(storeData.password, 12);

    const regResult = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: storeData.name,
          slug: storeData.slug,
          tier: storeData.tier,
          planId: storeData.tier,
          templateId: storeData.templateId,
          whatsapp: cleanStoreWa,
          address: "BEC Lantai 2, Bandung",
          primaryColor: "#2563eb",
          hasWatermark: false,
          lastTemplateChangeAt: new Date(),
          isActive: true, // Diaktifkan agar masuk kategori Klien Riil aktif
          salesUserId: matchedPartner.userId,
          referredBySalesId: matchedPartner.id,
        },
      });

      const user = await tx.user.create({
        data: {
          email: storeData.email,
          passwordHash: ownerPasswordHash,
          name: storeData.ownerName,
          role: "STORE_OWNER",
          storeId: store.id,
        },
      });

      const payment = await tx.subscriptionPayment.create({
        data: {
          storeId: store.id,
          tier: storeData.tier,
          planId: storeData.tier,
          amount: 250000,
          status: "APPROVED",
        },
      });

      return { store, user, payment };
    });

    console.log(`\n   🔍 [ASSERTION 2.1] Verifikasi record Store dan Foreign Keys di DB...`);
    const verifiedStore = await prisma.store.findUnique({
      where: { id: regResult.store.id },
      include: {
        referredBySales: true,
        salesUser: true,
        users: { where: { role: "STORE_OWNER" } },
      },
    });

    if (!verifiedStore) throw new Error("ASSERTION FAILED: Store tidak ditemukan!");
    if (verifiedStore.referredBySalesId !== verifiedPartner.id) {
      throw new Error(`ASSERTION FAILED: referredBySalesId (${verifiedStore.referredBySalesId}) != partnerId (${verifiedPartner.id})`);
    }
    if (verifiedStore.salesUserId !== verifiedPartner.userId) {
      throw new Error(`ASSERTION FAILED: salesUserId (${verifiedStore.salesUserId}) != partner.userId (${verifiedPartner.userId})`);
    }
    console.log(`   ✅ PASS: Toko '${verifiedStore.name}' berhasil diikat ke Sales Partner:`);
    console.log(`            - referredBySalesId: ${verifiedStore.referredBySalesId} (${verifiedStore.referredBySales?.name})`);
    console.log(`            - salesUserId      : ${verifiedStore.salesUserId} (${verifiedStore.salesUser?.name})\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 3: Verifikasi di Query Super-Admin (Stores & Sales Portal)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 3: Verifikasi Agregasi Super-Admin (Stores & Sales Portal)");
    console.log("--------------------------------------------------------------------------------");

    // 3.1. Query halaman /super-admin/stores (getAllStoresAction)
    console.log("   🔍 [ASSERTION 3.1] Query getAllStoresAction (Super-Admin Store Management)...");
    const storesRaw = await prisma.store.findMany({
      where: {},
      include: {
        plan: true,
        referredBySales: { select: { id: true, code: true, name: true, phone: true } },
        salesUser: {
          include: {
            salesPartner: { select: { id: true, code: true, name: true, phone: true } },
          },
        },
        users: { where: { role: "STORE_OWNER" }, select: { id: true, name: true, email: true }, take: 1 },
        _count: { select: { products: true, tradeInOffers: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedStores = storesRaw.map((s) => {
      const owner = s.users.length > 0 ? s.users[0] : null;
      const sales = s.referredBySales || s.salesUser?.salesPartner || null;
      return {
        ...s,
        owner,
        salesPartner: sales,
      };
    });

    const realStores = mappedStores.filter((s) => !s.isDemo);
    console.log(`      Total Toko Klien Riil di DB: ${realStores.length}`);

    const targetStoreInList = realStores.find((s) => s.slug === storeData.slug);
    if (!targetStoreInList) throw new Error("ASSERTION FAILED: Toko baru tidak muncul di tab Klien Riil!");
    if (!targetStoreInList.salesPartner) throw new Error("ASSERTION FAILED: salesPartner null pada query toko!");

    const salesDisplayLabel = `Sales: ${targetStoreInList.salesPartner.name} (${targetStoreInList.salesPartner.code})`;
    console.log(`      Label Tampilan di UI Table: '${salesDisplayLabel}'`);
    if (salesDisplayLabel !== "Sales: Rian Sales BDG (RIANBDG)") {
      throw new Error(`ASSERTION FAILED: Format label UI salah: ${salesDisplayLabel}`);
    }
    console.log(`   ✅ PASS: Toko '${storeData.name}' muncul di tab Klien Riil dengan atribusi '${salesDisplayLabel}'.`);

    // 3.2. Query halaman /super-admin/sales-portal
    console.log("\n   🔍 [ASSERTION 3.2] Query Agregasi Sales Portal (SalesPartner._count.stores)...");
    const salesPartnerAggregation = await prisma.salesPartner.findUnique({
      where: { code: cleanRefCode },
      select: {
        id: true,
        name: true,
        code: true,
        _count: { select: { stores: true } },
        stores: {
          select: { id: true, name: true, slug: true, tier: true, isActive: true },
        },
      },
    });

    if (!salesPartnerAggregation) throw new Error("ASSERTION FAILED: SalesPartner hilang saat query portal!");
    console.log(`      Metrik _count.stores pada SalesPartner '${salesPartnerAggregation.name}': ${salesPartnerAggregation._count.stores}`);
    if (salesPartnerAggregation._count.stores !== 1) {
      throw new Error(`ASSERTION FAILED: _count.stores harus 1, tetapi terbaca: ${salesPartnerAggregation._count.stores}`);
    }
    const storeInPortfolio = salesPartnerAggregation.stores.find((s) => s.slug === storeData.slug);
    if (!storeInPortfolio) {
      throw new Error("ASSERTION FAILED: Toko 'Galaxy Phone Bandung' tidak masuk ke array portofolio sales!");
    }
    console.log(`      Portofolio Toko: [ ${storeInPortfolio.name} (${storeInPortfolio.slug}) - Paket ${storeInPortfolio.tier} ]`);
    console.log(`   ✅ PASS: Metrik 'Jumlah Toko Didapat' = 1 & toko ada di portofolio sales.\n`);

    // -------------------------------------------------------------------------
    // CLEANUP / HIGIENE DATABASE
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("🧹 PEMBERSIHAN DATA UJI (DATABASE HYGIENE)");
    console.log("--------------------------------------------------------------------------------");
    if (KEEP_DATA) {
      console.log("   ℹ️ Flag --keep terdeteksi. Data uji tetap disimpan di database.");
    } else {
      console.log("   Menghapus data uji coba (Galaxy Phone Bandung & Rian Sales BDG)...");
      await prisma.subscriptionPayment.deleteMany({
        where: { store: { slug: storeData.slug } },
      });
      await prisma.user.deleteMany({
        where: { email: storeData.email },
      });
      await prisma.store.deleteMany({
        where: { slug: storeData.slug },
      });
      await prisma.salesPartner.deleteMany({
        where: { code: salesData.referralCode },
      });
      await prisma.user.deleteMany({
        where: { email: salesData.email },
      });

      // Verifikasi kembali Klien Riil
      const remainingRealStores = await prisma.store.count({ where: { isDemo: false } });
      console.log(`   ✅ Pembersihan selesai! Sisa Toko Klien Riil di DB: ${remainingRealStores}`);
    }

    console.log("\n================================================================================");
    console.log("🎉 ALL E2E ASSERTIONS PASSED SUCCESSFULLY (100% DATABASE SINGLE SOURCE OF TRUTH)");
    console.log("================================================================================");
  } catch (error) {
    console.error("\n❌ E2E TEST FAILED WITH ERROR:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETest();
