"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff, requireSaasAdmin } from "@/lib/auth/session";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
import { verifyDomainDns, VerifyDnsResult } from "@/lib/services/dns-service";

export interface CustomDomainItem {
  id: string;
  name: string;
  slug: string;
  customDomain: string;
  customDomainStatus: string;
  customDomainVerifiedAt: string | null;
  customDomainDnsType: string;
  tier: string;
  whatsapp: string;
  createdAt: string;
}

export interface StoreWithoutDomainItem {
  id: string;
  name: string;
  slug: string;
  tier: string;
  whatsapp: string;
}

export interface CustomDomainsOverviewData {
  totalRegistered: number;
  verifiedCount: number;
  pendingSetupCount: number;
  registeredStores: CustomDomainItem[];
  storesWithoutDomain: StoreWithoutDomainItem[];
  serverIp: string;
  cnameTarget: string;
}

/**
 * 1. Overview for Super Admin Custom Domain Manager
 * Queries real database for PRO & ADVANCE stores and their custom domain states.
 */
export async function getCustomDomainsOverviewAction(): Promise<CustomDomainsOverviewData> {
  await requireSaasAdmin();

  const proAndAdvanceStores = await prisma.store.findMany({
    where: {
      tier: { in: ["PRO", "ADVANCE"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      customDomain: true,
      customDomainStatus: true,
      customDomainVerifiedAt: true,
      customDomainDnsType: true,
      tier: true,
      whatsapp: true,
      createdAt: true,
    },
  });

  const registeredStores: CustomDomainItem[] = [];
  const storesWithoutDomain: StoreWithoutDomainItem[] = [];

  for (const s of proAndAdvanceStores) {
    if (s.customDomain && s.customDomain.trim().length > 0) {
      registeredStores.push({
        id: s.id,
        name: s.name,
        slug: s.slug,
        customDomain: s.customDomain,
        customDomainStatus: s.customDomainStatus || "PENDING",
        customDomainVerifiedAt: s.customDomainVerifiedAt ? s.customDomainVerifiedAt.toISOString() : null,
        customDomainDnsType: s.customDomainDnsType || "CNAME",
        tier: s.tier,
        whatsapp: s.whatsapp,
        createdAt: s.createdAt.toISOString(),
      });
    } else {
      storesWithoutDomain.push({
        id: s.id,
        name: s.name,
        slug: s.slug,
        tier: s.tier,
        whatsapp: s.whatsapp,
      });
    }
  }

  const totalRegistered = registeredStores.length;
  const verifiedCount = registeredStores.filter((s) => s.customDomainStatus === "ACTIVE").length;
  const pendingSetupCount = storesWithoutDomain.length;

  const setting = await prisma.platformSetting.findUnique({ where: { id: "GLOBAL" } });
  const serverIp = setting?.serverIp || process.env.NEXT_PUBLIC_SERVER_IP || process.env.SERVER_IPV4 || "72.62.75.149";
  const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();
  const cnameTarget = setting?.cnameTarget || `cname.${mainDomain}`;

  return {
    totalRegistered,
    verifiedCount,
    pendingSetupCount,
    registeredStores,
    storesWithoutDomain,
    serverIp,
    cnameTarget,
  };
}

/**
 * 2. Verify Custom Domain DNS Lookup for a specific store (Real DNS via Node.js dns.promises)
 * Updates database customDomainStatus ('ACTIVE' or 'FAILED'/'PENDING') and customDomainVerifiedAt.
 */
export async function verifyCustomDomainDnsAction(storeId: string): Promise<{
  success: boolean;
  status: "ACTIVE" | "FAILED" | "PENDING";
  verifiedAt: string | null;
  result: VerifyDnsResult;
}> {
  await requireSaasAdmin();

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, name: true, customDomain: true, tier: true },
  });

  if (!store || !store.customDomain) {
    throw new Error("Toko atau custom domain tidak ditemukan.");
  }

  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || process.env.SERVER_IPV4 || "72.62.75.149";
  const dnsResult = await verifyDomainDns(store.customDomain, serverIp);

  let newStatus: "ACTIVE" | "FAILED" | "PENDING" = "PENDING";
  let verifiedAt: Date | null = null;
  const dnsType = dnsResult.matchType || "CNAME";

  if (dnsResult.isMatched) {
    newStatus = "ACTIVE";
    verifiedAt = new Date();
  } else if (dnsResult.resolvedIps.length > 0) {
    newStatus = "FAILED";
  } else {
    newStatus = "PENDING";
  }

  await prisma.store.update({
    where: { id: storeId },
    data: {
      customDomainStatus: newStatus,
      customDomainVerifiedAt: verifiedAt,
      customDomainDnsType: dnsType,
    },
  });

  revalidatePath("/super-admin/domains");
  revalidatePath("/admin/settings");

  return {
    success: dnsResult.isMatched,
    status: newStatus,
    verifiedAt: verifiedAt ? verifiedAt.toISOString() : null,
    result: dnsResult,
  };
}

/**
 * 3. Merchant: Check Domain DNS
 */
export async function checkDomainDnsAction(domainInput: string): Promise<VerifyDnsResult> {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  if (store.tier === "STARTER") {
    return {
      success: false,
      cleanDomain: domainInput,
      resolvedIps: [],
      isMatched: false,
      message: "Custom domain hanya tersedia untuk toko paket Pro dan Advance.",
    };
  }

  const targetIp = process.env.NEXT_PUBLIC_SERVER_IP || process.env.SERVER_IPV4 || "72.62.75.149";
  return await verifyDomainDns(domainInput, targetIp);
}

/**
 * 4. Merchant: Save Custom Domain to Store
 */
export async function saveCustomDomainAction(customDomainInput: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    if (store.tier === "STARTER") {
      return {
        success: false,
        error: "Custom domain hanya didukung pada paket PRO.",
      };
    }

    const cleanDomain = customDomainInput
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/:\d+$/, "");

    if (!cleanDomain) {
      // Hapus custom domain jika input dikosongkan
      await prisma.store.update({
        where: { id: store.id },
        data: {
          customDomain: null,
          customDomainStatus: "PENDING",
          customDomainVerifiedAt: null,
        },
      });

      revalidatePath("/admin/settings");
      revalidatePath("/super-admin/domains");
      return { success: true, customDomain: null };
    }

    const mainDomain = (process.env.NEXT_PUBLIC_MAIN_DOMAIN || "gadgetbdg.com").toLowerCase();

    // Validasi tidak menggunakan domain platform langsung
    if (cleanDomain === mainDomain || cleanDomain.endsWith(`.${mainDomain}`)) {
      return {
        success: false,
        error: `Domain tidak boleh menggunakan domain internal platform (${mainDomain}).`,
      };
    }

    // Validasi reserved slugs
    const firstSub = cleanDomain.split(".")[0];
    if (isReservedSlug(firstSub) && cleanDomain.split(".").length === 2) {
      return {
        success: false,
        error: "Domain ini menggunakan kata yang dilindungi sistem.",
      };
    }

    // Cek keunikan domain di database
    const existing = await prisma.store.findFirst({
      where: {
        customDomain: { equals: cleanDomain, mode: "insensitive" },
        id: { not: store.id },
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Domain "${cleanDomain}" sudah digunakan oleh toko lain.`,
      };
    }

    // Simpan ke database dengan status awal PENDING
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: {
        customDomain: cleanDomain,
        customDomainStatus: "PENDING",
        customDomainVerifiedAt: null,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/super-admin/domains");
    revalidatePath(`/custom-domain/${cleanDomain}`);
    revalidatePath(`/${store.slug}`);

    return {
      success: true,
      customDomain: updated.customDomain,
    };
  } catch (error: any) {
    console.error("saveCustomDomainAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal menyimpan custom domain.",
    };
  }
}

/**
 * 5. Backward-compatibility helper for raw DNS check
 */
export async function superAdminCheckDomainDnsAction(domainInput: string): Promise<VerifyDnsResult> {
  await requireSaasAdmin();
  const targetIp = process.env.NEXT_PUBLIC_SERVER_IP || process.env.SERVER_IPV4 || "72.62.75.149";
  return await verifyDomainDns(domainInput, targetIp);
}
