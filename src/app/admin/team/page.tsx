import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { TeamManagerClient } from "./TeamManagerClient";
import { notFound } from "next/navigation";

export const revalidate = 0;

// Demo: storeId statis untuk /berkahcell. Dalam implementasi full,
// storeId diambil dari session/cookie JWT. Untuk sekarang gunakan
// store pertama sebagai representasi demo admin login.
const DEMO_STORE_SLUG = "berkahcell";

export default async function AdminTeamPage() {
  const store = await prisma.store.findUnique({
    where: { slug: DEMO_STORE_SLUG },
    include: {
      users: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!store) return notFound();

  const users = store.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "STORE_OWNER" | "STORE_STAFF",
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav currentSlug={store.slug} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <TeamManagerClient
          storeId={store.id}
          storeName={store.name}
          tier={store.tier as "STARTER" | "PRO" | "ADVANCE"}
          initialUsers={users}
        />
      </main>
    </div>
  );
}
