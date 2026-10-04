import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

interface CustomDomainLayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }> | { domain: string };
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }> | { domain: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const cleanDomain = (resolvedParams?.domain || "").toLowerCase().trim();

  if (!cleanDomain) {
    return {
      icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
      },
    };
  }

  const store = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: cleanDomain,
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

export default function CustomDomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
