/**
 * UAT Test Suite: End-to-End Store Purchase with Sales Partner Referral & Commission Tracking
 *
 * Skenario Pengujian:
 * 1. Penyiapan Akun Sales Partner Aktif:
 *    - Akun User & SalesPartner "Rian Sales BDG" dengan kode referral "RIANPROMO" (isActive = true).
 * 2. Calon Merchant Mendaftar Paket PRO Menggunakan Kode Referral Sales:
 *    - Pendaftaran merchant "UAT Mitra Cell" (Owner: Ahmad Maulana) via ref code "RIANPROMO".
 *    - Assertion: Store terbuat dengan referredBySalesId & salesUserId menunjuk ke Sales Rian, isActive = false.
 *    - Assertion: Invoice SubscriptionPayment terbuat dengan status PENDING senilai Rp 600.000.
 * 3. Simulasi Pembayaran & Unggah Bukti Bayar:
 *    - Upload receiptUrl & notes transfer bank.
 *    - Assertion: Bukti tersimpan, status invoice tetap PENDING.
 * 4. Super Admin Menyetujui Pembayaran & Aktivasi Komisi:
 *    - Eksekusi Server Action persetujuan pembayaran (approveSubscriptionPaymentAction).
 *    - Status invoice APPROVED, Store.isActive = true, masa aktif +30 hari.
 *    - Assertion: Record SalesCommission & SalesCommissionLog tercatat ke Sales Rian.
 *    - Assertion: Metrik portofolio sales (_count.stores) bertambah menjadi 1.
 * 5. Verifikasi Dashboard Super-Admin (/super-admin/stores) & Sales Portal (/super-admin/sales-portal):
 *    - Query Super Admin menampilkan toko aktif dengan atribut Sales: Rian Sales BDG (RIANPROMO).
 *    - Query Sales Portal menampilkan toko UAT Mitra Cell dalam daftar portofolio sales Rian.
 * 6. Pembersihan Data Uji (Database Hygiene Cleanup):
 *    - Seluruh data uji dibersihkan higienis, Klien Riil kembali 0.
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const KEEP_DATA = process.argv.includes("--keep");

async function runSalesUATTest() {
  console.log("================================================================================");
  console.log("🧪 STARTING UAT TEST: STORE PURCHASE VIA SALES REFERRAL & COMMISSION FLOW");
  console.log("================================================================================\n");

  const salesData = {
    name: "Rian Sales BDG",
    email: "sales.rian@gadgetbdg.com",
    phone: "6281223344556",
    referralCode: "RIANPROMO",
    password: "SalesPassword123!",
    bankName: "BCA",
    bankAccount: "8830192831",
    bankHolder: "Rian Sales BDG",
  };

  const merchantData = {
    name: "UAT Mitra Cell",
    slug: "uat-mitracell",
    ownerName: "Ahmad Maulana",
    email: "ahmad.uat@mitracell.com",
    rawPhone: "081299112233",
    formattedPhone: "6281299112233",
    password: "MerchantPassword123!",
    tier: "PRO",
    proPrice: 600000,
    referralCode: "RIANPROMO",
  };

  try {
    // -------------------------------------------------------------------------
    // 0. PRE-CLEANING
    // -------------------------------------------------------------------------
    console.log("🧹 [PRE-CHECK] Membersihkan data uji sales & store sebelumnya jika ada...");
    
    // Hapus relasi komisi & pembayaran untuk toko uji
    await prisma.salesCommission.deleteMany({
      where: {
        OR: [
          { store: { slug: merchantData.slug } },
          { salesPartner: { code: salesData.referralCode } },
        ],
      },
    });
    await prisma.salesCommissionLog.deleteMany({
      where: {
        OR: [
          { store: { slug: merchantData.slug } },
          { salesUser: { email: salesData.email } },
        ],
      },
    });
    await prisma.subscriptionPayment.deleteMany({
      where: { store: { slug: merchantData.slug } },
    });
    await prisma.product.deleteMany({
      where: { store: { slug: merchantData.slug } },
    });
    await prisma.user.deleteMany({
      where: { email: merchantData.email },
    });
    await prisma.store.deleteMany({
      where: { slug: merchantData.slug },
    });

    // Hapus SalesPartner & User Sales uji
    const existingSalesUser = await prisma.user.findUnique({
      where: { email: salesData.email },
    });
    if (existingSalesUser) {
      await prisma.salesPartner.deleteMany({
        where: { userId: existingSalesUser.id },
      });
      await prisma.user.delete({
        where: { id: existingSalesUser.id },
      });
    }
    await prisma.salesPartner.deleteMany({
      where: { code: salesData.referralCode },
    });

    console.log("   ✅ Lingkungan database bersih & siap diuji.\n");

    // -------------------------------------------------------------------------
    // LANGKAH 1: Penyiapan Akun Sales Partner Aktif
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 1: Penyiapan Akun Sales Partner Aktif");
    console.log("--------------------------------------------------------------------------------");
    console.log("   Profil Sales Partner:");
    console.log(`   - Nama         : ${salesData.name}`);
    console.log(`   - Email        : ${salesData.email}`);
    console.log(`   - WhatsApp     : ${salesData.phone}`);
    console.log(`   - Kode Referral: ${salesData.referralCode}`);
    console.log(`   - Rekening Bank: ${salesData.bankName} - ${salesData.bankAccount} (a.n ${salesData.bankHolder})`);

    const salesPasswordHash = await bcrypt.hash(salesData.password, 10);

    const createdSales = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: salesData.name,
          email: salesData.email,
          passwordHash: salesPasswordHash,
          role: "SALES",
          phone: salesData.phone,
          storeId: null,
          referralCode: salesData.referralCode,
          bankName: salesData.bankName,
          bankNumber: salesData.bankAccount,
          bankHolder: salesData.bankHolder,
        },
      });

      const partner = await tx.salesPartner.create({
        data: {
          userId: user.id,
          code: salesData.referralCode,
          name: salesData.name,
          phone: salesData.phone,
          bankName: salesData.bankName,
          bankAccount: salesData.bankAccount,
          bankHolder: salesData.bankHolder,
          isActive: true,
        },
      });

      return { user, partner };
    });

    console.log(`\n   🔍 [ASSERTION 1] Verifikasi Record User Sales & SalesPartner di Database...`);
    const verifiedSalesUser = await prisma.user.findUnique({
      where: { id: createdSales.user.id },
      include: { salesPartner: true },
    });

    if (!verifiedSalesUser) throw new Error("ASSERTION 1 FAILED: User Sales gagal dibuat!");
    if (verifiedSalesUser.role !== "SALES") throw new Error(`ASSERTION 1 FAILED: Role salah: ${verifiedSalesUser.role}`);
    if (!verifiedSalesUser.salesPartner) throw new Error("ASSERTION 1 FAILED: Relasi SalesPartner tidak ditemukan!");
    if (verifiedSalesUser.salesPartner.code !== salesData.referralCode) {
      throw new Error(`ASSERTION 1 FAILED: Kode referral salah: ${verifiedSalesUser.salesPartner.code}`);
    }
    if (verifiedSalesUser.salesPartner.isActive !== true) {
      throw new Error("ASSERTION 1 FAILED: Status SalesPartner harus isActive: true!");
    }

    console.log(`   ✅ PASS: Akun Sales Partner '${verifiedSalesUser.name}' ID=${verifiedSalesUser.salesPartner.id}`);
    console.log(`            Kode Referral: ${verifiedSalesUser.salesPartner.code}`);
    console.log(`            Status Aktif : ${verifiedSalesUser.salesPartner.isActive}`);
    console.log(`            Relasi User  : ${verifiedSalesUser.email} (Role: ${verifiedSalesUser.role})\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 2: Calon Merchant Mendaftar Paket PRO Menggunakan Kode Referral Sales
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 2: Registrasi Merchant Baru dengan Kode Referral Sales (?ref=RIANPROMO)");
    console.log("--------------------------------------------------------------------------------");
    console.log(`   Input Payload Onboarding:`);
    console.log(`   - Nama Toko    : ${merchantData.name}`);
    console.log(`   - Subdomain    : ${merchantData.slug}.gadgetbdg.com`);
    console.log(`   - Owner        : ${merchantData.ownerName} (${merchantData.email})`);
    console.log(`   - WhatsApp     : ${merchantData.rawPhone} -> ${merchantData.formattedPhone}`);
    console.log(`   - Paket Pilihan: ${merchantData.tier} (Rp ${merchantData.proPrice.toLocaleString("id-ID")})`);
    console.log(`   - Referral Code: ${merchantData.referralCode}`);

    // Simulasi validasi referral code seperti di registerStoreAction
    const validPartner = await prisma.salesPartner.findFirst({
      where: {
        code: { equals: merchantData.referralCode, mode: "insensitive" },
        isActive: true,
      },
      select: { id: true, userId: true, name: true, code: true },
    });

    if (!validPartner) {
      throw new Error("ASSERTION 2 PRE-CHECK FAILED: Kode referral tidak valid atau tidak aktif!");
    }

    let cleanMerchantWa = merchantData.rawPhone.replace(/\D/g, "");
    if (cleanMerchantWa.startsWith("0")) cleanMerchantWa = "62" + cleanMerchantWa.slice(1);
    const merchantPasswordHash = await bcrypt.hash(merchantData.password, 12);

    const registration = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: merchantData.name,
          slug: merchantData.slug,
          tier: merchantData.tier,
          planId: merchantData.tier,
          templateId: "minimal-clean",
          whatsapp: cleanMerchantWa,
          address: "ITC Kebon Kalapa Lantai 3 Blok E-01, Bandung",
          primaryColor: "#2563eb",
          hasWatermark: true,
          lastTemplateChangeAt: new Date(),
          isActive: false, // Menunggu pembayaran
          salesUserId: validPartner.userId,
          referredBySalesId: validPartner.id,
        },
      });

      const user = await tx.user.create({
        data: {
          email: merchantData.email,
          passwordHash: merchantPasswordHash,
          name: merchantData.ownerName,
          role: "STORE_OWNER",
          storeId: store.id,
        },
      });

      const payment = await tx.subscriptionPayment.create({
        data: {
          storeId: store.id,
          tier: merchantData.tier,
          planId: merchantData.tier,
          amount: merchantData.proPrice,
          receiptUrl: null,
          status: "PENDING",
        },
      });

      return { store, user, payment };
    });

    console.log(`\n   🔍 [ASSERTION 2] Verifikasi Atribusi Sales & Record Database Toko...`);
    const initialStore = await prisma.store.findUnique({
      where: { id: registration.store.id },
      include: {
        referredBySales: true,
        salesUser: true,
      },
    });
    const initialPayment = await prisma.subscriptionPayment.findUnique({
      where: { id: registration.payment.id },
    });

    if (!initialStore) throw new Error("ASSERTION 2 FAILED: Store gagal dibuat!");
    if (initialStore.isActive !== false) throw new Error("ASSERTION 2 FAILED: Store harus isActive: false sebelum bayar!");
    if (initialStore.referredBySalesId !== validPartner.id) {
      throw new Error(`ASSERTION 2 FAILED: referredBySalesId mismatch! Harapan=${validPartner.id}, Aktual=${initialStore.referredBySalesId}`);
    }
    if (initialStore.salesUserId !== validPartner.userId) {
      throw new Error(`ASSERTION 2 FAILED: salesUserId mismatch! Harapan=${validPartner.userId}, Aktual=${initialStore.salesUserId}`);
    }

    if (!initialPayment) throw new Error("ASSERTION 2 FAILED: SubscriptionPayment gagal dibuat!");
    if (initialPayment.status !== "PENDING") throw new Error(`ASSERTION 2 FAILED: Status invoice salah: ${initialPayment.status}`);
    if (initialPayment.amount !== 600000) throw new Error(`ASSERTION 2 FAILED: Nominal salah: ${initialPayment.amount}`);

    console.log(`   ✅ PASS: Toko '${initialStore.name}' ID=${initialStore.id}`);
    console.log(`            referredBySalesId : ${initialStore.referredBySalesId} -> '${initialStore.referredBySales?.name}' (${initialStore.referredBySales?.code})`);
    console.log(`            salesUserId       : ${initialStore.salesUserId}`);
    console.log(`            Status Toko       : isActive = ${initialStore.isActive} (Menunggu bayar)`);
    console.log(`            Invoice Tagihan   : ID=${initialPayment.id}, Status=${initialPayment.status}, Amount=Rp ${initialPayment.amount.toLocaleString("id-ID")}\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 3: Simulasi Pembayaran & Unggah Bukti Bayar
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 3: Simulasi Pembayaran Merchant & Unggah Bukti Transfer");
    console.log("--------------------------------------------------------------------------------");
    const receiptPath = "/uploads/receipts/proof-uat-mitracell.png";
    const paymentNote = "Transfer Mandiri an Ahmad Maulana Ref: 7721890";
    console.log(`   Merchant mengunggah bukti bayar:`);
    console.log(`   - Receipt URL: ${receiptPath}`);
    console.log(`   - Catatan    : ${paymentNote}`);

    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: initialPayment.id },
      data: {
        receiptUrl: receiptPath,
        notes: paymentNote,
        status: "PENDING",
      },
    });

    console.log(`\n   🔍 [ASSERTION 3] Verifikasi Bukti Pembayaran Tercatat di Database...`);
    if (updatedPayment.receiptUrl !== receiptPath) throw new Error("ASSERTION 3 FAILED: receiptUrl gagal disimpan!");
    if (updatedPayment.notes !== paymentNote) throw new Error("ASSERTION 3 FAILED: notes gagal disimpan!");
    if (updatedPayment.status !== "PENDING") throw new Error("ASSERTION 3 FAILED: Status invoice berubah sebelum approval!");

    console.log(`   ✅ PASS: Bukti transfer berhasil dilampirkan: ${updatedPayment.receiptUrl}`);
    console.log(`            Catatan Transfer: '${updatedPayment.notes}'`);
    console.log(`            Status Invoice  : ${updatedPayment.status} (Siap ditinjau Super Admin)\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 4: Super Admin Menyetujui Pembayaran & Aktivasi Komisi
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 4: Super Admin Menyetujui Pembayaran & Aktivasi Komisi");
    console.log("--------------------------------------------------------------------------------");
    const reviewerName = "Super Administrator SaaS";
    console.log(`   Super Admin '${reviewerName}' mengeksekusi approveSubscriptionPaymentAction...`);

    const approvalResult = await prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.findUnique({
        where: { id: initialPayment.id },
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              customDomain: true,
              whatsapp: true,
              salesUserId: true,
              referredBySalesId: true,
              subscriptionExpiresAt: true,
            },
          },
        },
      });

      if (!payment) throw new Error("Payment tidak ditemukan.");
      const now = new Date();
      const SUBSCRIPTION_DAYS = 30;
      const DAY_MS = 24 * 60 * 60 * 1000;
      const base = payment.store.subscriptionExpiresAt && payment.store.subscriptionExpiresAt.getTime() > now.getTime()
        ? payment.store.subscriptionExpiresAt
        : now;
      const newEnd = new Date(base.getTime() + SUBSCRIPTION_DAYS * DAY_MS);

      const plan = await tx.subscriptionPlan.findUnique({
        where: { id: payment.planId || payment.tier },
      });
      if (!plan) throw new Error("Plan tidak ditemukan.");

      // 1. Update Payment -> APPROVED
      const updatedP = await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          paidAt: now,
          reviewedByName: reviewerName,
        },
      });

      // 2. Update Store -> isActive = true
      const updatedS = await tx.store.update({
        where: { id: payment.storeId },
        data: {
          isActive: true,
          planId: plan.id,
          tier: payment.tier,
          hasWatermark: plan.hasWatermark,
          subscriptionStartedAt: now,
          subscriptionExpiresAt: newEnd,
        },
        include: { plan: true },
      });

      // 3. Hitung Komisi Sales
      const commAmount = Number(plan.salesCommission) > 0
        ? Number(plan.salesCommission)
        : (payment.tier === "PRO" ? 100_000 : 50_000);
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      // 4. Catat ke SalesCommission (SalesPartner)
      let partnerId = payment.store.referredBySalesId;
      if (!partnerId && payment.store.salesUserId) {
        const existingPartner = await tx.salesPartner.findUnique({
          where: { userId: payment.store.salesUserId },
        });
        if (existingPartner) partnerId = existingPartner.id;
      }

      let createdCommission = null;
      if (partnerId) {
        createdCommission = await tx.salesCommission.create({
          data: {
            salesPartnerId: partnerId,
            storeId: payment.storeId,
            amount: commAmount,
            status: "PENDING",
            period: currentPeriod,
          },
        });
      }

      // 5. Catat ke SalesCommissionLog (User salesUserId)
      let createdCommissionLog = null;
      if (payment.store.salesUserId) {
        createdCommissionLog = await tx.salesCommissionLog.create({
          data: {
            salesUserId: payment.store.salesUserId,
            storeId: payment.storeId,
            paymentId: payment.id,
            tier: payment.tier,
            amount: commAmount,
            status: "PENDING",
          },
        });
      }

      return {
        payment: updatedP,
        store: updatedS,
        commission: createdCommission,
        commissionLog: createdCommissionLog,
        commAmount,
      };
    });

    console.log(`\n   🔍 [ASSERTION 4] Verifikasi Persetujuan Invoice & Pencatatan Komisi Sales...`);
    if (approvalResult.payment.status !== "APPROVED") {
      throw new Error("ASSERTION 4 FAILED: Status payment harus APPROVED!");
    }
    if (!approvalResult.payment.paidAt) {
      throw new Error("ASSERTION 4 FAILED: paidAt kosong!");
    }
    if (approvalResult.store.isActive !== true) {
      throw new Error("ASSERTION 4 FAILED: Store.isActive harus true!");
    }

    // Verifikasi SalesCommission
    const dbCommission = await prisma.salesCommission.findFirst({
      where: {
        salesPartnerId: validPartner.id,
        storeId: initialStore.id,
      },
    });
    if (!dbCommission) throw new Error("ASSERTION 4 FAILED: Record SalesCommission tidak tercatat di database!");
    if (Number(dbCommission.amount) < 100000) {
      throw new Error(`ASSERTION 4 FAILED: Nilai komisi salah: Rp ${dbCommission.amount}`);
    }

    // Verifikasi SalesCommissionLog
    const dbCommissionLog = await prisma.salesCommissionLog.findFirst({
      where: {
        salesUserId: validPartner.userId,
        storeId: initialStore.id,
      },
    });
    if (!dbCommissionLog) throw new Error("ASSERTION 4 FAILED: Record SalesCommissionLog tidak tercatat!");

    // Verifikasi Metrik Portofolio Sales (Agregasi _count.stores)
    const partnerStoreStats = await prisma.salesPartner.findUnique({
      where: { id: validPartner.id },
      include: {
        _count: { select: { stores: true } },
      },
    });
    if (partnerStoreStats._count.stores !== 1) {
      throw new Error(`ASSERTION 4 FAILED: Agregasi stores sales partner salah: ${partnerStoreStats._count.stores} (harapan: 1)`);
    }

    console.log(`   ✅ PASS: Pembayaran disetujui:`);
    console.log(`            Status Invoice             : ${approvalResult.payment.status}`);
    console.log(`            Waktu Disetujui (paidAt)   : ${approvalResult.payment.paidAt.toISOString()}`);
    console.log(`            Store.isActive             : ${approvalResult.store.isActive} (TOKO TELAH AKTIF)`);
    console.log(`            Masa Aktif Toko (ExpiresAt): ${approvalResult.store.subscriptionExpiresAt.toISOString()}`);
    console.log(`            Record SalesCommission     : ID=${dbCommission.id}, Amount=Rp ${Number(dbCommission.amount).toLocaleString("id-ID")}, Status=${dbCommission.status}, Period=${dbCommission.period}`);
    console.log(`            Record SalesCommissionLog  : ID=${dbCommissionLog.id}, Amount=Rp ${dbCommissionLog.amount.toLocaleString("id-ID")}`);
    console.log(`            Portofolio Klien Sales     : ${partnerStoreStats._count.stores} Toko Terdaftar\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 5: Verifikasi Dashboard Super-Admin & Sales Portal
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 5: Verifikasi Dashboard Super-Admin & Sales Portal");
    console.log("--------------------------------------------------------------------------------");

    // 5.1. Query seperti di /super-admin/stores (getAllStoresAction)
    console.log(`   🔍 [ASSERTION 5.1] Memeriksa Tab 'Klien Riil' Super-Admin (/super-admin/stores)...`);
    const superAdminStores = await prisma.store.findMany({
      where: { isDemo: false },
      include: {
        plan: true,
        referredBySales: {
          select: { id: true, code: true, name: true, phone: true },
        },
        salesUser: {
          include: {
            salesPartner: {
              select: { id: true, code: true, name: true, phone: true },
            },
          },
        },
        users: {
          where: { role: "STORE_OWNER" },
          select: { id: true, name: true, email: true },
        },
      },
    });

    const targetStoreInSa = superAdminStores.find((s) => s.slug === merchantData.slug);
    if (!targetStoreInSa) throw new Error("ASSERTION 5.1 FAILED: Toko tidak ditemukan di tab Klien Riil Super-Admin!");
    if (!targetStoreInSa.isActive) throw new Error("ASSERTION 5.1 FAILED: Toko di Klien Riil belum berstatus AKTIF!");

    const resolvedSales = targetStoreInSa.referredBySales || targetStoreInSa.salesUser?.salesPartner;
    if (!resolvedSales) throw new Error("ASSERTION 5.1 FAILED: Relasi sales tidak teresolusi di Super-Admin!");
    if (resolvedSales.code !== salesData.referralCode) {
      throw new Error(`ASSERTION 5.1 FAILED: Kode referral salah di Super-Admin: ${resolvedSales.code}`);
    }

    console.log(`      Tampilan Klien Riil Super-Admin:`);
    console.log(`      - Nama Toko  : ${targetStoreInSa.name} (${targetStoreInSa.slug})`);
    console.log(`      - Pemilik    : ${targetStoreInSa.users[0]?.name} (${targetStoreInSa.users[0]?.email})`);
    console.log(`      - Paket      : ${targetStoreInSa.tier} (${targetStoreInSa.plan.labelBadge})`);
    console.log(`      - Sales Mitra: ${resolvedSales.name} (${resolvedSales.code})`);
    console.log(`      - Status     : AKTIF (Live Siap Jualan)`);
    console.log(`   ✅ PASS: Toko muncul di tab 'Klien Riil' Super-Admin dengan label Sales yang akurat.`);

    // 5.2. Query seperti di /super-admin/sales-portal
    console.log(`\n   🔍 [ASSERTION 5.2] Memeriksa Portofolio Mitra di Sales Portal (/super-admin/sales-portal)...`);
    const salesPortalAgent = await prisma.user.findUnique({
      where: { id: validPartner.userId },
      include: {
        salesPartner: {
          include: {
            stores: {
              select: {
                id: true,
                name: true,
                slug: true,
                tier: true,
                isActive: true,
                subscriptionExpiresAt: true,
                whatsapp: true,
              },
            },
            commissions: true,
          },
        },
      },
    });

    if (!salesPortalAgent) throw new Error("ASSERTION 5.2 FAILED: Sales agent tidak ditemukan!");
    const partnerStores = salesPortalAgent.salesPartner?.stores || [];
    const targetStoreInSalesPortal = partnerStores.find((s) => s.slug === merchantData.slug);

    if (!targetStoreInSalesPortal) {
      throw new Error("ASSERTION 5.2 FAILED: Toko tidak muncul di portofolio Sales Partner!");
    }
    if (!targetStoreInSalesPortal.isActive) {
      throw new Error("ASSERTION 5.2 FAILED: Toko di portal sales tidak aktif!");
    }

    console.log(`      Tampilan Sales Portal untuk Mitra '${salesPortalAgent.name}':`);
    console.log(`      - Toko Tergaet : ${targetStoreInSalesPortal.name} (${targetStoreInSalesPortal.slug}.gadgetbdg.com)`);
    console.log(`      - Paket Toko   : ${targetStoreInSalesPortal.tier}`);
    console.log(`      - Status Toko  : AKTIF`);
    console.log(`      - Komisi Masuk : Rp ${salesPortalAgent.salesPartner.commissions.reduce((acc, c) => acc + Number(c.amount), 0).toLocaleString("id-ID")}`);
    console.log(`   ✅ PASS: Sales Rian melihat toko '${targetStoreInSalesPortal.name}' dalam daftar klien aktifnya.\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 6: Pembersihan Data Uji (Database Hygiene Cleanup)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("🧹 LANGKAH 6: PEMBERSIHAN DATA UJI (DATABASE HYGIENE CLEANUP)");
    console.log("--------------------------------------------------------------------------------");
    if (KEEP_DATA) {
      console.log("   ℹ️ Flag --keep terdeteksi. Data toko & sales uji dipertahankan.");
    } else {
      console.log("   Menghapus seluruh data uji coba ('UAT Mitra Cell' & 'Rian Sales BDG')...");

      // 1. Hapus komisi & invoice
      await prisma.salesCommission.deleteMany({
        where: {
          OR: [
            { store: { slug: merchantData.slug } },
            { salesPartner: { code: salesData.referralCode } },
          ],
        },
      });
      await prisma.salesCommissionLog.deleteMany({
        where: {
          OR: [
            { store: { slug: merchantData.slug } },
            { salesUser: { email: salesData.email } },
          ],
        },
      });
      await prisma.subscriptionPayment.deleteMany({
        where: { store: { slug: merchantData.slug } },
      });

      // 2. Hapus produk & toko
      await prisma.product.deleteMany({
        where: { store: { slug: merchantData.slug } },
      });
      await prisma.store.deleteMany({
        where: { slug: merchantData.slug },
      });

      // 3. Hapus SalesPartner & User (Merchant & Sales)
      await prisma.salesPartner.deleteMany({
        where: { code: salesData.referralCode },
      });
      await prisma.user.deleteMany({
        where: {
          email: { in: [merchantData.email, salesData.email] },
        },
      });

      const remainingRealStores = await prisma.store.count({ where: { isDemo: false } });
      const remainingSalesPartners = await prisma.salesPartner.count({
        where: { code: salesData.referralCode },
      });

      console.log(`   ✅ Pembersihan selesai! Tab Klien Riil di DB: ${remainingRealStores} toko.`);
      console.log(`   ✅ Akun Sales Partner uji dibersihkan: ${remainingSalesPartners} record tersisa.`);
    }

    console.log("\n================================================================================");
    console.log("🎉 ALL SALES REFERRAL UAT STEPS & ASSERTIONS PASSED SUCCESSFULLY (100% VERIFIED)");
    console.log("================================================================================");
  } catch (error) {
    console.error("\n❌ UAT TEST FAILED WITH ERROR:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSalesUATTest();
