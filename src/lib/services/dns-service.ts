import { promises as dns } from "dns";

export interface VerifyDnsResult {
  success: boolean;
  cleanDomain: string;
  resolvedIps: string[];
  resolvedCnames?: string[];
  isMatched: boolean;
  matchType?: "A" | "CNAME";
  message: string;
}

/**
 * Verifikasi apakah DNS Record (A Record atau CNAME) domain mengarah ke server platform
 */
export async function verifyDomainDns(
  domain: string,
  targetIp: string = process.env.SERVER_IPV4 || "72.62.75.149"
): Promise<VerifyDnsResult> {
  const cleanDomain = domain
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "");

  if (!cleanDomain || cleanDomain.length < 3 || !cleanDomain.includes(".")) {
    return {
      success: false,
      cleanDomain,
      resolvedIps: [],
      isMatched: false,
      message: "Format nama domain tidak valid.",
    };
  }

  // Resolver independen menggunakan DNS publik Cloudflare & Google
  try {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  } catch (e) {
    // Abaikan jika tidak diizinkan di runtime tertentu
  }

  const resolvedIps: string[] = [];
  const resolvedCnames: string[] = [];

  // 1. Cek A Record
  try {
    const ips = await dns.resolve4(cleanDomain);
    if (Array.isArray(ips)) {
      resolvedIps.push(...ips);
    }
  } catch (err: any) {
    // Not found or no A record
  }

  // Periksa apakah targetIp ada di A Record
  if (resolvedIps.includes(targetIp)) {
    return {
      success: true,
      cleanDomain,
      resolvedIps,
      isMatched: true,
      matchType: "A",
      message: `A Record terverifikasi! Domain ${cleanDomain} telah mengarah ke server ${targetIp}.`,
    };
  }

  // 2. Cek CNAME Record (misal: www atau subdomain mengarah ke platform)
  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();
  try {
    const cnames = await dns.resolveCname(cleanDomain);
    if (Array.isArray(cnames)) {
      resolvedCnames.push(...cnames.map((c) => c.toLowerCase().replace(/\.$/, "")));
    }
  } catch (err: any) {
    // No CNAME record
  }

  const hasCnameMatch = resolvedCnames.some(
    (c) => c === mainDomain || c.endsWith(`.${mainDomain}`)
  );

  if (hasCnameMatch) {
    return {
      success: true,
      cleanDomain,
      resolvedIps,
      resolvedCnames,
      isMatched: true,
      matchType: "CNAME",
      message: `CNAME terverifikasi! Domain ${cleanDomain} telah diarahkan ke ${mainDomain}.`,
    };
  }

  // Jika ada IP tapi tidak cocok dengan IP target
  if (resolvedIps.length > 0) {
    return {
      success: false,
      cleanDomain,
      resolvedIps,
      resolvedCnames,
      isMatched: false,
      message: `Domain mengarah ke IP [${resolvedIps.join(", ")}], bukan IP server tujuan (${targetIp}). Mohon periksa kembali DNS Management Anda.`,
    };
  }

  // Jika belum ada A Record atau CNAME terbaca sama sekali
  return {
    success: false,
    cleanDomain,
    resolvedIps: [],
    resolvedCnames: [],
    isMatched: false,
    message: `DNS belum terdeteksi atau sedang dalam proses propagasi global. Pastikan A Record mengarah ke ${targetIp} atau CNAME ke ${mainDomain}.`,
  };
}
