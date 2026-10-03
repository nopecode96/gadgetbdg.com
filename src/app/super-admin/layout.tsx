import { requireSaasAdmin } from "@/lib/auth/session";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only SUPER_ADMIN and ADMIN_SAAS can access the Super Admin section
  await requireSaasAdmin();

  return <>{children}</>;
}
