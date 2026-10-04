import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ store: string }> | { store: string };
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ store: string }> | { store: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").trim();

  if (!storeSlug) {
    return {
      icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
      },
    };
  }

  const store = await prisma.store.findFirst({
    where: {
      slug: {
        equals: storeSlug,
        mode: "insensitive",
      },
    },
    select: {
      name: true,
      logoUrl: true,
    },
  });

  const iconUrl = store?.logoUrl || "/icon.png";
  const appleIconUrl = store?.logoUrl || "/apple-icon.png";

  return {
    icons: {
      icon: iconUrl,
      apple: appleIconUrl,
    },
  };
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
