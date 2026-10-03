const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning up old database records...");
  // Hapus data child terlebih dahulu untuk menjaga relasi
  await prisma.salesCommissionLog.deleteMany({});
  await prisma.tradeInOffer.deleteMany({});
  await prisma.subscriptionPayment.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});

  console.log("📦 Seeding Subscription Plans...");
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
      reportsLevel: "BRANCH_FULL",
      description: "Kapasitas tanpa batas untuk juragan HP second dengan perputaran stok masif & multi-cabang.",
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
  }

  console.log("🔑 Generating password hashes (bcrypt salt 10)...");
  const defaultPass = await bcrypt.hash("Admin123!", 10);
  const adminPass = defaultPass;
  const ownerPass = defaultPass;
  const kasirPass = defaultPass;
  const salesPass = defaultPass;

  // =========================================================================
  // 1. Akun Platform SaaS (storeId: null)
  // =========================================================================
  console.log("👑 Seeding SaaS Platform Team Users...");
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@gadgetbdg.com",
      passwordHash: adminPass,
      name: "Super Admin GadgetBdg",
      phone: "6281122334455",
      role: "SUPER_ADMIN",
      storeId: null,
    },
  });

  const staffAdmin = await prisma.user.create({
    data: {
      email: "staff@gadgetbdg.com",
      passwordHash: adminPass,
      name: "Staff Operasional SaaS",
      phone: "6281122334466",
      role: "ADMIN_SAAS",
      storeId: null,
    },
  });

  const salesAgent = await prisma.user.create({
    data: {
      email: "sales@gadgetbdg.com",
      passwordHash: salesPass,
      name: "Andi Pratama (Sales Partner)",
      phone: "6281122334477",
      role: "SALES_AGENT",
      referralCode: "SALES-ANDI",
      bankName: "BCA",
      bankNumber: "1234567890",
      bankHolder: "Andi Pratama",
      storeId: null,
    },
  });

  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // =========================================================================
  // 2. Toko 1: PAKET STARTER (Rp 250.000/bln)
  // Bandung Cell Second (Subdomain: bandungcell)
  // Kuota Starter: 1 user (owner saja, 0 staf)
  // =========================================================================
  console.log("🏪 Seeding Store 1: Bandung Cell Second (STARTER)...");
  const storeStarter = await prisma.store.create({
    data: {
      name: "Bandung Cell Second",
      slug: "bandungcell",
      customDomain: null,
      whatsapp: "6281211112222",
      address: "ITC Kebon Kelapa Lantai 3 Blok B-12, Bandung",
      mapsUrl: "https://maps.google.com/?q=ITC+Kebon+Kelapa+Bandung",
      tier: "STARTER",
      planId: "STARTER",
      templateId: "minimal-clean",
      primaryColor: "#2563eb",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: false,
      lastTemplateChangeAt: new Date(),
      isActive: true,
      subscriptionExpiresAt: thirtyDaysLater,
      users: {
        create: [
          {
            email: "owner@bandungcell.com",
            passwordHash: ownerPass,
            name: "Kang Asep BandungCell",
            phone: "6281211112222",
            role: "STORE_OWNER",
          },
        ],
      },
      payments: {
        create: [
          {
            tier: "STARTER",
            planId: "STARTER",
            amount: 250000,
            status: "APPROVED",
            receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            notes: "Langganan Paket Starter 1 Bulan - Verified via QRIS",
          },
        ],
      },
      products: {
        create: [
          {
            name: "iPhone 11 64GB Black (iBox)",
            brand: "Apple",
            price: 4350000,
            ramRom: "4GB / 64GB",
            batteryHealth: 84,
            imeiStatus: "Resmi iBox Kemenperin Aman",
            completeness: "Fullset Box OEM + Kabel",
            condition: "95% Mulus Terawat",
            minusNotes: "Fisik pemakaian wajar, TrueTone & FaceID on",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Samsung Galaxy A54 5G 8/256GB Awesome Violet",
            brand: "Samsung",
            price: 3850000,
            ramRom: "8GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Original bawaan pabrik",
            condition: "97% Like New",
            minusNotes: "Mulus tanpa dent, kamera OIS jernih",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "OPPO Reno 8 5G 8/256GB Shimmer Gold",
            brand: "OPPO",
            price: 3250000,
            ramRom: "8GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi OPPO Indonesia",
            completeness: "Unit Only + Fast Charger 80W",
            condition: "94% Mulus",
            minusNotes: "Ada goresan halus di casing belakang",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "POCO X5 Pro 5G 8/256GB Yellow",
            brand: "POCO",
            price: 3100000,
            ramRom: "8GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Box & Charger 67W",
            condition: "98% Istimewa",
            minusNotes: "No minus mulus siap pakai game berat",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Redmi Note 12 6/128GB Onyx Gray",
            brand: "Xiaomi",
            price: 1850000,
            ramRom: "6GB / 128GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Original",
            condition: "96% Terawat",
            minusNotes: "Layar AMOLED mulus no shadow",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            ],
          },
        ],
      },
    },
  });

  // =========================================================================
  // 3. Toko 2: PAKET PRO (Rp 600.000/bln)
  // Berkah Gadget BEC (Subdomain: berkahcell, CustomDomain: berkahcell.com)
  // Kuota Pro: 3 user (1 owner + 2 staf)
  // =========================================================================
  console.log("🏪 Seeding Store 2: Berkah Gadget BEC (PRO)...");
  const storePro = await prisma.store.create({
    data: {
      name: "Berkah Gadget BEC",
      slug: "berkahcell",
      customDomain: "berkahcell.com",
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: "PRO",
      planId: "PRO",
      templateId: "flagship-gold",
      primaryColor: "#eab308",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      lastTemplateChangeAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // >30 hari cooldown selesai
      isActive: true,
      subscriptionExpiresAt: thirtyDaysLater,
      salesUserId: salesAgent.id,
      users: {
        create: [
          {
            email: "demo@berkacell.com",
            passwordHash: ownerPass,
            name: "Haji Dedi (Owner Berkah)",
            phone: "6281234567890",
            role: "STORE_OWNER",
          },
          {
            email: "kasir1@berkahcell.com",
            passwordHash: kasirPass,
            name: "Rian Kasir BEC",
            phone: "6281234567891",
            role: "STORE_STAFF",
          },
          {
            email: "kasir2@berkahcell.com",
            passwordHash: kasirPass,
            name: "Siti Sales Gadget",
            phone: "6281234567892",
            role: "STORE_STAFF",
          },
        ],
      },
      payments: {
        create: [
          {
            tier: "PRO",
            planId: "PRO",
            amount: 600000,
            status: "APPROVED",
            receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            notes: "Langganan Paket Pro 1 Bulan - Verified via QRIS",
          },
        ],
      },
      products: {
        create: [
          {
            name: "iPhone 14 Pro 128GB Deep Purple (iBox)",
            brand: "Apple",
            price: 14200000,
            ramRom: "6GB / 128GB",
            batteryHealth: 89,
            imeiStatus: "Resmi iBox Kemenperin Aman",
            completeness: "Fullset Original Box & USB-C Cable",
            condition: "98% Mulus Like New",
            minusNotes: "Fisik istimewa terawat, Dynamic Island normal",
            status: "AVAILABLE",
            images: [
              "/images/items/iphone-15-pro.png",
              "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 13 128GB Midnight",
            brand: "Apple",
            price: 8850000,
            ramRom: "4GB / 128GB",
            batteryHealth: 86,
            imeiStatus: "Resmi Digimap Indonesia",
            completeness: "Fullset Original Box",
            condition: "97% Mulus",
            minusNotes: "Baterai awet, FaceID dan TrueTone lancar",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Samsung Galaxy S23 Ultra 12/256GB Phantom Black",
            brand: "Samsung",
            price: 12900000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Original Box + S-Pen",
            condition: "99% Seperti Baru",
            minusNotes: "No minus mulus total, kamera 200MP tajam",
            status: "AVAILABLE",
            images: [
              "/images/items/samsung-s24-ultra.png",
              "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Xiaomi 13T 12/256GB Leica Meadow Green",
            brand: "Xiaomi",
            price: 5450000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Original 67W Charger",
            condition: "98% Mulus",
            minusNotes: "Garansi resmi aktif s/d November 2026",
            status: "AVAILABLE",
            images: [
              "/images/items/xiaomi-14t-pro.png",
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 12 Pro Max 256GB Pacific Blue",
            brand: "Apple",
            price: 9750000,
            ramRom: "6GB / 256GB",
            batteryHealth: 83,
            imeiStatus: "All Operator Terdaftar",
            completeness: "Unit Only + Bonus Charger 20W",
            condition: "93% Fisik Normal",
            minusNotes: "Lecet halus di sudut bezel, fungsi 100% aman",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Google Pixel 7 Pro 12/128GB Hazel",
            brand: "Google",
            price: 7600000,
            ramRom: "12GB / 128GB",
            batteryHealth: null,
            imeiStatus: "Bea Cukai Resmi Terdaftar",
            completeness: "Fullset Box Original",
            condition: "96% Mulus",
            minusNotes: "Kamera flagship istimewa, no minus",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Samsung Galaxy Z Flip 4 8/256GB Bora Purple",
            brand: "Samsung",
            price: 6450000,
            ramRom: "8GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Box Original",
            condition: "95% Mulus",
            minusNotes: "Engsel lipatan aman dan kencang",
            status: "AVAILABLE",
            images: [
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 11 Pro 256GB Midnight Green",
            brand: "Apple",
            price: 6300000,
            ramRom: "4GB / 256GB",
            batteryHealth: 81,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Unit + Kabel Data",
            condition: "94% Mulus",
            minusNotes: "Layar original, FaceID normal",
            status: "BOOKED", // Status BOOKED untuk simulasi omset
            images: [
              "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Vivo X90 Pro 12/256GB Zeiss Legend Black",
            brand: "Vivo",
            price: 8200000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi Vivo Indonesia",
            completeness: "Fullset Original FlashCharge 120W",
            condition: "98% Mulus Like New",
            minusNotes: "Sensor kamera 1-inch mantap",
            status: "SOLD", // Status SOLD untuk simulasi omset terjual
            images: [
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 14 128GB Blue (iBox)",
            brand: "Apple",
            price: 9900000,
            ramRom: "6GB / 128GB",
            batteryHealth: 91,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Box Original",
            condition: "98% Like New",
            minusNotes: "Baterai awet 91%, fungsi normal",
            status: "SOLD", // Status SOLD
            images: [
              "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80",
            ],
          },
        ],
      },
    },
  });

  // Buat SalesCommissionLog terpisah setelah storePro & payment sudah ada ID-nya
  const storeProfirstPayment = await prisma.subscriptionPayment.findFirst({
    where: { storeId: storePro.id },
  });
  if (storeProfirstPayment) {
    await prisma.salesCommissionLog.create({
      data: {
        salesUserId: salesAgent.id,
        storeId: storePro.id,
        paymentId: storeProfirstPayment.id,
        tier: "PRO",
        amount: 100000,
        status: "PENDING",
      },
    });
  }

  // =========================================================================
  // 4. Toko 3: PAKET ADVANCE (Rp 1.000.000/bln)
  // Juragan HP Bandung (Subdomain: juraganhp, CustomDomain: juraganhpbandung.id)
  // Kuota Advance: 5 user per branch (1 owner + 4 staf)
  // =========================================================================
  console.log("🏪 Seeding Store 3: Juragan HP Bandung (ADVANCE)...");
  const storeAdvance = await prisma.store.create({
    data: {
      name: "Juragan HP Bandung",
      slug: "juraganhp",
      customDomain: "juraganhpbandung.id",
      whatsapp: "6281399998888",
      address: "Sentra Gadget Dago & BEC Lantai 2, Bandung (Multi-Branch)",
      mapsUrl: "https://maps.google.com/?q=Sentra+Gadget+Dago+Bandung",
      tier: "ADVANCE",
      planId: "ADVANCE",
      templateId: "cyber-blue",
      primaryColor: "#06b6d4",
      logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      lastTemplateChangeAt: new Date(),
      isActive: true,
      subscriptionExpiresAt: thirtyDaysLater,
      users: {
        create: [
          {
            email: "owner@juraganhp.com",
            passwordHash: ownerPass,
            name: "Bos Arya (Owner Juragan HP)",
            phone: "6281399998888",
            role: "STORE_OWNER",
          },
          {
            email: "kasir1@juraganhp.com",
            passwordHash: kasirPass,
            name: "Staff Dago 1",
            phone: "6281399998881",
            role: "STORE_STAFF",
          },
          {
            email: "kasir2@juraganhp.com",
            passwordHash: kasirPass,
            name: "Staff Dago 2",
            phone: "6281399998882",
            role: "STORE_STAFF",
          },
          {
            email: "kasir3@juraganhp.com",
            passwordHash: kasirPass,
            name: "Staff Cabang BEC 1",
            phone: "6281399998883",
            role: "STORE_STAFF",
          },
          {
            email: "kasir4@juraganhp.com",
            passwordHash: kasirPass,
            name: "Staff Cabang BEC 2",
            phone: "6281399998884",
            role: "STORE_STAFF",
          },
        ],
      },
      payments: {
        create: [
          {
            tier: "ADVANCE",
            planId: "ADVANCE",
            amount: 1000000,
            status: "APPROVED",
            receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
            notes: "Langganan Paket Advance 1 Bulan Multi-Branch - Verified via QRIS",
          },
        ],
      },
      products: {
        create: [
          {
            name: "iPhone 15 Pro Max 256GB Natural Titanium (iBox)",
            brand: "Apple",
            price: 19800000,
            ramRom: "8GB / 256GB",
            batteryHealth: 96,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Original Box & Braided Cable",
            condition: "99% Like New Super Mulus",
            minusNotes: "Fisik 10/10 titanium mulus tanpa gores, garansi aktif",
            status: "AVAILABLE",
            images: ["/images/items/iphone-15-pro.png"],
          },
          {
            name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
            brand: "Samsung",
            price: 18500000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Box Original + Stylus Pen",
            condition: "99% Seperti Baru",
            minusNotes: "Galaxy AI aktif, layar datar anti gores, no minus",
            status: "AVAILABLE",
            images: ["/images/items/samsung-s24-ultra.png"],
          },
          {
            name: "Xiaomi 14T Pro 12/512GB Titan Black (Leica)",
            brand: "Xiaomi",
            price: 8750000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Box Original 120W HyperCharge",
            condition: "99% Mulus Like New",
            minusNotes: "Kamera Leica Summilux joss, garansi resmi panjang",
            status: "AVAILABLE",
            images: ["/images/items/xiaomi-14t-pro.png"],
          },
          {
            name: "ASUS ROG Phone 8 16/256GB Phantom Black",
            brand: "ASUS ROG",
            price: 10400000,
            ramRom: "16GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi ASUS Indonesia",
            completeness: "Fullset Box Original + 65W HyperCharge",
            condition: "98% Mulus Terawat",
            minusNotes: "AniMe Vision nyala normal, AirTrigger responsif gaming",
            status: "AVAILABLE",
            images: ["/images/items/rog-phone-8.png"],
          },
          {
            name: "iPhone 14 Pro Max 256GB Space Black",
            brand: "Apple",
            price: 15600000,
            ramRom: "6GB / 256GB",
            batteryHealth: 88,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Box Original",
            condition: "97% Mulus",
            minusNotes: "Dynamic Island dan kamera 48MP normal",
            status: "AVAILABLE",
            images: ["/images/items/iphone-15-pro.png"],
          },
          {
            name: "Samsung Galaxy Z Fold 5 12/512GB Icy Blue",
            brand: "Samsung",
            price: 15900000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Box Original",
            condition: "97% Mulus",
            minusNotes: "Engsel fleksibel rapat, layar lipat jernih no crease",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iPhone 13 Pro Max 128GB Sierra Blue",
            brand: "Apple",
            price: 12200000,
            ramRom: "6GB / 128GB",
            batteryHealth: 85,
            imeiStatus: "Resmi Digimap Indonesia",
            completeness: "Fullset Box Original",
            condition: "96% Mulus",
            minusNotes: "Layar 120Hz ProMotion mulus no lecet",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "OnePlus 12 16/512GB Silky Black (Hasselblad)",
            brand: "OnePlus",
            price: 11200000,
            ramRom: "16GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Bea Cukai Terdaftar All Operator",
            completeness: "Fullset Box Original 100W SuperVOOC",
            condition: "98% Mulus Like New",
            minusNotes: "Snapdragon 8 Gen 3 super kencang",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iQOO 12 16/512GB Legend Edition (BMW Motorsport)",
            brand: "iQOO",
            price: 8800000,
            ramRom: "16GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi iQOO Indonesia",
            completeness: "Fullset Box + 120W FlashCharge",
            condition: "99% Istimewa",
            minusNotes: "Performa gaming monster, garansi on",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iPhone 12 128GB Purple (iBox)",
            brand: "Apple",
            price: 6900000,
            ramRom: "4GB / 128GB",
            batteryHealth: 82,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Box Original",
            condition: "94% Mulus",
            minusNotes: "Pemakaian wajar, TrueTone on",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "Samsung Galaxy S22 Plus 8/256GB Green",
            brand: "Samsung",
            price: 6950000,
            ramRom: "8GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Unit Only + Fast Charger",
            condition: "95% Mulus",
            minusNotes: "No shadow, layar Dynamic AMOLED 2X",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "Vivo V30 Pro 5G 12/512GB Green Sea (Zeiss)",
            brand: "Vivo",
            price: 5800000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi Vivo Indonesia",
            completeness: "Fullset Box Original 80W Charger",
            condition: "99% Like New",
            minusNotes: "Aura Light Portrait bagus untuk foto produk",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "Realme GT 6 12/256GB Fluid Silver",
            brand: "Realme",
            price: 6700000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi Realme Indonesia",
            completeness: "Fullset Box 120W SuperVOOC",
            condition: "98% Mulus",
            minusNotes: "Snapdragon 8s Gen 3, layar 6000 nits super terang",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "POCO F6 12/512GB Titanium Gray",
            brand: "POCO",
            price: 5150000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Box 90W Turbo Charge",
            condition: "99% Mulus Like New",
            minusNotes: "Pemakaian 1 bulan, mulus no minus",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iPhone 11 Pro Max 256GB Space Gray",
            brand: "Apple",
            price: 7400000,
            ramRom: "4GB / 256GB",
            batteryHealth: 80,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Box Original",
            condition: "93% Fisik Normal",
            minusNotes: "Ada lecet tipis di bezel samping",
            status: "BOOKED",
            images: ["https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "Samsung Galaxy A55 5G 12/256GB Awesome Navy",
            brand: "Samsung",
            price: 4900000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Original",
            condition: "98% Mulus",
            minusNotes: "Frame metal solid, kamera OIS 50MP",
            status: "AVAILABLE",
            images: ["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iPad Air 5 M1 64GB WiFi Space Gray",
            brand: "Apple",
            price: 7800000,
            ramRom: "8GB / 64GB",
            batteryHealth: 92,
            imeiStatus: "WiFi Only Resmi iBox",
            completeness: "Fullset Box Original",
            condition: "98% Mulus",
            minusNotes: "Chip Apple M1 kencang, layar TrueTone normal",
            status: "SOLD",
            images: ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"],
          },
          {
            name: "iPhone 15 Plus 128GB Pink (iBox)",
            brand: "Apple",
            price: 13500000,
            ramRom: "6GB / 128GB",
            batteryHealth: 98,
            imeiStatus: "Resmi iBox Indonesia",
            completeness: "Fullset Box Original",
            condition: "99% Seperti Baru",
            minusNotes: "Baterai awet 98%, no dent no scratch",
            status: "SOLD",
            images: ["/images/items/iphone-15-pro.png"],
          },
        ],
      },
      tradeInOffers: {
        create: [
          {
            customerName: "Dimas Anggara",
            customerWa: "081322233344",
            deviceModel: "iPhone 13 128GB Blue",
            expectedPrice: 7500000,
            conditionDesc: "Fisik 95% pemakaian terawat, iBox resmi",
            minusNotes: "Battery health 83%, no minus fungsi",
            photoUrls: ["https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80"],
          },
        ],
      },
    },
  });

  console.log("=================================================");
  console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
  console.log("👑 SaaS Internal Admins & Partners (Password: Admin123!):");
  console.log(`   - Super Admin : ${superAdmin.email} | pass: Admin123!`);
  console.log(`   - Staff Admin : ${staffAdmin.email} | pass: Admin123!`);
  console.log(`   - Sales Agent : ${salesAgent.email} | pass: Admin123! (Ref: ${salesAgent.referralCode})`);
  console.log("🏬 Toko 1 (STARTER):");
  console.log(`   - Store : ${storeStarter.name} (/${storeStarter.slug})`);
  console.log(`   - Owner : owner@bandungcell.com | pass: Admin123! (Total 1 user)`);
  console.log("🏬 Toko 2 (PRO):");
  console.log(`   - Store : ${storePro.name} (/${storePro.slug} & ${storePro.customDomain})`);
  console.log(`   - Owner : demo@berkacell.com | pass: Admin123!`);
  console.log(`   - Staf  : kasir1@berkahcell.com & kasir2@berkahcell.com | pass: Admin123! (Total 3 users)`);
  console.log("🏬 Toko 3 (ADVANCE):");
  console.log(`   - Store : ${storeAdvance.name} (/${storeAdvance.slug} & ${storeAdvance.customDomain})`);
  console.log(`   - Owner : owner@juraganhp.com | pass: Admin123!`);
  console.log(`   - Staf  : kasir1@juraganhp.com s/d kasir4@juraganhp.com | pass: Admin123! (Total 5 users)`);
  console.log("=================================================");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
