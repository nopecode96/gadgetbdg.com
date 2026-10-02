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
