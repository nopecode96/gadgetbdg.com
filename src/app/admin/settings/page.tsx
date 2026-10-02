import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/admin/AdminNav";
import { SettingsClient } from "./SettingsClient";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const stores = await prisma.store.findMany({
    orderBy: { createdAt: "asc" },
  });

  const activeStore = stores[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNav currentSlug={activeStore?.slug} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <SettingsClient store={activeStore} />
      </main>
    </div>
  );
}
