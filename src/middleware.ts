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
     * 5. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_static/|uploads/|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Normalize hostname (strip port if present)
  // e.g. "localhost:3001" -> "localhost", "store.gadgetbdg.com:3001" -> "store.gadgetbdg.com"
  const currentHost = hostname.split(":")[0].toLowerCase();
  const searchParams = req.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();

  // 1. Root domain / Apex domain or direct local preview (gadgetbdg.com, www.gadgetbdg.com, localhost, 127.0.0.1)
  const isMainDomain =
    currentHost === mainDomain ||
    currentHost === `www.${mainDomain}` ||
    currentHost === "localhost" ||
    currentHost === "127.0.0.1";

  if (isMainDomain) {
    // SaaS landing page, admin, super-admin handled directly under app/(saas), app/admin, app/super-admin
    return NextResponse.next();
  }

  // 2. Subdomain check (*.gadgetbdg.com)
  if (currentHost.endsWith(`.${mainDomain}`)) {
    const subdomain = currentHost.replace(`.${mainDomain}`, "").toLowerCase();

    // 2a. admin.gadgetbdg.com -> Super Admin SaaS Panel (/super-admin)
    if (subdomain === "admin" || subdomain === "super-admin" || subdomain === "superadmin") {
      return NextResponse.rewrite(new URL(`/super-admin${path}`, req.url));
    }

    // 2b. toko.gadgetbdg.com -> Admin Toko Merchant Panel (/admin)
    if (subdomain === "toko") {
      return NextResponse.rewrite(new URL(`/admin${path}`, req.url));
    }

    // 2c. www -> pass through ke root domain
    if (subdomain === "www") {
      return NextResponse.next();
    }

    // 2d. Cegah akses reserved slugs lain menimpa store view
    if (isReservedSlug(subdomain)) {
      return NextResponse.next();
    }

    // 2e. Storefront Toko Merchant: [slug].gadgetbdg.com -> /[store]/...
    return NextResponse.rewrite(new URL(`/${subdomain}${path}`, req.url));
  }

  // 3. Custom Domain (e.g. tokoberkahbandung.com)
  // Rewrite to custom-domain dynamic route: /custom-domain/[domain]/...
  return NextResponse.rewrite(new URL(`/custom-domain/${currentHost}${path}`, req.url));
}

