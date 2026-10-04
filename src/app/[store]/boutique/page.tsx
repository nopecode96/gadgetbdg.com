import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isTenantHost } from "@/lib/product-slug";

interface BoutiquePageProps {
  params: Promise<{ store: string }> | { store: string };
}

export default async function BoutiquePage({ params }: BoutiquePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").trim();

  const headersList = headers();
  const host = headersList.get("host") || "";
  const tenantHost = isTenantHost(host);

  if (tenantHost) {
    redirect("/?tab=about");
  } else {
    redirect(`/${storeSlug}?tab=about`);
  }
}
