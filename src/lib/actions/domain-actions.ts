"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff, requireSaasAdmin } from "@/lib/auth/session";
import { isReservedSlug } from "@/lib/constants/reserved-slugs";
import { verifyDomainDns, VerifyDnsResult } from "@/lib/services/dns-service";

/**
 * 1. Check Domain DNS (Store Admin & Merchant)
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

  const targetIp = process.env.SERVER_IPV4 || "72.62.75.149";
  return await verifyDomainDns(domainInput, targetIp);
}

/**
 * 2. Save Custom Domain to Store
 */
export async function saveCustomDomainAction(customDomainInput: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    if (store.tier === "STARTER") {
      return {
        success: false,
        error: "Custom domain hanya didukung pada paket PRO dan ADVANCE.",
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
        data: { customDomain: null },
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

    // Simpan ke database
    const updated = await prisma.store.update({
      where: { id: store.id },
      data: { customDomain: cleanDomain },
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
 * 3. Super Admin Check Domain DNS for any Store
 */
export async function superAdminCheckDomainDnsAction(domainInput: string): Promise<VerifyDnsResult> {
  await requireSaasAdmin();
  const targetIp = process.env.SERVER_IPV4 || "72.62.75.149";
  return await verifyDomainDns(domainInput, targetIp);
}
