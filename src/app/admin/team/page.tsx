import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { TeamManagerClient } from "./TeamManagerClient";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function AdminTeamPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store, user, limits } = ctx;

  // Team management is owner-only
  if (user.role !== "STORE_OWNER") {
    redirect("/admin");
  }

  const storeWithUsers = await prisma.store.findUnique({
    where: { id: store.id },
    include: {
      users: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!storeWithUsers) redirect("/admin");

  const users = storeWithUsers.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "STORE_OWNER" | "STORE_STAFF",
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <TeamManagerClient
        storeId={store.id}
        storeName={store.name}
        tier={store.tier as "STARTER" | "PRO" | "ADVANCE"}
        initialUsers={users}
      />
    </div>
  );
}
