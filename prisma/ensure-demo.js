const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function ensureDemoData() {
  console.log("🌱 Ensuring demo stores and products exist (Upsert Mode)...");

  // 1. Berkah Cell (Minimal-Clean theme, Pro Tier)
  const berkahCell = await prisma.store.upsert({
    where: { slug: "berkahcell" },
    update: {
      name: "Berkah Cell Gadget",
      tier: "PRO",
      templateId: "minimal-clean",
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      primaryColor: "#2563eb",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      isActive: true,
    },
    create: {
      name: "Berkah Cell Gadget",
      slug: "berkahcell",
      customDomain: null,
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: "PRO",
      templateId: "minimal-clean",
      primaryColor: "#2563eb",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      lastTemplateChangeAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
      isActive: true,
    },
  });

  const berkahCount = await prisma.product.count({ where: { storeId: berkahCell.id } });
  if (berkahCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId: berkahCell.id,
          name: "iPhone 15 Pro Max 256GB Natural Titanium",
          brand: "Apple",
          price: 18500000,
          ramRom: "8GB / 256GB",
          batteryHealth: 94,
          imeiStatus: "Resmi iBox (Kemenperin Aman)",
          completeness: "Fullset Original Box & Kabel",
          condition: "98% Mulus Like New",
          minusNotes: "Fisik istimewa terawat, 3uTools hijau semua, TrueTone & FaceID normal",
          status: "AVAILABLE",
          images: [
            "/images/items/iphone-15-pro.png",
          ],
        },
        {
          storeId: berkahCell.id,
          name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
          brand: "Samsung",
          price: 15900000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Fullset Original Box + Stylus S-Pen",
          condition: "99% Mulus Istimewa",
          minusNotes: "Garansi resmi aktif, layar dynamic AMOLED mulus bebas shadow",
          status: "AVAILABLE",
          images: [
            "/images/items/samsung-s24-ultra.png",
          ],
        },
        {
          storeId: berkahCell.id,
          name: "Xiaomi 14T Pro 12/512GB Leica Titan Black",
          brand: "Xiaomi",
          price: 8750000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi Xiaomi Indonesia",
          completeness: "Fullset Original 120W HyperCharge",
          condition: "99% Seperti Baru (Plastik Bezel)",
          minusNotes: "No minus mulus total, Leica summicron optic super jernih",
          status: "AVAILABLE",
          images: [
            "/images/items/xiaomi-14t-pro.png",
          ],
        },
        {
          storeId: berkahCell.id,
          name: "ASUS ROG Phone 8 16/256GB Phantom Black",
          brand: "ASUS ROG",
          price: 10800000,
          ramRom: "16GB / 256GB",
          batteryHealth: null,
          imeiStatus: "Resmi ASUS Indonesia",
          completeness: "Fullset Box Original + 65W Charger",
          condition: "97% Terawat Mulus",
          minusNotes: "Snapdragon 8 Gen 3 beast gaming, AirTrigger responsif normal",
          status: "AVAILABLE",
          images: [
            "/images/items/rog-phone-8.png",
          ],
        },
      ],
    });
  }

  // 2. Gamers Gadget (Dark-Gaming theme, Starter Tier)
  const gamersGadget = await prisma.store.upsert({
    where: { slug: "gamersgadget" },
    update: {
      name: "Gamers Gadget Bandung",
      tier: "STARTER",
      templateId: "dark-gaming",
      whatsapp: "6289876543210",
      address: "ITC Kebon Kelapa Lantai 3 Blok F No. 8, Jl. Moh. Toha, Bandung",
      mapsUrl: "https://maps.google.com/?q=ITC+Kebon+Kelapa+Bandung",
      primaryColor: "#10b981",
      logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: false,
      isActive: true,
    },
    create: {
      name: "Gamers Gadget Bandung",
      slug: "gamersgadget",
      customDomain: null,
      whatsapp: "6289876543210",
      address: "ITC Kebon Kelapa Lantai 3 Blok F No. 8, Jl. Moh. Toha, Bandung",
      mapsUrl: "https://maps.google.com/?q=ITC+Kebon+Kelapa+Bandung",
      tier: "STARTER",
      templateId: "dark-gaming",
      primaryColor: "#10b981",
      logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: false,
      lastTemplateChangeAt: null,
      isActive: true,
    },
  });

  const gamersCount = await prisma.product.count({ where: { storeId: gamersGadget.id } });
  if (gamersCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId: gamersGadget.id,
          name: "ASUS ROG Phone 8 16/256GB Phantom Black",
          brand: "ASUS ROG",
          price: 10800000,
          ramRom: "16GB / 256GB",
          batteryHealth: null,
          imeiStatus: "Resmi ASUS Indonesia",
          completeness: "Fullset Box + AeroActive Cooler + 65W HyperCharge",
          condition: "99% Mulus Like New",
          minusNotes: "AirTrigger normal responsif, RGB Matrix nyala normal, baterai 6000mAh super awet",
          status: "AVAILABLE",
          images: [
            "/images/items/rog-phone-8.png",
          ],
        },
        {
          storeId: gamersGadget.id,
          name: "Xiaomi 14T Pro 12/512GB Leica Titan Black",
          brand: "Xiaomi",
          price: 8750000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi Xiaomi Indonesia",
          completeness: "Fullset Original 120W FlashCharge",
          condition: "99% Mulus Like New",
          minusNotes: "Snapdragon 8 Gen 3 beast gaming, no minus sama sekali, garansi on",
          status: "AVAILABLE",
          images: [
            "/images/items/xiaomi-14t-pro.png",
          ],
        },
        {
          storeId: gamersGadget.id,
          name: "iPhone 15 Pro Max 256GB Natural Titanium",
          brand: "Apple",
          price: 18500000,
          ramRom: "8GB / 256GB",
          batteryHealth: 94,
          imeiStatus: "Resmi Digimap (Kemenperin Aktif)",
          completeness: "Fullset Box Original",
          condition: "98% Mulus",
          minusNotes: "Layar mulus sudah pasang tempered glass matte gaming, no dent",
          status: "AVAILABLE",
          images: [
            "/images/items/iphone-15-pro.png",
          ],
        },
        {
          storeId: gamersGadget.id,
          name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
          brand: "Samsung",
          price: 15900000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Unit + Stylus S-Pen Original + Box",
          condition: "98% Pemakaian Terawat",
          minusNotes: "Kamera & performa gaming 100% buas bebas minus",
          status: "AVAILABLE",
          images: [
            "/images/items/samsung-s24-ultra.png",
          ],
        },
      ],
    });
  }

  // 3. Tokyo Street Cell (tokyo-editorial / tokyo-street theme, Pro Tier)
  const tokyoStore = await prisma.store.upsert({
    where: { slug: "tokyostreet" },
    update: {
      name: "Tokyo Street Cell",
      tier: "PRO",
      templateId: "tokyo-editorial",
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-08, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      primaryColor: "#e11d48",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      isActive: true,
    },
    create: {
      name: "Tokyo Street Cell",
      slug: "tokyostreet",
      customDomain: null,
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-08, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: "PRO",
      templateId: "tokyo-editorial",
      primaryColor: "#e11d48",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      lastTemplateChangeAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      isActive: true,
    },
  });

  const tokyoCount = await prisma.product.count({ where: { storeId: tokyoStore.id } });
  if (tokyoCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId: tokyoStore.id,
          name: "iPhone 15 Pro 128GB Black Titanium",
          brand: "Apple",
          price: 15400000,
          ramRom: "8GB / 128GB",
          batteryHealth: 96,
          imeiStatus: "Resmi iBox Indonesia",
          completeness: "Fullset Original Box & Kabel",
          condition: "99% Like New",
          minusNotes: "Fisik istimewa terawat tanpa lecet, 3uTools skor 100",
          status: "AVAILABLE",
          images: ["/images/items/iphone-15-pro.png"],
        },
        {
          storeId: tokyoStore.id,
          name: "Samsung Galaxy S24 Ultra 12/256GB Titanium Black",
          brand: "Samsung",
          price: 15800000,
          ramRom: "12GB / 256GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Fullset Box Original + Stylus Pen",
          condition: "98% Mulus",
          minusNotes: "Layar & body mulus, Galaxy AI aktif permanen",
          status: "AVAILABLE",
          images: ["/images/items/samsung-s24-ultra.png"],
        },
        {
          storeId: tokyoStore.id,
          name: "Xiaomi 14T Pro 12/512GB Titan Black",
          brand: "Xiaomi",
          price: 8400000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi Xiaomi Indonesia",
          completeness: "Fullset Charger 120W & Box",
          condition: "99% Seperti Baru",
          minusNotes: "Kamera Leica jernih maksimal, pemakaian 2 bulan",
          status: "AVAILABLE",
          images: ["/images/items/xiaomi-14t-pro.png"],
        },
        {
          storeId: tokyoStore.id,
          name: "ASUS ROG Phone 8 16/256GB Rebel Grey",
          brand: "ASUS",
          price: 10200000,
          ramRom: "16GB / 256GB",
          batteryHealth: null,
          imeiStatus: "Resmi ASUS Indonesia",
          completeness: "Fullset Original Box & AeroActive Cooler",
          condition: "98% Mulus",
          minusNotes: "Siap hajar game berat rata kanan 120fps",
          status: "AVAILABLE",
          images: ["/images/items/rog-phone-8.png"],
        },
      ],
    });
  }

  // 4. Cyber Telemetry Cell (cyber-hud theme, Advance Tier)
  const cyberStore = await prisma.store.upsert({
    where: { slug: "cybercell" },
    update: {
      name: "Cyber Telemetry Cell",
      tier: "ADVANCE",
      templateId: "cyber-hud",
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-10, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      primaryColor: "#06b6d4",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      isActive: true,
    },
    create: {
      name: "Cyber Telemetry Cell",
      slug: "cybercell",
      customDomain: null,
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-10, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: "ADVANCE",
      templateId: "cyber-hud",
      primaryColor: "#06b6d4",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: true,
      lastTemplateChangeAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      isActive: true,
    },
  });

  const cyberCount = await prisma.product.count({ where: { storeId: cyberStore.id } });
  if (cyberCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId: cyberStore.id,
          name: "ASUS ROG Phone 8 Pro 24GB/1TB Phantom Black",
          brand: "ASUS",
          price: 18900000,
          ramRom: "24GB / 1TB",
          batteryHealth: 99,
          imeiStatus: "Resmi ASUS Indonesia (Kemenperin Aktif)",
          completeness: "Fullset Box + AeroActive Cooler X + Case",
          condition: "99% Mulus Like New",
          minusNotes: "Benchmark AnTuTu 2.2M, AirTrigger & AniMe Vision aktif 100%",
          status: "AVAILABLE",
          images: ["/images/items/rog-phone-8.png"],
        },
        {
          storeId: cyberStore.id,
          name: "iPhone 15 Pro Max 256GB Black Titanium",
          brand: "Apple",
          price: 18500000,
          ramRom: "8GB / 256GB",
          batteryHealth: 95,
          imeiStatus: "Resmi iBox Indonesia",
          completeness: "Fullset Original Box & Braided Cable",
          condition: "98% Mulus",
          minusNotes: "Telemetri 3uTools skor 100 hijau semua, tanpa dent",
          status: "AVAILABLE",
          images: ["/images/items/iphone-15-pro.png"],
        },
        {
          storeId: cyberStore.id,
          name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Black",
          brand: "Samsung",
          price: 16900000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Fullset Box Original + Stylus Pen",
          condition: "98% Mulus",
          minusNotes: "Snapdragon 8 Gen 3 for Galaxy, telemetri kamera 200MP jernih",
          status: "AVAILABLE",
          images: ["/images/items/samsung-s24-ultra.png"],
        },
        {
          storeId: cyberStore.id,
          name: "Xiaomi 14T Pro 12/512GB Titan Black",
          brand: "Xiaomi",
          price: 8400000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi Xiaomi Indonesia",
          completeness: "Fullset Box + HyperCharge 120W",
          condition: "99% Seperti Baru",
          minusNotes: "Dimensity 9300+ Gaming Monster, sensor kamera Leica Summilux",
          status: "AVAILABLE",
          images: ["/images/items/xiaomi-14t-pro.png"],
        },
      ],
    });
  }

  // --- STORE 6: MIDNIGHT GOLD LUXURY (goldcell) ---
  const goldStore = await prisma.store.upsert({
    where: { slug: "goldcell" },
    update: {
      name: "Midnight Gold Concierge",
      tier: "ADVANCE",
      templateId: "midnight-gold",
      whatsapp: "628123456789",
      address: "Bandung Electronic Center (BEC) Lantai LG Blok Z-08, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      primaryColor: "#d4af37",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: false,
      operationalHours: "Setiap Hari: 10:00 - 21:00 WIB",
      warrantyPolicy: "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup.",
      verifiedBadge: true,
      isActive: true,
    },
    create: {
      name: "Midnight Gold Concierge",
      slug: "goldcell",
      customDomain: null,
      whatsapp: "628123456789",
      address: "Bandung Electronic Center (BEC) Lantai LG Blok Z-08, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: "ADVANCE",
      templateId: "midnight-gold",
      primaryColor: "#d4af37",
      logoUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
      hasWatermark: false,
      operationalHours: "Setiap Hari: 10:00 - 21:00 WIB",
      warrantyPolicy: "Garansi Toko 30 Hari Replace Unit & Jaminan Bebas Blokir IMEI Seumur Hidup.",
      verifiedBadge: true,
      isActive: true,
    },
  });

  const goldCount = await prisma.product.count({ where: { storeId: goldStore.id } });
  if (goldCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          storeId: goldStore.id,
          name: "iPhone 15 Pro Max 256GB Natural Titanium",
          brand: "Apple",
          price: 18900000,
          ramRom: "8GB / 256GB",
          batteryHealth: 96,
          imeiStatus: "Resmi iBox Kemenperin",
          completeness: "Fullset Original Box & Cable Type-C Braided",
          condition: "99% Mint Condition Like New",
          minusNotes: "Unit mulus tanpa dent, garansi resmi iBox aktif hingga akhir tahun",
          status: "AVAILABLE",
          images: ["/images/items/iphone-15-pro.png"],
        },
        {
          storeId: goldStore.id,
          name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
          brand: "Samsung",
          price: 17200000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Fullset Box Original + S-Pen + Fast Charger",
          condition: "99% Seperti Baru",
          minusNotes: "Titanium frame bersih mengkilap, layar anti-reflective tanpa gores",
          status: "AVAILABLE",
          images: ["/images/items/samsung-s24-ultra.png"],
        },
        {
          storeId: goldStore.id,
          name: "iPhone 14 Pro 128GB Space Black",
          brand: "Apple",
          price: 13500000,
          ramRom: "6GB / 128GB",
          batteryHealth: 91,
          imeiStatus: "Resmi Digimap Kemenperin",
          completeness: "Fullset Box Original + Cable Lightning",
          condition: "98% Mulus",
          minusNotes: "Stainless steel bezel kinclong, kamera dan True Tone 100% normal",
          status: "AVAILABLE",
          images: ["/images/items/iphone-15-pro.png"],
        },
        {
          storeId: goldStore.id,
          name: "Samsung Galaxy Z Fold 5 12/512GB Phantom Black",
          brand: "Samsung",
          price: 15800000,
          ramRom: "12GB / 512GB",
          batteryHealth: null,
          imeiStatus: "Resmi SEIN Indonesia",
          completeness: "Fullset Box Original",
          condition: "98% Mulus Terawat",
          minusNotes: "Lipatan layar dalam mulus kencang, engsel zero-gap presisi",
          status: "AVAILABLE",
          images: ["/images/items/samsung-s24-ultra.png"],
        },
      ],
    });
  }

  // Seed sample verified reviews for goldStore if empty
  const reviewCount = await prisma.storeReview.count({ where: { storeId: goldStore.id } });
  if (reviewCount === 0) {
    await prisma.storeReview.createMany({
      data: [
        {
          storeId: goldStore.id,
          customerName: "Calvin Hartono",
          rating: 5,
          comment: "Pelayanan butik sangat eksklusif. Unit iPhone 15 Pro Max kondisi 99% seperti baru, baterai awet dan IMEI resmi terdaftar aktif di iBox.",
          purchasedUnit: "iPhone 15 Pro Max 256GB Natural Titanium",
          isApproved: true,
        },
        {
          storeId: goldStore.id,
          customerName: "Dr. Hendra Wijaya",
          rating: 5,
          comment: "Transaksi COD langsung di BEC sangat memuaskan. Toko menyediakan free migrasi data dan pasang temper glass kualitas premium.",
          purchasedUnit: "Samsung Galaxy S24 Ultra 512GB",
          isApproved: true,
        },
      ],
    });
  }

  console.log("✅ Demo stores and products are guaranteed to exist!");
}

if (require.main === module) {
  ensureDemoData()
    .catch((err) => {
      console.error("Demo data ensure error:", err);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { ensureDemoData };
