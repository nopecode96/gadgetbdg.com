/**
 * Daftar Subdomain yang Dilindungi Sistem (Reserved Subdomains).
 * Subdomain ini dilarang didaftarkan oleh merchant untuk mencegah collision
 * dengan routing platform, panel manajemen internal, dan endpoint infrastruktur.
 */
export const RESERVED_SLUGS: readonly string[] = [
  // Platform & Internal Admin
  "admin",
  "super-admin",
  "superadmin",
  "dashboard",
  "portal",
  "panel",
  "manage",
  "internal",

  // Core System & API
  "api",
  "app",
  "dev",
  "stage",
  "staging",
  "test",
  "demo",
  "preview",
  "system",
  "root",
  "mail",
  "email",
  "smtp",
  "ftp",
  "ns1",
  "ns2",
  "dns",
  "cdn",
  "assets",
  "static",
  "media",
  "images",
  "files",

  // Business & Account
  "billing",
  "pay",
  "payment",
  "checkout",
  "account",
  "auth",
  "login",
  "signin",
  "register",
  "signup",
  "subscribe",
  "settings",
  "profile",

  // Platform Branding & Legal
  "gadgetbdg",
  "gadget-bdg",
  "official",
  "support",
  "help",
  "status",
  "docs",
  "custom-domain",
  "www",
] as const;

const RESERVED_SLUGS_SET = new Set<string>(RESERVED_SLUGS.map((s) => s.toLowerCase()));

/**
 * Memeriksa apakah slug / subdomain termasuk dalam daftar yang dilindungi sistem.
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return true;
  const normalized = slug.toLowerCase().trim();
  return RESERVED_SLUGS_SET.has(normalized);
}
