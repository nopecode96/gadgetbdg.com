import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { AdminsManagerClient } from "./AdminsManagerClient";

export const revalidate = 0;

export default async function SuperAdminStaffPage() {
  const adminsRaw = await prisma.user.findMany({
    where: {
      role: {
        in: ["SUPER_ADMIN", "ADMIN_SAAS", "SALES_AGENT"],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const admins = adminsRaw.map((a) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role as "SUPER_ADMIN" | "ADMIN_SAAS" | "SALES_AGENT",
    referralCode: a.referralCode,
    bankName: a.bankName,
    bankNumber: a.bankNumber,
    bankHolder: a.bankHolder,
    createdAt: a.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />

      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <AdminsManagerClient initialAdmins={admins} />
      </main>
    </div>
  );
}
