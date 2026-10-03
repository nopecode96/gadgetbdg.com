const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function cleanReset() {
  console.log("🚀 Memulai pembersihan total data toko dummy & lama...");

  // Gunakan urutan yang aman untuk foreign keys
  // 1. Hapus transaksi & relasi toko turunan
  console.log("🧹 Menghapus relasi logs, payments, commissions, reviews, leads, products...");
  await prisma.salesCommissionLog.deleteMany({});
  await prisma.salesCommission.deleteMany({});
  await prisma.subscriptionPayment.deleteMany({});
  await prisma.tradeInOffer.deleteMany({});
  await prisma.storeReview.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.branch.deleteMany({});

  // 2. Putuskan hubungan salesPartner dan stores sebelum menghapus user & store
  await prisma.salesPartner.deleteMany({});

  // 3. Hapus seluruh store
  console.log("🧹 Menghapus semua toko lama...");
  await prisma.store.deleteMany({});

  // 4. Hapus semua user KECUALI SUPER_ADMIN (admin@gadgetbdg.com)
  console.log("🧹 Menghapus semua user non-super-admin...");
  await prisma.user.deleteMany({
    where: {
      email: { not: "admin@gadgetbdg.com" },
    },
  });

  console.log("✅ Data lama berhasil dibersihkan secara tuntas.");

  // 5. Pastikan Akun Super Admin tetap ada & ter-update
  console.log("👤 Memastikan akun SUPER_ADMIN (admin@gadgetbdg.com)...");
  const hashedAdminPass = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@gadgetbdg.com" },
    update: {
      role: "SUPER_ADMIN",
      name: "Super Administrator SaaS",
      passwordHash: hashedAdminPass,
      phone: "62895389974414",
      storeId: null,
      branchId: null,
    },
    create: {
      email: "admin@gadgetbdg.com",
      name: "Super Administrator SaaS",
      passwordHash: hashedAdminPass,
      phone: "62895389974414",
      role: "SUPER_ADMIN",
      storeId: null,
      branchId: null,
    },
  });

  // 6. Seed / Upsert Subscription Plans (STARTER, PRO, ADVANCE)
  console.log("📦 Memastikan 3 Tier Paket Langganan...");
  const plans = [
    {
      id: "STARTER",
      name: "Starter",
      labelBadge: "STARTER • PERINTIS",
      tagline: "Langkah Awal Konter Manual Jadi Katalog Online",
      price: 250000,
      originalPrice: 350000,
      discountBadge: "HEMAT 28%",
      popularBadge: null,
      period: "/ bulan",
      maxActiveProducts: 15,
      maxAdmins: 1,
      availableTemplatesCount: 2,
      templateCooldownDays: -1,
      templateChangeRule: "Hanya 1x saat pendaftaran",
      hasWatermark: true,
      hasQrWebsite: true,
      hasQrGoogleReview: false,
      hasStoryMaker: false,
      hasCustomDomain: false,
      customDomain: false,
      salesCommission: 50000,
      reportsLevel: "BASIC_WA",
      description: "Solusi hemat untuk toko HP pemula / konter personal yang ingin katalog online rapi.",
    },
    {
      id: "PRO",
      name: "Pro",
      labelBadge: "PRO • BISNIS MANDIRI",
      tagline: "Solusi Lengkap Toko Berkembang: Bebas Curi Foto",
      price: 600000,
      originalPrice: 850000,
      discountBadge: "HEMAT 30%",
      popularBadge: "PALING POPULER",
      period: "/ bulan",
      maxActiveProducts: 30,
      maxAdmins: 3,
      availableTemplatesCount: 4,
      templateCooldownDays: 30,
      templateChangeRule: "Ganti template tiap 30 hari",
      hasWatermark: false,
      hasQrWebsite: true,
      hasQrGoogleReview: true,
      hasStoryMaker: true,
      hasCustomDomain: true,
      customDomain: true,
      salesCommission: 100000,
      reportsLevel: "SOLD_LEADERBOARD",
      description: "Untuk konter HP aktif BEC / Bandung yang ingin scale-up penjualan & branding profesional.",
    },
    {
      id: "ADVANCE",
      name: "Advance",
      labelBadge: "ADVANCE • KELAS SULTAN",
      tagline: "Ekosistem Tanpa Batas untuk Jaringan Cabang",
      price: 1000000,
      originalPrice: 1500000,
      discountBadge: "HEMAT 33%",
      popularBadge: "EKSKLUSIF",
      period: "/ bulan",
      maxActiveProducts: 999999,
      maxAdmins: 5,
      availableTemplatesCount: 6,
      templateCooldownDays: 0,
      templateChangeRule: "Bebas ganti template kapan saja",
      hasWatermark: false,
      hasQrWebsite: true,
      hasQrGoogleReview: true,
      hasStoryMaker: true,
      hasCustomDomain: true,
      customDomain: true,
      salesCommission: 150000,
      reportsLevel: "BRANCH_FULL",
      description: "Pilihan terbaik bos konter dengan cabang banyak. Termasuk fitur story generator dan prioritas support.",
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 7. Seed / Upsert PlatformSetting GLOBAL
  console.log("⚙️ Memastikan Pengaturan Global Platform (GLOBAL)...");
  await prisma.platformSetting.upsert({
    where: { id: "GLOBAL" },
    update: {
      platformName: "GadgetBdg.com",
      tagline: "Platform Toko Online Konter HP Terpercaya",
      cityCoverage: "Bandung Raya",
      heroTitle: "Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit",
      heroSubtitle: "Tingkatkan penjualan unit second & baru, kelola tukar tambah, dan miliki katalog modern tanpa repot koding.",
      supportWhatsapp: "62895389974414",
      supportEmail: "support@gadgetbdg.com",
      serverIp: "72.62.75.149",
      cnameTarget: "cname.gadgetbdg.com",
      qrisImageUrl: "/uploads/platform/qris-official.png",
      qrisNmid: "ID1026592057644",
      enableBankTransfer: false,
      bankName: "BCA",
      bankAccountNumber: "1234567890",
      bankAccountHolder: "PT Gadget Bandung Solusindo",
    },
    create: {
      id: "GLOBAL",
      platformName: "GadgetBdg.com",
      tagline: "Platform Toko Online Konter HP Terpercaya",
      cityCoverage: "Bandung Raya",
      heroTitle: "Buka Web Toko HP Konter Anda Sendiri Dalam 5 Menit",
      heroSubtitle: "Tingkatkan penjualan unit second & baru, kelola tukar tambah, dan miliki katalog modern tanpa repot koding.",
      supportWhatsapp: "62895389974414",
      supportEmail: "support@gadgetbdg.com",
      serverIp: "72.62.75.149",
      cnameTarget: "cname.gadgetbdg.com",
      qrisImageUrl: "/uploads/platform/qris-official.png",
      qrisNmid: "ID1026592057644",
      enableBankTransfer: false,
      bankName: "BCA",
      bankAccountNumber: "1234567890",
      bankAccountHolder: "PT Gadget Bandung Solusindo",
    },
  });

  // 8. Buat 6 Toko Demo Showroom Resmi (isDemo: true)
  console.log("🏪 Membuat 6 Toko Demo Showroom Resmi (isDemo: true)...");
  const demoStores = [
    { slug: "demo1", name: "Demo Minimal Clean", template: "minimal-clean", templateId: "minimal-clean", tier: "STARTER", primaryColor: "#0f172a" },
    { slug: "demo2", name: "Demo Gamers Cyber", template: "gamers-cyber", templateId: "dark-gaming", tier: "STARTER", primaryColor: "#00e5b3" },
    { slug: "demo3", name: "Demo Midnight Gold", template: "midnight-gold", templateId: "midnight-gold", tier: "ADVANCE", primaryColor: "#f59e0b" },
    { slug: "demo4", name: "Demo Tokyo Street", template: "tokyo-street", templateId: "tokyo-editorial", tier: "PRO", primaryColor: "#e11d48" },
    { slug: "demo5", name: "Demo Modern Retail", template: "modern-retail", templateId: "minimal-clean", tier: "PRO", primaryColor: "#4f46e5" },
    { slug: "demo6", name: "Demo Official Store", template: "official-store", templateId: "keynote-obsidian", tier: "ADVANCE", primaryColor: "#ffffff" },
  ];

  const hashedDemoPass = await bcrypt.hash("Admin123!", 10);
  const lifetimeExpiry = new Date("2099-12-31T23:59:59.000Z");

  for (const d of demoStores) {
    const store = await prisma.store.create({
      data: {
        slug: d.slug,
        name: d.name,
        template: d.template,
        templateId: d.templateId,
        planId: d.tier,
        tier: d.tier,
        isDemo: true,
        isActive: true,
        whatsapp: "62895389974414",
        address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-08, Bandung",
        operationalHours: "Setiap Hari: 10:00 - 21:00 WIB",
        warrantyPolicy: "Garansi Resmi & Garansi Personal Toko 30 Hari Replace Unit Bebas Blokir IMEI.",
        verifiedBadge: true,
        hasWatermark: d.tier === "STARTER",
        primaryColor: d.primaryColor,
        subscriptionStartedAt: new Date(),
        subscriptionExpiresAt: lifetimeExpiry,
      },
    });

    const demoUser = await prisma.user.create({
      data: {
        email: `${d.slug}@gadgetbdg.com`,
        name: `Owner ${d.name}`,
        passwordHash: hashedDemoPass,
        phone: "62895389974414",
        role: "STORE_OWNER",
        storeId: store.id,
      },
    });

    // Tambahkan 4 unit katalog smartphone per toko demo
    await prisma.product.createMany({
      data: [
        {
          storeId: store.id,
          title: "iPhone 15 Pro Max 256GB Natural Titanium",
          slug: "iphone-15-pro-max-256gb-natural-titanium",
          category: "SMARTPHONE",
          brand: "Apple",
          price: 18500000,
          images: [
            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1695048065053-cfbbce48f98c?auto=format&fit=crop&w=800&q=80",
          ],
          grade: "Grade A+ (Like New)",
          ram: "8GB",
          storage: "256GB",
          batteryHealth: "98% Original",
          completeness: "Fullset Original Box & Kabel C-to-C",
          conditionNotes: "Ex Garansi Resmi iBox, fisik mulus 99% tanpa lecet/dent. TrueTone & Face ID normal.",
          description: "Unit primadona garansi resmi Indonesia. Sudah terpasang tempered glass premium.",
          condition: "SECOND_LIKE_NEW",
          status: "AVAILABLE",
        },
        {
          storeId: store.id,
          title: "iPhone 13 128GB Midnight",
          slug: "iphone-13-128gb-midnight",
          category: "SMARTPHONE",
          brand: "Apple",
          price: 9200000,
          images: [
            "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
          ],
          grade: "Grade A (Sangat Mulus)",
          ram: "4GB",
          storage: "128GB",
          batteryHealth: "89% Original Awet",
          completeness: "Fullset Box & Nota Beli",
          conditionNotes: "Kamera jernih cinematic mode aktif, layar original tanpa shadow.",
          description: "Pilihan terbaik value-for-money. Kamera stabil dan baterai awet seharian.",
          condition: "SECOND_MULUS",
          status: "AVAILABLE",
        },
        {
          storeId: store.id,
          title: "Samsung Galaxy S24 Ultra 512GB Grey",
          slug: "samsung-galaxy-s24-ultra-512gb-grey",
          category: "SMARTPHONE",
          brand: "Samsung",
          price: 19800000,
          images: [
            "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80",
          ],
          grade: "Baru Segel (BNIB)",
          ram: "12GB",
          storage: "512GB",
          batteryHealth: "100% Baru",
          completeness: "Brand New In Box Segel SEIN",
          conditionNotes: "Unit baru belum aktif garansi resmi Samsung Indonesia 1 tahun penuh.",
          description: "Flagship Galaxy AI tercanggih dengan kamera 200MP dan S-Pen bawaan.",
          condition: "BRAND_NEW_SEIN",
          status: "AVAILABLE",
        },
        {
          storeId: store.id,
          title: "iPhone 11 128GB White",
          slug: "iphone-11-128gb-white",
          category: "SMARTPHONE",
          brand: "Apple",
          price: 5500000,
          images: [
            "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80",
          ],
          grade: "Grade B+ (Pemakaian Wajar)",
          ram: "4GB",
          storage: "128GB",
          batteryHealth: "84% Original",
          completeness: "Unit Only + Bonus Charger Fast Charging 20W",
          conditionNotes: "Ada goresan halus tipis pemakaian case di bezel, fungsi 100% normal lancar.",
          description: "Unit terlaris konter, sudah laku terjual (SOLD) sebagai contoh rekap omset toko.",
          condition: "SECOND_FULLSET",
          status: "SOLD",
        },
      ],
    });

    console.log(`✅ Demo Store ${d.slug} (${d.name}) & owner ${demoUser.email} berhasil dibuat.`);
  }

  console.log("🎉 Pembersihan & Provisioning 6 Toko Demo Showroom selesai 100%!");
}

cleanReset()
  .catch((e) => {
    console.error("❌ Reset error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
