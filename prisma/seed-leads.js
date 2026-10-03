const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedLeads() {
  console.log("🌱 Menyiapkan 2 data calon toko (isActive: false) di PostgreSQL...");

  const passwordHash = await bcrypt.hash("Admin123!", 10);

  // Ambil sales partner ANDI-BEC
  const andiPartner = await prisma.salesPartner.findUnique({
    where: { code: "ANDI-BEC" },
  });

  // 1. Lead 1: "Flash Gadget Antapani" (PRO, Closing by ANDI-BEC, Payment PENDING with proof)
  const lead1 = await prisma.store.upsert({
    where: { slug: "flashgadget" },
    update: {
      name: "Flash Gadget Antapani",
      tier: "PRO",
      planId: "PRO",
      whatsapp: "08122334455",
      address: "Jl. Terusan Jakarta No. 88, Antapani, Bandung",
      isActive: false,
      referredBySalesId: andiPartner ? andiPartner.id : null,
      salesUserId: andiPartner ? andiPartner.userId : null,
    },
    create: {
      name: "Flash Gadget Antapani",
      slug: "flashgadget",
      tier: "PRO",
      planId: "PRO",
      whatsapp: "08122334455",
      address: "Jl. Terusan Jakarta No. 88, Antapani, Bandung",
      isActive: false,
      templateId: "minimal-clean",
      referredBySalesId: andiPartner ? andiPartner.id : null,
      salesUserId: andiPartner ? andiPartner.userId : null,
    },
  });

  // Owner Lead 1
  await prisma.user.upsert({
    where: { email: "rian@flashgadget.com" },
    update: {
      name: "Rian Hidayat",
      storeId: lead1.id,
      role: "STORE_OWNER",
      phone: "08122334455",
      passwordHash,
    },
    create: {
      name: "Rian Hidayat",
      email: "rian@flashgadget.com",
      phone: "08122334455",
      role: "STORE_OWNER",
      storeId: lead1.id,
      passwordHash,
    },
  });

  // Payment Pending with proof for Lead 1
  const existingPay1 = await prisma.subscriptionPayment.findFirst({
    where: { storeId: lead1.id },
  });

  if (!existingPay1) {
    await prisma.subscriptionPayment.create({
      data: {
        storeId: lead1.id,
        planId: "PRO",
        tier: "PRO",
        amount: 600000,
        status: "PENDING",
        receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800",
        notes: "Transfer via Bank BCA untuk aktivasi paket Pro",
        createdAt: new Date(),
      },
    });
  }

  console.log(`✅ Lead 1 siap: "${lead1.name}" (${lead1.slug}) - Closing: ANDI-BEC, Payment PENDING`);

  // 2. Lead 2: "Sentra Ponsel Kiaracondong" (STARTER, Organik, Belum bayar)
  const lead2 = await prisma.store.upsert({
    where: { slug: "sentraponsel" },
    update: {
      name: "Sentra Ponsel Kiaracondong",
      tier: "STARTER",
      planId: "STARTER",
      whatsapp: "08571234567",
      address: "Jl. Ibrahim Adjie No. 120, Kiaracondong, Bandung",
      isActive: false,
      referredBySalesId: null,
      salesUserId: null,
    },
    create: {
      name: "Sentra Ponsel Kiaracondong",
      slug: "sentraponsel",
      tier: "STARTER",
      planId: "STARTER",
      whatsapp: "08571234567",
      address: "Jl. Ibrahim Adjie No. 120, Kiaracondong, Bandung",
      isActive: false,
      templateId: "default",
      referredBySalesId: null,
      salesUserId: null,
    },
  });

  // Owner Lead 2
  await prisma.user.upsert({
    where: { email: "dewi@sentraponsel.com" },
    update: {
      name: "Dewi Lestari",
      storeId: lead2.id,
      role: "STORE_OWNER",
      phone: "08571234567",
      passwordHash,
    },
    create: {
      name: "Dewi Lestari",
      email: "dewi@sentraponsel.com",
      phone: "08571234567",
      role: "STORE_OWNER",
      storeId: lead2.id,
      passwordHash,
    },
  });

  console.log(`✅ Lead 2 siap: "${lead2.name}" (${lead2.slug}) - Organik, Belum upload bukti`);

  // Ringkasan Leads
  const inactiveCount = await prisma.store.count({ where: { isActive: false } });
  console.log(`\n📊 Total Calon Klien di Pipeline (isActive: false): ${inactiveCount}`);
}

if (require.main === module) {
  seedLeads()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}

module.exports = { seedLeads };
