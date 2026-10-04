/**
 * Utility for SEO-friendly product URLs and multi-tenant routing.
 * Format: [slugified-title]-[shortId]
 * Example: iphone-14-pro-max-256gb-deep-purple-cmuslc2i
 */

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics/accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, "") // remove leading & trailing hyphens
    .slice(0, 75); // reasonable slug length limit
}

export function generateProductSlug(titleOrName: string, id: string): string {
  const base = slugify(titleOrName || "unit-hp") || "unit-hp";
  const shortId = id.length > 8 ? id.slice(0, 8) : id;
  return `${base}-${shortId}`;
}

/**
 * Checks whether the current browser host or given host is a tenant host
 * (tenant subdomain like demo2.gadgetbdg.com / demo2.localhost, or custom domain).
 */
export function isTenantHost(hostname?: string): boolean {
  let host = hostname;
  if (!host && typeof window !== "undefined") {
    host = window.location.hostname;
  }
  if (!host) return false;

  host = host.split(":")[0].toLowerCase();
  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();

  // Root platform domains
  if (
    host === mainDomain ||
    host === `www.${mainDomain}` ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return false;
  }

  // Any subdomain (*.gadgetbdg.com, *.localhost) or custom domain
  return true;
}

/**
 * Generates the canonical relative URL for a product.
 * In a tenant host (subdomain / custom domain), returns `/product/${slug}`.
 * In root platform domain, returns `/${storeSlug}/product/${slug}`.
 */
export function getProductDetailUrl(
  storeSlug: string,
  product: { id: string; slug?: string | null; title?: string | null; name?: string | null },
  forceTenantHost?: boolean
): string {
  const resolvedSlug =
    product.slug && product.slug.trim() !== ""
      ? product.slug.trim()
      : generateProductSlug(product.title || product.name || "unit-hp", product.id);

  const onTenant = forceTenantHost !== undefined ? forceTenantHost : isTenantHost();

  if (onTenant) {
    return `/product/${resolvedSlug}`;
  }

  return `/${storeSlug}/product/${resolvedSlug}`;
}

/**
 * Extracts possible lookup criteria from a product URL identifier.
 * An identifier might be:
 * 1. A raw CUID: "cmusl5cm90006oa5lxd8wqnkn"
 * 2. An SEO slug with short ID suffix: "iphone-15-pro-max-256gb-cmusl5cm"
 * 3. A pure slug: "iphone-15-pro-max-256gb"
 */
export function extractProductLookup(identifier: string): {
  rawId: string | null;
  shortId: string | null;
  slug: string;
} {
  const trimmed = (identifier || "").trim();
  if (!trimmed) {
    return { rawId: null, shortId: null, slug: "" };
  }

  // Check if it's a raw CUID (typically starts with 'c' followed by 20-30 alphanumeric characters)
  const isCuid = /^c[a-z0-9]{20,32}$/i.test(trimmed);
  if (isCuid) {
    return {
      rawId: trimmed,
      shortId: trimmed.slice(0, 8),
      slug: trimmed,
    };
  }

  // Check for short ID suffix at end of slug: -[shortId] (6 to 12 alphanumeric chars)
  const lastHyphen = trimmed.lastIndexOf("-");
  if (lastHyphen !== -1 && lastHyphen < trimmed.length - 1) {
    const candidateShortId = trimmed.slice(lastHyphen + 1);
    if (/^[a-z0-9]{6,12}$/i.test(candidateShortId)) {
      return {
        rawId: null,
        shortId: candidateShortId,
        slug: trimmed,
      };
    }
  }

  return {
    rawId: null,
    shortId: null,
    slug: trimmed,
  };
}
