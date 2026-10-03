import { NextRequest, NextResponse } from "next/server";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. /uploads (uploaded user media served by nginx/static)
     * 5. all root static files inside /public (e.g. /favicon.ico) - except manifest.webmanifest
     */
    "/((?!api/|_next/|_static/|uploads/|(?!manifest\\.webmanifest)[\\w-]+\\.\\w+).*)",
  ],
};

/**
 * Paths that belong to the internal platform application and must NEVER be
 * rewritten to a storefront or another panel prefix by the subdomain logic.
 *
 * This prevents the redirect-loop bug where:
 *   1. toko.gadgetbdg.com/ → middleware rewrites to /admin
 *   2. /admin page redirects unauthenticated users to /login
 *   3. middleware catches the /login redirect and rewrites it to /admin/login
 *   4. /admin/login does not exist → 404
 *
 * Any path that starts with one of these prefixes is passed through as-is.
 */
const RESERVED_APP_PATHS = [
  "/login",
  "/register",
  "/admin",
  "/super-admin",
  "/billing-suspended",
  "/api",
  "/_next",
  "/_static",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap",
];

function isReservedAppPath(pathname: string): boolean {
  return RESERVED_APP_PATHS.some(
    (reserved) => pathname === reserved || pathname.startsWith(reserved + "/") || pathname.startsWith(reserved + "?")
  );
}

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Normalize hostname (strip port if present)
  // e.g. "localhost:3001" -> "localhost", "store.gadgetbdg.com:3001" -> "store.gadgetbdg.com"
  const currentHost = hostname.split(":")[0].toLowerCase();
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;
  const pathname = url.pathname;

  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();

  // 1. Root domain / Apex domain or direct local preview (gadgetbdg.com, www.gadgetbdg.com, localhost, 127.0.0.1)
  const isMainDomain =
    currentHost === mainDomain ||
    currentHost === `www.${mainDomain}` ||
    currentHost === "localhost" ||
    currentHost === "127.0.0.1";

  if (isMainDomain) {
    // SaaS landing page, admin, super-admin, login handled directly under
    // app/(saas), app/admin, app/super-admin, app/login — pass through.
    return NextResponse.next();
  }

  // 2. Subdomain check (*.gadgetbdg.com)
  if (currentHost.endsWith(`.${mainDomain}`)) {
    const subdomain = currentHost.replace(`.${mainDomain}`, "").toLowerCase();

    // 2a. admin.gadgetbdg.com -> Super Admin SaaS Panel (/super-admin)
    if (subdomain === "admin" || subdomain === "super-admin" || subdomain === "superadmin") {
      // GUARD: If the path is already a reserved app path (login, api, _next…)
      // do NOT rewrite — let Next.js serve the actual route directly.
      if (isReservedAppPath(pathname)) {
        return NextResponse.next();
      }

      let targetPath = pathname;
      if (!targetPath.startsWith("/super-admin")) {
        targetPath = targetPath === "/" ? "/super-admin" : `/super-admin${targetPath}`;
      }
      const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";
      return NextResponse.rewrite(new URL(`${targetPath}${targetQuery}`, req.url));
    }

    // 2b. toko.gadgetbdg.com -> Admin Toko Merchant Panel (/admin)
    if (subdomain === "toko") {
      // GUARD: If the path is already a reserved app path (login, api, _next…)
      // do NOT rewrite — let Next.js serve the actual route directly.
      // This prevents the redirect-loop: /admin -> 307 /login -> rewrite /admin/login -> 404
      if (isReservedAppPath(pathname)) {
        return NextResponse.next();
      }

      let targetPath = pathname;
      if (!targetPath.startsWith("/admin")) {
        targetPath = targetPath === "/" ? "/admin" : `/admin${targetPath}`;
      }
      const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";
      return NextResponse.rewrite(new URL(`${targetPath}${targetQuery}`, req.url));
    }

    // 2c. www -> pass through ke root domain
    if (subdomain === "www") {
      return NextResponse.next();
    }

    // 2d. Cegah akses reserved slugs lain menimpa store view
    if (isReservedSlug(subdomain)) {
      return NextResponse.next();
    }

    // 2e. GUARD: If accessing a reserved app path on a store subdomain,
    // serve the app path directly (e.g. berkahcell.gadgetbdg.com/login → /login)
    if (isReservedAppPath(pathname)) {
      return NextResponse.next();
    }

    // 2f. Storefront Toko Merchant: [slug].gadgetbdg.com -> /[store]/...
    return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
  }

  // 3. Custom Domain (e.g. tokoberkahbandung.com)
  // GUARD: Reserved app paths on custom domains pass through directly.
  if (isReservedAppPath(pathname)) {
    return NextResponse.next();
  }

  // Rewrite to custom-domain dynamic route: /custom-domain/[domain]/...
  return NextResponse.rewrite(new URL(`/custom-domain/${currentHost}${path}`, req.url));
}
