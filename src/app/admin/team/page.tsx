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

  const [storeWithUsers, branches] = await Promise.all([
    prisma.store.findUnique({
      where: { id: store.id },
      include: {
        users: {
          include: {
            branch: {
              select: { id: true, name: true, isMain: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.branch.findMany({
      where: { storeId: store.id },
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      select: { id: true, name: true, isMain: true },
    }),
  ]);

  if (!storeWithUsers) redirect("/admin");

  const users = storeWithUsers.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "STORE_OWNER" | "STORE_STAFF",
    branchId: u.branchId,
    branch: u.branch ? { id: u.branch.id, name: u.branch.name, isMain: u.branch.isMain } : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <TeamManagerClient
        storeId={store.id}
        storeName={store.name}
        tier={store.tier as "STARTER" | "PRO" | "ADVANCE"}
        initialUsers={users}
        branches={branches}
      />
    </div>
  );
}
