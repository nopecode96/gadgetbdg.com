import { requireSalesAgent } from "@/lib/auth/session";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allows SUPER_ADMIN, ADMIN_SAAS, and SALES_AGENT to access Super Admin section (with page-level specific views)
  await requireSalesAgent();

  return <>{children}</>;
}
