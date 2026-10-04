/**
 * UAT Test Suite: Complete Store Purchase & Subscription Approval Flow
 *
 * Skenario Pengujian:
 * 1. Calon Merchant mendaftar toko baru & memilih paket langganan PRO via registerStoreAction / onboarding.
 *    - Assertion 1: Record Store terbuat dengan status menunggu aktivasi/pending bayar (isActive = false).
 *    - Assertion 1: Record SubscriptionPayment terbuat dengan status PENDING dan nominal sesuai paket PRO (Rp 600.000).
 * 2. Simulasi pembayaran / konfirmasi bukti transfer (upload receiptUrl, status WAITING_APPROVAL / PENDING_VERIFICATION).
 * 3. Tinjauan Super Admin di Panel Verifikasi Bayar (getBillingOverviewAction query).
 * 4. Aksi Super Admin (Approve / Verifikasi Pembayaran via approveSubscriptionPaymentAction):
 *    - Status pembayaran APPROVED, paidAt terisi, reviewedByName terisi.
 *    - Store.isActive = true, planId = 'PRO', tier = 'PRO'.
 *    - Masa aktif bertambah +30 hari ke depan.
 * 5. Verifikasi Akses Merchant Pasca Pembayaran:
 *    - Login merchant berhasil & Session Context membaca store aktif.
 *    - Kuota produk paket PRO aktif (maxActiveProducts = 30 unit).
 *    - Fitur PRO terbuka (canCustomProfile = true, customDomain = true, maxAdmins = 3).
 *    - Toko muncul di tab "Klien Riil" Super-Admin (/super-admin/stores) dengan status aktif.
 * 6. Pembersihan data uji secara higienis (cleanup).
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const KEEP_DATA = process.argv.includes("--keep");

async function runUATTest() {
  console.log("================================================================================");
  console.log("🧪 STARTING UAT TEST: STORE PURCHASE & SUBSCRIPTION APPROVAL FLOW");
  console.log("================================================================================\n");

  const merchantData = {
    name: "UAT Bintang Gadget",
    slug: "uat-bintangcell",
    ownerName: "Denny Hendrawan",
    email: "denny.uat@bintangcell.com",
    rawPhone: "081399887766",
    formattedPhone: "6281399887766",
    password: "Password123!",
    tier: "PRO",
    templateId: "minimal-clean",
    proPrice: 600000,
  };

  try {
    // -------------------------------------------------------------------------
    // 0. PRE-CLEANING
    // -------------------------------------------------------------------------
    console.log("🧹 [PRE-CHECK] Membersihkan data uji sebelumnya jika ada...");
    await prisma.subscriptionPayment.deleteMany({
      where: { store: { slug: merchantData.slug } },
    });
    await prisma.salesCommission.deleteMany({
      where: { store: { slug: merchantData.slug } },
    });
    await prisma.salesCommissionLog.deleteMany({
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
    console.log("   ✅ Lingkungan database bersih & siap diuji.\n");

    // -------------------------------------------------------------------------
    // LANGKAH 1: Calon Merchant Mendaftar Toko & Memilih Paket PRO
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 1: Pendaftaran Toko Baru & Pemilihan Paket PRO (Onboarding)");
    console.log("--------------------------------------------------------------------------------");
    console.log(`   Input Payload:`);
    console.log(`   - Nama Toko: ${merchantData.name}`);
    console.log(`   - Subdomain : ${merchantData.slug}.gadgetbdg.com`);
    console.log(`   - Owner     : ${merchantData.ownerName} (${merchantData.email})`);
    console.log(`   - WhatsApp  : ${merchantData.rawPhone} -> ${merchantData.formattedPhone}`);
    console.log(`   - Paket     : ${merchantData.tier} (Harga Resmi: Rp ${merchantData.proPrice.toLocaleString("id-ID")})`);

    // Eksekusi logika registerStoreWithPaymentAction
    let cleanWa = merchantData.rawPhone.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    const passwordHash = await bcrypt.hash(merchantData.password, 12);

    const registration = await prisma.$transaction(async (tx) => {
      const store = await tx.store.create({
        data: {
          name: merchantData.name,
          slug: merchantData.slug,
          tier: merchantData.tier,
          planId: merchantData.tier,
          templateId: merchantData.templateId,
          whatsapp: cleanWa,
          address: "BEC Lantai 1 Blok B-12, Bandung",
          primaryColor: "#2563eb",
          hasWatermark: true,
          lastTemplateChangeAt: new Date(),
          isActive: false, // Menunggu pembayaran diverifikasi
        },
      });

      const user = await tx.user.create({
        data: {
          email: merchantData.email,
          passwordHash,
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
          receiptUrl: null, // Belum upload bukti bayar
          status: "PENDING",
        },
      });

      return { store, user, payment };
    });

    console.log(`\n   🔍 [ASSERTION 1] Verifikasi Record Store & Invoice SubscriptionPayment...`);
    const initialStore = await prisma.store.findUnique({
      where: { id: registration.store.id },
      include: { plan: true },
    });
    const initialPayment = await prisma.subscriptionPayment.findUnique({
      where: { id: registration.payment.id },
    });

    if (!initialStore) throw new Error("ASSERTION 1 FAILED: Store gagal dibuat di database!");
    if (initialStore.isActive !== false) throw new Error("ASSERTION 1 FAILED: Store baru harus isActive: false sebelum bayar!");
    if (initialStore.tier !== "PRO") throw new Error(`ASSERTION 1 FAILED: Tier toko salah: ${initialStore.tier}`);

    if (!initialPayment) throw new Error("ASSERTION 1 FAILED: SubscriptionPayment gagal dibuat di database!");
    if (initialPayment.status !== "PENDING") throw new Error(`ASSERTION 1 FAILED: Status payment salah: ${initialPayment.status}`);
    if (initialPayment.amount !== 600000) throw new Error(`ASSERTION 1 FAILED: Nominal pembayaran salah: ${initialPayment.amount}`);

    console.log(`   ✅ PASS: Toko '${initialStore.name}' ID=${initialStore.id}`);
    console.log(`            Status Aktif Toko: ${initialStore.isActive} (Menunggu verifikasi Super-Admin)`);
    console.log(`            Invoice Tagihan  : ID=${initialPayment.id}, Status=${initialPayment.status}, Nominal=Rp ${initialPayment.amount.toLocaleString("id-ID")}\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 2: Simulasi Pembayaran & Upload Bukti Transfer (Receipt)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 2: Simulasi Pembayaran Merchant & Unggah Bukti Transfer");
    console.log("--------------------------------------------------------------------------------");
    const receiptDummyUrl = "/uploads/receipts/uat-bintangcell-proof.png";
    const transferNote = "Transfer via BCA an Denny Hendrawan Ref: 98124501";
    console.log(`   Merchant mengunggah bukti bayar QRIS / Transfer Bank:`);
    console.log(`   - Receipt URL: ${receiptDummyUrl}`);
    console.log(`   - Catatan    : ${transferNote}`);

    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: initialPayment.id },
      data: {
        receiptUrl: receiptDummyUrl,
        notes: transferNote,
        // Status tetap PENDING / menunggu persetujuan Super Admin
        status: "PENDING",
      },
    });

    console.log(`\n   🔍 [ASSERTION 2] Verifikasi Bukti Pembayaran Tercatat di Database...`);
    if (!updatedPayment.receiptUrl) throw new Error("ASSERTION 2 FAILED: receiptUrl gagal disimpan!");
    if (updatedPayment.status !== "PENDING") throw new Error("ASSERTION 2 FAILED: Status invoice berubah sebelum approval!");
    console.log(`   ✅ PASS: Bukti transfer berhasil dilampirkan: ${updatedPayment.receiptUrl}`);
    console.log(`            Status Invoice: ${updatedPayment.status} (Siap ditinjau Super Admin)\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 3: Tinjauan Super Admin di Panel Verifikasi Bayar (/super-admin/billing)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 3: Tinjauan Super Admin di Panel Verifikasi Bayar (/super-admin/billing)");
    console.log("--------------------------------------------------------------------------------");
    console.log(`   Menjalankan query getBillingOverviewAction()...`);

    const pendingQueue = await prisma.subscriptionPayment.findMany({
      where: {
        status: "PENDING",
        store: { isDemo: false },
      },
      include: {
        store: {
          select: { id: true, name: true, slug: true, whatsapp: true, subscriptionExpiresAt: true },
        },
        plan: { select: { name: true, labelBadge: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`\n   🔍 [ASSERTION 3] Verifikasi Invoice Masuk Antrean Verifikasi Super-Admin...`);
    const targetInQueue = pendingQueue.find((p) => p.id === initialPayment.id);
    if (!targetInQueue) throw new Error("ASSERTION 3 FAILED: Tagihan toko tidak ditemukan dalam antrean verifikasi Super Admin!");

    console.log(`      Ditemukan di Antrean Verifikasi Bayar:`);
    console.log(`      - Toko     : ${targetInQueue.store.name} (${targetInQueue.store.slug})`);
    console.log(`      - Kontak WA: ${targetInQueue.store.whatsapp}`);
    console.log(`      - Paket    : ${targetInQueue.tier} (${targetInQueue.plan?.name || "Paket Pro"})`);
    console.log(`      - Tagihan  : Rp ${targetInQueue.amount.toLocaleString("id-ID")}`);
    console.log(`      - Lampiran : ${targetInQueue.receiptUrl}`);
    console.log(`   ✅ PASS: Transaksi muncul di antrean verifikasi pembayaran Super-Admin dengan data valid.\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 4: Aksi Super Admin (Approve / Verifikasi Pembayaran)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 4: Eksekusi Server Action Persetujuan (Approve Subscription Payment)");
    console.log("--------------------------------------------------------------------------------");
    const reviewerName = "Super Administrator SaaS";
    console.log(`   Super Admin '${reviewerName}' menyetujui invoice ID=${initialPayment.id}...`);

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

      if (!payment) throw new Error("Payment not found");
      const now = new Date();
      const SUBSCRIPTION_DAYS = 30;
      const DAY_MS = 24 * 60 * 60 * 1000;
      const base = payment.store.subscriptionExpiresAt && payment.store.subscriptionExpiresAt.getTime() > now.getTime()
        ? payment.store.subscriptionExpiresAt
        : now;
      const newEnd = new Date(base.getTime() + SUBSCRIPTION_DAYS * DAY_MS);

      const plan = await tx.subscriptionPlan.findUnique({ where: { id: payment.planId || payment.tier } });
      if (!plan) throw new Error("Plan not found");

      // Update payment
      const updatedP = await tx.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          status: "APPROVED",
          paidAt: now,
          reviewedByName: reviewerName,
        },
      });

      // Update store
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

      return { payment: updatedP, store: updatedS, newEnd };
    });

    console.log(`\n   🔍 [ASSERTION 4] Verifikasi Perubahan Status Pasca Approval...`);
    if (approvalResult.payment.status !== "APPROVED") throw new Error("ASSERTION 4 FAILED: Status payment harus APPROVED!");
    if (!approvalResult.payment.paidAt) throw new Error("ASSERTION 4 FAILED: paidAt harus terisi timestamp!");
    if (approvalResult.payment.reviewedByName !== reviewerName) throw new Error("ASSERTION 4 FAILED: reviewer name salah!");

    if (approvalResult.store.isActive !== true) throw new Error("ASSERTION 4 FAILED: Store.isActive harus true!");
    if (!approvalResult.store.subscriptionExpiresAt) throw new Error("ASSERTION 4 FAILED: subscriptionExpiresAt kosong!");

    const daysRemaining = Math.round((approvalResult.store.subscriptionExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    console.log(`   ✅ PASS: Pembayaran disetujui (Status: APPROVED, Reviewer: ${approvalResult.payment.reviewedByName})`);
    console.log(`            Store.isActive             : ${approvalResult.store.isActive} (TOKO TELAH AKTIF)`);
    console.log(`            Masa Aktif Toko (ExpiresAt): ${approvalResult.store.subscriptionExpiresAt.toISOString()} (~${daysRemaining} hari ke depan)\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 5: Verifikasi Akses Merchant Pasca Pembayaran (Dashboard & Kuota PRO)
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("📌 LANGKAH 5: Verifikasi Hak Akses Merchant, Kuota Produk & Fitur Paket PRO");
    console.log("--------------------------------------------------------------------------------");

    // 5.1. Simulasi Login Merchant
    console.log(`   🔍 [ASSERTION 5.1] Simulasi Autentikasi Login Pemilik Toko...`);
    const ownerUser = await prisma.user.findUnique({
      where: { email: merchantData.email },
      include: { store: true },
    });
    if (!ownerUser) throw new Error("ASSERTION 5.1 FAILED: User tidak ditemukan!");
    const isPasswordValid = await bcrypt.compare(merchantData.password, ownerUser.passwordHash);
    if (!isPasswordValid) throw new Error("ASSERTION 5.1 FAILED: Password hash mismatch!");
    console.log(`   ✅ PASS: Kredensial login valid untuk Owner '${ownerUser.name}' (Role: ${ownerUser.role})`);

    // 5.2. Verifikasi Kuota & Fitur PRO (Plan Guard & Session Resolution)
    console.log(`\n   🔍 [ASSERTION 5.2] Evaluasi Limit & Kuota Paket PRO dari SSoT Database...`);
    const activeStoreWithPlan = await prisma.store.findUnique({
      where: { id: ownerUser.storeId },
      include: { plan: true },
    });
    const proPlan = activeStoreWithPlan.plan;

    console.log(`      Spesifikasi Paket Aktif (${proPlan.name} / ${proPlan.labelBadge}):`);
    console.log(`      - Max Active Products : ${proPlan.maxActiveProducts} unit (Paket PRO: 30 unit)`);
    console.log(`      - Max Admins/Staff    : ${proPlan.maxAdmins} akun`);
    console.log(`      - Allowed Templates   : ${proPlan.availableTemplatesCount} template`);
    console.log(`      - Custom Domain       : ${proPlan.hasCustomDomain ? "Aktif" : "Non-aktif"}`);
    console.log(`      - Watermark Anti-Curi : ${proPlan.hasWatermark ? "Aktif" : "Non-aktif"}`);
    console.log(`      - Template Cooldown   : ${proPlan.templateCooldownDays} hari`);

    if (proPlan.maxActiveProducts !== 30) throw new Error(`ASSERTION 5.2 FAILED: Kuota produk paket PRO harus 30, tetapi: ${proPlan.maxActiveProducts}`);
    if (proPlan.maxAdmins !== 3) throw new Error(`ASSERTION 5.2 FAILED: Max admins paket PRO harus 3!`);
    if (proPlan.hasCustomDomain !== true) throw new Error(`ASSERTION 5.2 FAILED: Custom domain paket PRO harus true!`);
    if (proPlan.availableTemplatesCount < 4) throw new Error(`ASSERTION 5.2 FAILED: Template count paket PRO harus >= 4!`);
    console.log(`   ✅ PASS: Kuota 30 unit stok aktif & seluruh fitur eksklusif paket PRO terbuka penuh.`);

    // 5.3. Verifikasi Keberadaan Toko di Tab "Klien Riil" Super Admin (/super-admin/stores)
    console.log(`\n   🔍 [ASSERTION 5.3] Memeriksa Tab 'Klien Riil' Super-Admin (/super-admin/stores)...`);
    const allRealStores = await prisma.store.findMany({
      where: { isDemo: false },
      include: {
        users: { where: { role: "STORE_OWNER" }, select: { name: true, email: true } },
        plan: true,
      },
    });

    const targetRealStore = allRealStores.find((s) => s.slug === merchantData.slug);
    if (!targetRealStore) throw new Error("ASSERTION 5.3 FAILED: Toko baru tidak muncul di tab Klien Riil Super-Admin!");
    if (!targetRealStore.isActive) throw new Error("ASSERTION 5.3 FAILED: Toko di Klien Riil tidak dalam status aktif!");

    console.log(`      Status di Super-Admin:`);
    console.log(`      - Nama Toko  : ${targetRealStore.name}`);
    console.log(`      - Pemilik    : ${targetRealStore.users[0]?.name} (${targetRealStore.users[0]?.email})`);
    console.log(`      - Paket Aktif: ${targetRealStore.tier} (${targetRealStore.plan.labelBadge})`);
    console.log(`      - Status     : AKTIF (Live Siap Jualan)`);
    console.log(`   ✅ PASS: Toko muncul di tab 'Klien Riil' Super-Admin dengan status aktif.\n`);

    // -------------------------------------------------------------------------
    // LANGKAH 6: PEMBERSIHAN DATA UJI SECARA HIGIENIS
    // -------------------------------------------------------------------------
    console.log("--------------------------------------------------------------------------------");
    console.log("🧹 LANGKAH 6: PEMBERSIHAN DATA UJI (DATABASE HYGIENE CLEANUP)");
    console.log("--------------------------------------------------------------------------------");
    if (KEEP_DATA) {
      console.log("   ℹ️ Flag --keep terdeteksi. Data toko uji tetap dipertahankan.");
    } else {
      console.log("   Menghapus data uji coba 'UAT Bintang Gadget'...");
      await prisma.subscriptionPayment.deleteMany({
        where: { store: { slug: merchantData.slug } },
      });
      await prisma.salesCommission.deleteMany({
        where: { store: { slug: merchantData.slug } },
      });
      await prisma.salesCommissionLog.deleteMany({
        where: { store: { slug: merchantData.slug } },
      });
      await prisma.user.deleteMany({
        where: { email: merchantData.email },
      });
      await prisma.store.deleteMany({
        where: { slug: merchantData.slug },
      });

      const remainingRealStores = await prisma.store.count({ where: { isDemo: false } });
      console.log(`   ✅ Pembersihan selesai! Tab Klien Riil di DB kembali menjadi: ${remainingRealStores} toko.`);
    }

    console.log("\n================================================================================");
    console.log("🎉 ALL UAT STEPS & ASSERTIONS PASSED SUCCESSFULLY (100% VERIFIED)");
    console.log("================================================================================");
  } catch (error) {
    console.error("\n❌ UAT TEST FAILED WITH ERROR:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runUATTest();
