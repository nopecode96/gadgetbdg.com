const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetPasswords() {
  console.log("🔒 Starting password reset & demo accounts synchronization...");
  const targetPassword = "Admin123!";
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(targetPassword, saltRounds);

  // 1. Super Admin: admin@gadgetbdg.com
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@gadgetbdg.com" },
    update: {
      passwordHash,
      role: "SUPER_ADMIN",
      name: "Super Admin GadgetBdg",
    },
    create: {
      email: "admin@gadgetbdg.com",
      passwordHash,
      name: "Super Admin GadgetBdg",
      phone: "6281122334455",
      role: "SUPER_ADMIN",
      storeId: null,
    },
  });
  console.log(`✅ Super Admin synced: ${superAdmin.email} (Role: ${superAdmin.role})`);

  // Ensure superadmin@gadgetbdg.com also updated if exists
  await prisma.user.updateMany({
    where: { email: "superadmin@gadgetbdg.com" },
    data: { passwordHash },
  });

  // Helper for demo store owners
  async function syncStoreOwner(slug, email, ownerName, phone = "6281234567890") {
    const store = await prisma.store.findUnique({
      where: { slug },
    });

    if (!store) {
      console.warn(`⚠️ Store with slug "${slug}" not found in DB!`);
      return null;
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        storeId: store.id,
        role: "STORE_OWNER",
        name: ownerName,
      },
      create: {
        email,
        passwordHash,
        name: ownerName,
        phone,
        role: "STORE_OWNER",
        storeId: store.id,
      },
    });

    console.log(`✅ Store Owner synced: ${user.email} -> Store: "${store.name}" (${slug})`);
    return user;
  }

  // 2. Berkah Cell: demo@berkacell.com (also support demo@berkahcell.com)
  await syncStoreOwner("berkahcell", "demo@berkacell.com", "Owner Berkah Cell Gadget", "6281234567890");
  // Also sync demo@berkahcell.com just in case
  await syncStoreOwner("berkahcell", "demo@berkahcell.com", "Owner Berkah Cell Gadget", "6281234567890");

  // 3. Gamers Gadget: demo@gamersgadget.com
  await syncStoreOwner("gamersgadget", "demo@gamersgadget.com", "Owner Gamers Gadget Bandung", "6281234567891");

  // 4. Other Demo Stores: tokyostreet, cybercell, goldcell
  await syncStoreOwner("tokyostreet", "demo@tokyostreet.com", "Owner Tokyo Street Cell", "6281234567892");
  await syncStoreOwner("cybercell", "demo@cybercell.com", "Owner Cyber Telemetry Cell", "6281234567893");
  await syncStoreOwner("goldcell", "demo@goldcell.com", "Owner Midnight Gold Concierge", "6281234567894");

  // 5. Update ALL existing users to have the uniform password hash
  const updateAllResult = await prisma.user.updateMany({
    data: {
      passwordHash,
    },
  });
  console.log(`✅ Set password to "${targetPassword}" for all ${updateAllResult.count} user accounts in database.`);

  // Print all users summary
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      store: {
        select: {
          slug: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log("\n=======================================================");
  console.log("📋 DAFTAR KREDENSIAL TERVERIFIKASI (PASSWORD: Admin123!):");
  console.log("=======================================================");
  allUsers.forEach((u, idx) => {
    const storeInfo = u.store ? `[Store: ${u.store.slug} - ${u.store.name}]` : "[Platform Internal]";
    console.log(`${idx + 1}. ${u.email.padEnd(28)} | Role: ${u.role.padEnd(12)} | ${storeInfo}`);
  });
  console.log("=======================================================\n");
}

if (require.main === module) {
  resetPasswords()
    .catch((err) => {
      console.error("❌ Error resetting passwords:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { resetPasswords };
