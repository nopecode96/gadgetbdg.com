import { PrismaClient, StoreTier, ProductStatus, Role, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning up existing seed data...");
  await prisma.subscriptionPayment.deleteMany({});
  await prisma.tradeInOffer.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.store.deleteMany({});

  console.log("🌱 Seeding Super Admin...");
  const defaultPasswordHash = await bcrypt.hash("admin123", 10);

  // Super Admin Default (Platform SaaS)
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin GadgetBdg",
      email: "superadmin@gadgetbdg.com",
      passwordHash: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("🌱 Seeding stores & merchant users...");

  // 1. Berkah Cell (Minimal-Clean theme, Pro Tier)
  const berkahCell = await prisma.store.create({
    data: {
      name: "Berkah Cell Gadget",
      slug: "berkahcell",
      customDomain: null,
      whatsapp: "6281234567890",
      address: "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung",
      mapsUrl: "https://maps.google.com/?q=Bandung+Electronic+Center",
      tier: StoreTier.PRO,
      templateId: "minimal-clean",
      primaryColor: "#2563eb",
      logoUrl: "https://images.unsplash.com/photo-1596558450268-9c27524ba856?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80",
      isActive: true,
      products: {
        create: [
          {
            name: "iPhone 15 Pro Max 256GB Natural Titanium",
            brand: "Apple",
            price: 18500000,
            ramRom: "8GB / 256GB",
            batteryHealth: 94,
            imeiStatus: "Resmi iBox (Kemenperin Aman)",
            completeness: "Fullset Original Box & Kabel",
            condition: "98% Mulus Like New",
            minusNotes: "Fisik istimewa terawat, 3uTools hijau semua, TrueTone & FaceID normal",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/iphone-15-pro.png",
            ],
          },
          {
            name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
            brand: "Samsung",
            price: 15900000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Fullset Original Box + Stylus S-Pen",
            condition: "99% Mulus Istimewa",
            minusNotes: "Garansi resmi aktif, layar dynamic AMOLED mulus bebas shadow",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/samsung-s24-ultra.png",
            ],
          },
          {
            name: "Xiaomi 14T Pro 12/512GB Leica Titan Black",
            brand: "Xiaomi",
            price: 8750000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Original 120W HyperCharge",
            condition: "99% Seperti Baru (Plastik Bezel)",
            minusNotes: "No minus mulus total, Leica summicron optic super jernih",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/xiaomi-14t-pro.png",
            ],
          },
          {
            name: "ASUS ROG Phone 8 16/256GB Phantom Black",
            brand: "ASUS ROG",
            price: 10800000,
            ramRom: "16GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi ASUS Indonesia",
            completeness: "Fullset Box Original + 65W Charger",
            condition: "97% Terawat Mulus",
            minusNotes: "Snapdragon 8 Gen 3 beast gaming, AirTrigger responsif normal",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/rog-phone-8.png",
            ],
          },
        ],
      },
      tradeInOffers: {
        create: [
          {
            customerName: "Rian Firmansyah",
            customerWa: "082119876543",
            deviceModel: "iPhone 11 64GB Black",
            expectedPrice: 4200000,
            conditionDesc: "Fisik 90%, FaceID normal, kamera normal, ex garansi inter",
            minusNotes: "Battery health 74% (perlu servis baterai), layar pernah ganti original copotan",
            photoUrls: [
              "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80",
            ],
          },
        ],
      },
    },
  });

  // 2. Gamers Gadget (Dark-Gaming theme, Starter Tier)
  const gamersGadget = await prisma.store.create({
    data: {
      name: "Gamers Gadget Bandung",
      slug: "gamersgadget",
      customDomain: null,
      whatsapp: "6289876543210",
      address: "ITC Kebon Kelapa Lantai 3 Blok F No. 8, Jl. Moh. Toha, Bandung",
      mapsUrl: "https://maps.google.com/?q=ITC+Kebon+Kelapa+Bandung",
      tier: StoreTier.STARTER,
      templateId: "dark-gaming",
      primaryColor: "#10b981",
      logoUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
      isActive: true,
      products: {
        create: [
          {
            name: "ASUS ROG Phone 8 16/256GB Phantom Black",
            brand: "ASUS ROG",
            price: 10800000,
            ramRom: "16GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi ASUS Indonesia",
            completeness: "Fullset Box + AeroActive Cooler + 65W HyperCharge",
            condition: "99% Mulus Like New",
            minusNotes: "AirTrigger normal responsif, RGB Matrix nyala normal, baterai 6000mAh super awet",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/rog-phone-8.png",
            ],
          },
          {
            name: "Xiaomi 14T Pro 12/512GB Leica Titan Black",
            brand: "Xiaomi",
            price: 8750000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi Xiaomi Indonesia",
            completeness: "Fullset Original 120W FlashCharge",
            condition: "99% Mulus Like New",
            minusNotes: "Snapdragon 8 Gen 3 beast gaming, no minus sama sekali, garansi on",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/xiaomi-14t-pro.png",
            ],
          },
          {
            name: "iPhone 15 Pro Max 256GB Natural Titanium",
            brand: "Apple",
            price: 18500000,
            ramRom: "8GB / 256GB",
            batteryHealth: 94,
            imeiStatus: "Resmi Digimap (Kemenperin Aktif)",
            completeness: "Fullset Box Original",
            condition: "98% Mulus",
            minusNotes: "Layar mulus sudah pasang tempered glass matte gaming, no dent",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/iphone-15-pro.png",
            ],
          },
          {
            name: "Samsung Galaxy S24 Ultra 12/512GB Titanium Gray",
            brand: "Samsung",
            price: 15900000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Unit + Stylus S-Pen Original + Box",
            condition: "98% Pemakaian Terawat",
            minusNotes: "Kamera & performa gaming 100% buas bebas minus",
            status: ProductStatus.AVAILABLE,
            images: [
              "/images/items/samsung-s24-ultra.png",
            ],
          },
        ],
      },
    },
  });

  // Buat User Store Owner & Staf untuk Berkah Cell (Pro Tier)
  const berkahOwner = await prisma.user.create({
    data: {
      name: "Owner Berkah Cell",
      email: "owner@berkahcell.com",
      passwordHash: defaultPasswordHash,
      role: Role.STORE_OWNER,
      storeId: berkahCell.id,
    },
  });

  const berkahStaff = await prisma.user.create({
    data: {
      name: "Kasir Berkah BEC",
      email: "kasir@berkahcell.com",
      passwordHash: defaultPasswordHash,
      role: Role.STORE_STAFF,
      storeId: berkahCell.id,
    },
  });

  // Buat User Store Owner untuk Gamers Gadget (Starter Tier)
  const gamersOwner = await prisma.user.create({
    data: {
      name: "Owner Gamers Gadget",
      email: "owner@gamersgadget.com",
      passwordHash: defaultPasswordHash,
      role: Role.STORE_OWNER,
      storeId: gamersGadget.id,
    },
  });

  // Contoh data Payment Approved untuk Berkah Cell
  await prisma.subscriptionPayment.create({
    data: {
      storeId: berkahCell.id,
      tier: StoreTier.PRO,
      amount: 600000,
      status: PaymentStatus.APPROVED,
      receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    },
  });

  console.log(`✅ Seeding berhasil!`);
  console.log(`- Super Admin: ${superAdmin.email} (Password: admin123)`);
  console.log(`- Toko 1: ${berkahCell.name} (/${berkahCell.slug}) - Owner: ${berkahOwner.email}`);
  console.log(`- Toko 2: ${gamersGadget.name} (/${gamersGadget.slug}) - Owner: ${gamersOwner.email}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
