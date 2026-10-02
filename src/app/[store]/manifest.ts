import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function manifest({
  params,
}: {
  params: Promise<{ store: string }> | { store: string };
}): Promise<MetadataRoute.Manifest> {
  const resolvedParams = await Promise.resolve(params);
  const storeSlug = (resolvedParams?.store || "").toLowerCase().trim();

  const store = storeSlug
    ? await prisma.store.findUnique({
        where: { slug: storeSlug },
      })
    : null;

  const isDark = store?.templateId === "dark-gaming";
  const name = store?.name || "Toko HP GadgetBdg";
  const shortName = store?.slug || "gadgetbdg";
  const themeColor = store?.primaryColor || (isDark ? "#10b981" : "#2563eb");
  const backgroundColor = isDark ? "#090d16" : "#ffffff";

  return {
    name,
    short_name: shortName,
    description: `Katalog HP Second & Trade-In Resmi ${name}`,
    start_url: `/${shortName}`,
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: store?.logoUrl || "/favicon.ico",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: store?.logoUrl || "/favicon.ico",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
