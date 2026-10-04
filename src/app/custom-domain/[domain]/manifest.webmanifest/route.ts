import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTemplateConfig } from "@/lib/constants/templates";
import { resolveHexColor } from "@/lib/pwa-utils";

interface RouteContext {
  params: Promise<{ domain: string }> | { domain: string };
}

export async function GET(request: Request, context: RouteContext) {
  const resolvedParams = await Promise.resolve(context.params);
  const rawDomain = resolvedParams?.domain;
  const cleanDomain = (rawDomain || "").toLowerCase().trim();

  if (!cleanDomain) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const store = await prisma.store.findFirst({
    where: {
      customDomain: {
        equals: cleanDomain,
        mode: "insensitive",
      },
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      templateId: true,
      logoUrl: true,
      primaryColor: true,
    },
  });

  if (!store) {
    return new NextResponse("Store Not Found", { status: 404 });
  }

  const themeConfig = getTemplateConfig(store.templateId || "clean-ledger");

  // Determine background color
  const defaultBg = themeConfig.colors.isDark ? "#09090b" : "#ffffff";
  const backgroundColor = resolveHexColor(themeConfig.colors.bgMain, defaultBg);

  // Determine theme color
  const defaultTheme = themeConfig.colors.isDark ? "#000000" : "#0f172a";
  const themeColor = store.primaryColor?.startsWith("#")
    ? store.primaryColor
    : resolveHexColor(themeConfig.colors.accent || themeConfig.colors.bgContainer, defaultTheme);

  // Short name: max 12 characters
  const shortName = store.name.length <= 12 ? store.name : (store.slug || store.name.slice(0, 12));

  // Icons array with store logo or fallback
  const iconUrl = store.logoUrl || "/icons/icon-192.png";
  const icon512Url = store.logoUrl || "/icons/icon-512.png";
  const isSvg = iconUrl.toLowerCase().endsWith(".svg");
  const isJpg = iconUrl.toLowerCase().endsWith(".jpg") || iconUrl.toLowerCase().endsWith(".jpeg");
  const isWebp = iconUrl.toLowerCase().endsWith(".webp");
  const iconType = isSvg ? "image/svg+xml" : isJpg ? "image/jpeg" : isWebp ? "image/webp" : "image/png";

  const manifest = {
    name: store.name,
    short_name: shortName,
    description: `Katalog unit HP second bergaransi & siap COD di ${store.name}`,
    start_url: "/?utm_source=pwa",
    display: "standalone",
    background_color: backgroundColor,
    theme_color: themeColor,
    icons: [
      {
        src: iconUrl,
        sizes: isSvg ? "any" : "192x192",
        type: iconType,
        purpose: "any maskable",
      },
      {
        src: icon512Url,
        sizes: isSvg ? "any" : "512x512",
        type: iconType,
        purpose: "any maskable",
      },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
