import { redirect } from "next/navigation";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { BranchManagerClient } from "./BranchManagerClient";

export const revalidate = 0;

export default async function AdminBranchesPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store, user } = ctx;

  // Branch management is owner-only
  if (user.role !== "STORE_OWNER") {
    redirect("/admin");
  }

  const branches = await prisma.branch.findMany({
    where: { storeId: store.id },
    include: {
      _count: {
        select: {
          products: true,
          users: true,
        },
      },
    },
    orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
  });

  const serializedBranches = branches.map((b) => ({
    id: b.id,
    storeId: b.storeId,
    name: b.name,
    address: b.address,
    phone: b.phone ?? null,
    mapsUrl: b.mapsUrl ?? null,
    isMain: Boolean(b.isMain),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    _count: {
      products: b._count.products,
      users: b._count.users,
    },
  }));

  const serializedStore = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    tier: store.tier,
    address: store.address,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <BranchManagerClient
        store={serializedStore}
        initialBranches={serializedBranches}
      />
    </div>
  );
}
