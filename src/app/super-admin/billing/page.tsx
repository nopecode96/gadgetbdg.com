import { prisma } from "@/lib/prisma";
import { SuperAdminNav } from "@/components/admin/SuperAdminNav";
import { BillingManagerClient } from "./BillingManagerClient";

export const revalidate = 0;

export default async function SuperAdminBillingPage() {
  const paymentsRaw = await prisma.subscriptionPayment.findMany({
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          whatsapp: true,
          salesUser: {
            select: { id: true, name: true, referralCode: true },
          },
        },
      },
      commissions: {
        select: { id: true, amount: true, status: true },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDING first (alphabetically)
      { createdAt: "desc" },
    ],
  });

  // Serialize dates
  const payments = paymentsRaw.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <SuperAdminNav />
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <BillingManagerClient initialPayments={payments as any} />
      </main>
    </div>
  );
}
