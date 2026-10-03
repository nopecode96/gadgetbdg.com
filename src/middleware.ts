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
 * rewritten to a storefront or panel prefix by the subdomain/path logic.
 *
 * This prevents the redirect-loop bug where:
 *   1. toko.gadgetbdg.com/ → middleware rewrites to /admin
 *   2. /admin page redirects unauthenticated users to /login
 *   3. middleware catches the /login redirect and rewrites it to /admin/login → 404
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
    (reserved) =>
      pathname === reserved ||
      pathname.startsWith(reserved + "/") ||
      pathname.startsWith(reserved + "?")
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

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 0: Handle legacy/convenience path prefixes on the main domain/localhost.
  //
  // Problem: On localhost, users may type /toko/login or /toko/admin/* expecting
  // to reach the merchant admin panel. Since there's no real "toko" store slug
  // in the DB these paths hit the [store] dynamic route and return 404.
  //
  // Solution: Intercept these paths and redirect them to the canonical routes:
  //   /toko            → /login
  //   /toko/login      → /login
  //   /toko/register   → /register
  //   /toko/admin/...  → /admin/...
  //   /toko/*          → /admin/* (catch-all for other toko sub-paths)
  // ─────────────────────────────────────────────────────────────────────────
  if (pathname === "/toko" || pathname === "/toko/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname === "/toko/register") {
    return NextResponse.redirect(new URL("/register", req.url));
  }
  if (pathname.startsWith("/toko/admin")) {
    const targetPath = pathname.replace("/toko/admin", "/admin");
    const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";
    return NextResponse.redirect(new URL(`${targetPath}${targetQuery}`, req.url));
  }
  if (pathname.startsWith("/toko/")) {
    // Catch-all: /toko/anything → /admin/anything (for dashboard sub-pages)
    const targetPath = pathname.replace("/toko/", "/admin/");
    const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";
    return NextResponse.redirect(new URL(`${targetPath}${targetQuery}`, req.url));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Main domain / Apex domain or direct local access
  //         (gadgetbdg.com, www.gadgetbdg.com, localhost, 127.0.0.1)
  // ─────────────────────────────────────────────────────────────────────────
  const isMainDomain =
    currentHost === mainDomain ||
    currentHost === `www.${mainDomain}` ||
    currentHost === "localhost" ||
    currentHost === "127.0.0.1";

  if (isMainDomain) {
    // All internal routes (SaaS landing, /login, /admin, /super-admin, storefronts)
    // are handled directly by the Next.js App Router — just pass through.
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Subdomain routing (*.gadgetbdg.com)
  // ─────────────────────────────────────────────────────────────────────────
  if (currentHost.endsWith(`.${mainDomain}`)) {
    const subdomain = currentHost.replace(`.${mainDomain}`, "").toLowerCase();

    // 2a. admin.gadgetbdg.com / super-admin.gadgetbdg.com → Super Admin Panel (/super-admin)
    if (subdomain === "admin" || subdomain === "super-admin" || subdomain === "superadmin") {
      // GUARD: reserved paths (login, api, _next…) pass through as-is to avoid rewrite loops
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

    // 2b. toko.gadgetbdg.com → Merchant Admin Panel (/admin)
    if (subdomain === "toko") {
      // GUARD: reserved paths pass through as-is.
      // Specifically prevents: /admin → 307 /login → rewrite /admin/login → 404
      if (isReservedAppPath(pathname)) {
        return NextResponse.next();
      }
      // Root "/" on toko subdomain → redirect to /login (cleaner UX than blank admin redirect)
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      let targetPath = pathname;
      if (!targetPath.startsWith("/admin")) {
        targetPath = `/admin${targetPath}`;
      }
      const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";
      return NextResponse.rewrite(new URL(`${targetPath}${targetQuery}`, req.url));
    }

    // 2c. www.gadgetbdg.com → pass through to root domain
    if (subdomain === "www") {
      return NextResponse.next();
    }

    // 2d. Any other reserved subdomain → pass through (don't let it match a store)
    if (isReservedSlug(subdomain)) {
      return NextResponse.next();
    }

    // 2e. GUARD: Reserved app paths on any store subdomain pass through directly
    //     (e.g. berkahcell.gadgetbdg.com/login → /login, not /berkahcell/login)
    if (isReservedAppPath(pathname)) {
      return NextResponse.next();
    }

    // 2f. Storefront: [slug].gadgetbdg.com → /[store]/...
    return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Custom Domain (e.g. tokoberkahbandung.com)
  // ─────────────────────────────────────────────────────────────────────────
  // GUARD: Reserved app paths on custom domains are served directly.
  if (isReservedAppPath(pathname)) {
    return NextResponse.next();
  }

  // Rewrite to custom-domain dynamic route: /custom-domain/[domain]/...
  return NextResponse.rewrite(new URL(`/custom-domain/${currentHost}${path}`, req.url));
}
