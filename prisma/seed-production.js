const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Idempotent Production Seeder for GadgetBdg...");

  const defaultPasswordHash = await bcrypt.hash("Admin123!", 10);

  // =========================================================================
  // 1. Seed / Upsert Akun SUPER_ADMIN
  // =========================================================================
  console.log("👤 Ensuring SUPER_ADMIN account...");
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@gadgetbdg.com" },
    update: {
      role: "SUPER_ADMIN",
      name: "Super Administrator SaaS",
      // Keep existing password if already updated, but ensure valid hash if resetting
    },
    create: {
      email: "admin@gadgetbdg.com",
      name: "Super Administrator SaaS",
      passwordHash: defaultPasswordHash,
      phone: "62895389974414",
      role: "SUPER_ADMIN",
      storeId: null,
    },
  });
  console.log(`✅ SUPER_ADMIN: ${superAdmin.email} (${superAdmin.id}) ready.`);

  // =========================================================================
  // 2. Seed / Upsert Subscription Plans
  // =========================================================================
  console.log("📦 Ensuring Subscription Plans (STARTER, PRO, ADVANCE)...");
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
      hasWatermark: false,
      hasQrWebsite: true,
      hasQrGoogleReview: false,
      hasStoryMaker: false,
      hasCustomDomain: false,
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
      hasWatermark: true,
      hasQrWebsite: true,
      hasQrGoogleReview: true,
      hasStoryMaker: true,
      hasCustomDomain: true,
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
      hasWatermark: true,
      hasQrWebsite: true,
      hasQrGoogleReview: true,
      hasStoryMaker: true,
      hasCustomDomain: true,
      salesCommission: 150000,
      reportsLevel: "BRANCH_FULL",
      description: "Kapasitas tanpa batas untuk juragan HP second dengan perputaran stok masif & multi-cabang.",
    },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        labelBadge: p.labelBadge,
        tagline: p.tagline,
        price: p.price,
        originalPrice: p.originalPrice,
        discountBadge: p.discountBadge,
        popularBadge: p.popularBadge,
        maxActiveProducts: p.maxActiveProducts,
        maxAdmins: p.maxAdmins,
        availableTemplatesCount: p.availableTemplatesCount,
        hasWatermark: p.hasWatermark,
        hasCustomDomain: p.hasCustomDomain,
        salesCommission: p.salesCommission,
        description: p.description,
      },
      create: p,
    });
  }
  console.log("✅ Subscription Plans verified.");

  // =========================================================================
  // 3. Seed / Upsert PlatformSetting (GLOBAL)
  // =========================================================================
  console.log("⚙️ Ensuring PlatformSetting (GLOBAL)...");
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
  console.log("✅ PlatformSetting GLOBAL verified.");

  // =========================================================================
  // 4. Seed Toko Demo Resmi Sales ('demo1' s/d 'demo6')
  // =========================================================================
  console.log("🏪 Ensuring Official Demo Stores (demo1 s/d demo6)...");

  const lifetimeExpiry = new Date("2099-12-31T23:59:59.000Z");

  const demoStoresConfig = [
    {
      slug: "demo1",
      name: "Demo 1: Minimal Clean",
      planId: "STARTER",
      tier: "STARTER",
      template: "minimal-clean",
      templateId: "minimal-clean",
      primaryColor: "#0f172a",
      desc: "Desain e-commerce mobile terang, modern & clean.",
      logoUrl: "/demo-logos/demo1-logo.png",
    },
    {
      slug: "demo2",
      name: "Demo 2: Gamers Cyber",
      planId: "STARTER",
      tier: "STARTER",
      template: "gamers-cyber",
      templateId: "dark-gaming",
      primaryColor: "#00e5b3",
      desc: "Nuansa gelap gaming Spectra dengan aksen neon mint-teal (#00e5b3).",
    },
    {
      slug: "demo3",
      name: "Demo 3: Midnight Gold",
      planId: "ADVANCE",
      tier: "ADVANCE",
      template: "midnight-gold",
      templateId: "midnight-gold",
      primaryColor: "#f59e0b",
      desc: "VIP luxury store hitam obsidian & emas.",
      description: "Butik kurasi smartphone flagship second premium bersertifikasi. Standar inspeksi 30 titik, garansi replace 30 hari, dan layanan private concierge di BEC Bandung.",
      city: "Bandung",
      socialMedia: "@midnightgold.gadget",
      bankName: "Bank Central Asia (BCA)",
      bankAccount: "8470192831",
      bankHolder: "Midnight Gold Official",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
    },
    {
      slug: "demo4",
      name: "Demo 4: Tokyo Street Clean",
      planId: "PRO",
      tier: "PRO",
      template: "tokyo-street",
      templateId: "tokyo-editorial",
      primaryColor: "#e11d48",
      desc: "Streetwear tech magazine off-white, aksen rose bold.",
    },
    {
      slug: "demo5",
      name: "Demo 5: Modern Retail",
      planId: "PRO",
      tier: "PRO",
      template: "modern-retail",
      templateId: "minimal-clean",
      primaryColor: "#4f46e5",
      desc: "Retail outlet terstruktur dengan navigasi cepat kategori.",
    },
    {
      slug: "demo6",
      name: "Demo 6: Official Store (Obsidian)",
      planId: "ADVANCE",
      tier: "ADVANCE",
      template: "official-store",
      templateId: "keynote-obsidian",
      primaryColor: "#ffffff",
      desc: "Atmosfer panggung Apple Keynote dark obsidian.",
    },
  ];

  const demoProducts = [
    {
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
      status: "AVAILABLE",
      isFeatured: true,
      isReadyCod: true,
    },
    {
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
      status: "AVAILABLE",
      isFeatured: true,
      isReadyCod: true,
    },
    {
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
      status: "AVAILABLE",
      isFeatured: false,
      isReadyCod: true,
    },
    {
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
      status: "SOLD",
      isFeatured: false,
      isReadyCod: false,
    },
  ];

  for (const demoConfig of demoStoresConfig) {
    const store = await prisma.store.upsert({
      where: { slug: demoConfig.slug },
      update: {
        name: demoConfig.name,
        planId: demoConfig.planId,
        tier: demoConfig.tier,
        template: demoConfig.template,
        templateId: demoConfig.templateId,
        isDemo: true,
        isActive: true,
        whatsapp: "62895389974414",
        address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-08, Bandung",
        city: demoConfig.city || "Bandung",
        description: demoConfig.description || "Penyedia smartphone flagship & second bergaransi resmi.",
        socialMedia: demoConfig.socialMedia || "@gadgetbdg.official",
        bankName: demoConfig.bankName || "Bank Central Asia (BCA)",
        bankAccount: demoConfig.bankAccount || "8470192831",
        bankHolder: demoConfig.bankHolder || demoConfig.name,
        mapsUrl: demoConfig.mapsUrl || "https://maps.google.com/?q=Bandung+Electronic+Center",
        operationalHours: "Setiap Hari: 10:00 - 21:00 WIB",
        warrantyPolicy: "Garansi Resmi & Garansi Personal Toko 30 Hari Replace Unit Bebas Blokir IMEI.",
        verifiedBadge: true,
        hasWatermark: true,
        primaryColor: demoConfig.primaryColor,
        logoUrl: demoConfig.logoUrl || null,
        subscriptionExpiresAt: lifetimeExpiry,
      },
      create: {
        name: demoConfig.name,
        slug: demoConfig.slug,
        planId: demoConfig.planId,
        tier: demoConfig.tier,
        template: demoConfig.template,
        templateId: demoConfig.templateId,
        isDemo: true,
        isActive: true,
        whatsapp: "62895389974414",
        address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-08, Bandung",
        city: demoConfig.city || "Bandung",
        description: demoConfig.description || "Penyedia smartphone flagship & second bergaransi resmi.",
        socialMedia: demoConfig.socialMedia || "@gadgetbdg.official",
        bankName: demoConfig.bankName || "Bank Central Asia (BCA)",
        bankAccount: demoConfig.bankAccount || "8470192831",
        bankHolder: demoConfig.bankHolder || demoConfig.name,
        mapsUrl: demoConfig.mapsUrl || "https://maps.google.com/?q=Bandung+Electronic+Center",
        operationalHours: "Setiap Hari: 10:00 - 21:00 WIB",
        warrantyPolicy: "Garansi Resmi & Garansi Personal Toko 30 Hari Replace Unit Bebas Blokir IMEI.",
        verifiedBadge: true,
        hasWatermark: true,
        primaryColor: demoConfig.primaryColor,
        logoUrl: demoConfig.logoUrl || null,
        subscriptionStartedAt: new Date(),
        subscriptionExpiresAt: lifetimeExpiry,
      },
    });

    const ownerEmail = `${demoConfig.slug}@gadgetbdg.com`;
    await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        name: `Owner ${demoConfig.name}`,
        role: "STORE_OWNER",
        storeId: store.id,
      },
      create: {
        email: ownerEmail,
        name: `Owner ${demoConfig.name}`,
        passwordHash: defaultPasswordHash,
        phone: "62895389974414",
        role: "STORE_OWNER",
        storeId: store.id,
      },
    });

    for (const item of demoProducts) {
      const existing = await prisma.product.findFirst({
        where: { storeId: store.id, slug: item.slug },
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            category: item.category,
            brand: item.brand,
            price: item.price,
            images: item.images,
            grade: item.grade,
            ram: item.ram,
            storage: item.storage,
            batteryHealth: item.batteryHealth,
            completeness: item.completeness,
            conditionNotes: item.conditionNotes,
            description: item.description,
            status: item.status,
            isFeatured: Boolean(item.isFeatured),
            isReadyCod: item.isReadyCod !== undefined ? Boolean(item.isReadyCod) : true,
          },
        });
      } else {
        await prisma.product.create({
          data: {
            storeId: store.id,
            title: item.title,
            slug: item.slug,
            category: item.category,
            brand: item.brand,
            price: item.price,
            images: item.images,
            grade: item.grade,
            ram: item.ram,
            storage: item.storage,
            batteryHealth: item.batteryHealth,
            completeness: item.completeness,
            conditionNotes: item.conditionNotes,
            description: item.description,
            status: item.status,
            isFeatured: Boolean(item.isFeatured),
            isReadyCod: item.isReadyCod !== undefined ? Boolean(item.isReadyCod) : true,
          },
        });
      }
    }

    // Seed verified reviews if empty
    const existingReviewsCount = await prisma.storeReview.count({
      where: { storeId: store.id },
    });
    if (existingReviewsCount === 0) {
      await prisma.storeReview.createMany({
        data: [
          {
            storeId: store.id,
            customerName: "Darmawan Santoso",
            rating: 5,
            purchasedUnit: "iPhone 15 Pro Max 256GB Natural Titanium",
            comment: "Pelayanan sangat berkelas dan profesional. Unit mulus 100% seperti baru, BH 100%, IMEI terdaftar Kemenperin resmi. Diberikan garansi 30 hari replace unit dan dibantu migrasi data sampai selesai. Sangat recommended!",
            isApproved: true,
          },
          {
            storeId: store.id,
            customerName: "Stephanie Wijaya",
            rating: 5,
            purchasedUnit: "iPhone 14 Pro 128GB Deep Purple",
            comment: "Awalnya ragu transaksi online, tapi setelah cek fisik langsung ke gerai dan verifikasi rekening resmi toko, semuanya aman dan transparan. Unit no minus dan dapet bonus hydrogel original.",
            isApproved: true,
          },
          {
            storeId: store.id,
            customerName: "Reza Pratama",
            rating: 5,
            purchasedUnit: "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
            comment: "Proses Trade-In unit lama saya dihargai sangat fair dan transparan dibanding konter lain. Langsung bawa pulang S24 Ultra dalam waktu 30 menit. Mantap layanannya!",
            isApproved: true,
          },
        ],
      });
    }

    console.log(`✅ Demo store ${demoConfig.slug} (${demoConfig.name}) provisioned with 4 products.`);
  }

  console.log("🎉 Idempotent production seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
