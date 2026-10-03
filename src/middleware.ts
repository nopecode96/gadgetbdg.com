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
  "/sales",
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
  if (currentHost === mainDomain || currentHost === "localhost" || currentHost === "127.0.0.1") {
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
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 0.5: Protected Route Auth Guard (Middleware-level)
  // Ensures unauthenticated users cannot access /admin or /super-admin via browser back/forward cache.
  // ─────────────────────────────────────────────────────────────────────────
  const hasSession = req.cookies.has("gb_session");
  const isProtectedAdminRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/sales");

  if (isProtectedAdminRoute && !hasSession) {
    const loginTarget = pathname.startsWith("/super-admin")
      ? "/login?role=super_admin"
      : "/login";
    const response = NextResponse.redirect(new URL(loginTarget, req.url));
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Detect Root Domain / Apex or Direct Localhost Access
  // ─────────────────────────────────────────────────────────────────────────
  const isApexOrLocalApex =
    currentHost === mainDomain ||
    currentHost === `www.${mainDomain}` ||
    currentHost === "localhost" ||
    currentHost === "127.0.0.1";

  if (isApexOrLocalApex) {
    // Sajikan landing page utama, pricing, modal pendaftaran, dan rute /login
    const res = NextResponse.next();
    if (isProtectedAdminRoute) {
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.headers.set("Pragma", "no-cache");
      res.headers.set("Expires", "0");
    }
    return res;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Subdomain Extraction (Production *.gadgetbdg.com & Local *.localhost)
  // ─────────────────────────────────────────────────────────────────────────
  let subdomain: string | null = null;
  if (currentHost.endsWith(`.${mainDomain}`)) {
    subdomain = currentHost.replace(`.${mainDomain}`, "").toLowerCase();
  } else if (currentHost.endsWith(".localhost")) {
    subdomain = currentHost.replace(".localhost", "").toLowerCase();
  }

  if (subdomain) {
    // 2a. www subdomain -> Pass through to root domain
    if (subdomain === "www") {
      return NextResponse.next();
    }

    // 2b. Super Admin Subdomain (admin.gadgetbdg.com / admin.localhost)
    if (subdomain === "admin" || subdomain === "super-admin" || subdomain === "superadmin") {
      if (isReservedAppPath(pathname) && !pathname.startsWith("/super-admin")) {
        return NextResponse.next();
      }

      let targetPath = pathname;
      if (!targetPath.startsWith("/super-admin")) {
        targetPath = targetPath === "/" ? "/super-admin" : `/super-admin${targetPath}`;
      }
      const targetQuery = searchParams.length > 0 ? `?${searchParams}` : "";

      const res = NextResponse.rewrite(new URL(`${targetPath}${targetQuery}`, req.url));
      if (isProtectedAdminRoute) {
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.headers.set("Pragma", "no-cache");
        res.headers.set("Expires", "0");
      }
      return res;
    }

    // 2c. Reserved platform subdomains (api, billing, etc.)
    if (isReservedSlug(subdomain)) {
      return NextResponse.next();
    }

    // 2d. Store Tenant Subdomain ([slug].gadgetbdg.com / [slug].localhost)
    // Create new request headers with x-store-slug injected
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-store-slug", subdomain);

    // If accessing merchant admin panel on tenant subdomain (/admin or /[slug]/admin)
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const res = NextResponse.rewrite(new URL(`${pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`, req.url), {
        request: {
          headers: requestHeaders,
        },
      });
      if (isProtectedAdminRoute) {
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.headers.set("Pragma", "no-cache");
        res.headers.set("Expires", "0");
      }
      return res;
    }

    // If reserved app path like /login, pass through with headers
    if (isReservedAppPath(pathname)) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Default tenant root & pages -> rewrite to storefront (/[store-slug]/...)
    const storefrontTarget = `/${subdomain}${path}`;
    return NextResponse.rewrite(new URL(storefrontTarget, req.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Custom Domain (e.g. tokoberkahbandung.com)
  // ─────────────────────────────────────────────────────────────────────────
  if (isReservedAppPath(pathname)) {
    return NextResponse.next();
  }

  // Rewrite to custom-domain dynamic route: /custom-domain/[domain]/...
  return NextResponse.rewrite(new URL(`/custom-domain/${currentHost}${path}`, req.url));
}
