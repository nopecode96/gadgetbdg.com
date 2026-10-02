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
            name: "iPhone 13 Pro 128GB Sierra Blue",
            brand: "Apple",
            price: 11450000,
            ramRom: "6GB / 128GB",
            batteryHealth: 86,
            imeiStatus: "Resmi iBox (Kemenperin Aman)",
            completeness: "Fullset Original Box & Kabel",
            condition: "98% Mulus Like New",
            minusNotes: "Fisik istimewa terawat, 3uTools hijau semua, TrueTone & FaceID normal",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 12 128GB White",
            brand: "Apple",
            price: 6850000,
            ramRom: "4GB / 128GB",
            batteryHealth: 82,
            imeiStatus: "All Operator Terdaftar",
            completeness: "Unit Only + Bonus Charger 20W OEM",
            condition: "93% Fisik Pemakaian Wajar",
            minusNotes: "Ada lecet pemakaian tipis di bezel kiri bawah, kamera jernih, layar aman",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Samsung Galaxy S22 Ultra 12/256GB Burgundy",
            brand: "Samsung",
            price: 8900000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi SEIN Indonesia",
            completeness: "Unit + Stylus S-Pen Original (Batangan)",
            condition: "90% Fisik Normal",
            minusNotes: "Layar ada shadow tipis samar di background putih, fungsi 100% lancar, kamera joss 100x zoom",
            status: ProductStatus.AVAILABLE,
            images: [
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
            completeness: "Fullset Original 67W Turbo Charger",
            condition: "99% Seperti Baru (Plastik Bezel Nempel)",
            minusNotes: "No minus mulus total, garansi resmi aktif s/d November 2026",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
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
            name: "ASUS ROG Phone 6 12/256GB Phantom Black",
            brand: "ASUS ROG",
            price: 7200000,
            ramRom: "12GB / 256GB",
            batteryHealth: null,
            imeiStatus: "Resmi ASUS Indonesia",
            completeness: "Fullset Box + AeroActive Cooler 6 + 65W HyperCharge",
            condition: "96% Terawat Mulus",
            minusNotes: "AirTrigger normal responsif, RGB Matrix nyala normal, baterai 6000mAh super awet",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iQOO 12 16/512GB Legend Edition (BMW M Motorsport)",
            brand: "iQOO",
            price: 8600000,
            ramRom: "16GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi iQOO Indonesia",
            completeness: "Fullset Original 120W FlashCharge",
            condition: "99% Mulus Like New",
            minusNotes: "Snapdragon 8 Gen 3 beast gaming, no minus sama sekali, garansi on",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "iPhone 13 256GB Starlight (Gaming Rig Edition)",
            brand: "Apple",
            price: 9300000,
            ramRom: "4GB / 256GB",
            batteryHealth: 88,
            imeiStatus: "Resmi Digimap (Kemenperin Aktif)",
            completeness: "Fullset Box Original",
            condition: "97% Mulus",
            minusNotes: "Layar mulus sudah pasang tempered glass matte gaming, no dent",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80",
            ],
          },
          {
            name: "Poco F5 Pro 12/512GB Black",
            brand: "POCO",
            price: 5200000,
            ramRom: "12GB / 512GB",
            batteryHealth: null,
            imeiStatus: "Resmi POCO Indonesia",
            completeness: "Unit + Kabel Data Fast Charging (Batangan)",
            condition: "92% Pemakaian Harian",
            minusNotes: "Bezel ada bintik jamur bekas casing case ketat, layar & performa gaming 100% buas",
            status: ProductStatus.AVAILABLE,
            images: [
              "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
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
