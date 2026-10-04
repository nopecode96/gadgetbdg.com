"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";

export interface BranchData {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  address: string;
  whatsapp: string;
  phone: string | null;
  mapsUrl: string | null;
  isMain: boolean;
  image?: string | null;
  googleMapsUrl?: string | null;
  googleReviewUrl?: string | null;
  businessHours?: string | null;
  warrantyInfo?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    users: number;
    tradeIns?: number;
  };
}

function serializeBranch(b: any): BranchData {
  return {
    id: b.id,
    storeId: b.storeId,
    name: b.name,
    slug: b.slug,
    address: b.address,
    whatsapp: b.whatsapp || b.phone || "",
    phone: b.phone ?? null,
    mapsUrl: b.mapsUrl || b.googleMapsUrl || null,
    isMain: Boolean(b.isMain),
    image: b.image ?? null,
    googleMapsUrl: b.googleMapsUrl || b.mapsUrl || null,
    googleReviewUrl: b.googleReviewUrl ?? null,
    businessHours: b.businessHours ?? null,
    warrantyInfo: b.warrantyInfo ?? null,
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
    _count: b._count
      ? {
          products: Number(b._count.products || 0),
          users: Number(b._count.users || 0),
          tradeIns: Number(b._count.tradeIns || 0),
        }
      : undefined,
  };
}

/**
 * 1. Ambil daftar seluruh cabang milik toko yang sedang aktif.
 */
export async function getStoreBranchesAction() {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const branches = await prisma.branch.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: {
            products: true,
            users: true,
          },
        },
      },
      orderBy: [{ isMain: "desc" }, { createdAt: "asc" }],
    });

    return {
      success: true,
      branches: branches.map(serializeBranch),
    };
  } catch (error: any) {
    console.error("getStoreBranchesAction error:", error);
    return { success: false, error: error?.message || "Gagal mengambil data cabang." };
  }
}

/**
 * 2. Tambah cabang baru. Khusus paket ADVANCE dan role STORE_OWNER.
 */
export async function createBranchAction(data: {
  name: string;
  slug?: string;
  address: string;
  whatsapp?: string;
  phone?: string;
  mapsUrl?: string;
  isMain?: boolean;
  image?: string | null;
  googleMapsUrl?: string | null;
  googleReviewUrl?: string | null;
  businessHours?: string | null;
  warrantyInfo?: string | null;
}) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store, user } = ctx;

    if (user.role !== "STORE_OWNER") {
      return { success: false, error: "Hanya pemilik toko (Store Owner) yang dapat menambah cabang." };
    }

    if (store.tier !== "ADVANCE") {
      return {
        success: false,
        error: "Fitur Multi-Cabang khusus untuk paket Advance. Silakan upgrade paket Anda.",
      };
    }

    const name = data.name?.trim();
    const address = data.address?.trim();
    let whatsappInput = (data.whatsapp || data.phone || "").trim();
    const mapsUrl = data.mapsUrl?.trim() || null;
    const isMain = Boolean(data.isMain);

    if (!name || !address) {
      return { success: false, error: "Nama cabang dan alamat wajib diisi." };
    }

    // Format WhatsApp
    let cleanWa = whatsappInput.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    if (!cleanWa) {
      cleanWa = store.whatsapp.replace(/\D/g, "");
      if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    }

    // Format Slug
    let baseSlug = (data.slug || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!baseSlug) {
      baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!baseSlug) baseSlug = "cabang";

    const branch = await prisma.$transaction(async (tx) => {
      // Check slug uniqueness per store
      let finalSlug = baseSlug;
      let counter = 1;
      while (true) {
        const existingWithSlug = await tx.branch.findUnique({
          where: {
            storeId_slug: {
              storeId: store.id,
              slug: finalSlug,
            },
          },
        });
        if (!existingWithSlug) break;
        counter++;
        finalSlug = `${baseSlug}-${counter}`;
      }

      // Jika cabang pertama atau diset isMain, perbarui cabang lain jika isMain: true
      const branchCount = await tx.branch.count({ where: { storeId: store.id } });
      const shouldBeMain = isMain || branchCount === 0;

      if (shouldBeMain) {
        await tx.branch.updateMany({
          where: { storeId: store.id, isMain: true },
          data: { isMain: false },
        });
      }

      return await tx.branch.create({
        data: {
          storeId: store.id,
          name,
          slug: finalSlug,
          address,
          whatsapp: cleanWa,
          phone: cleanWa,
          mapsUrl: data.googleMapsUrl?.trim() || mapsUrl,
          googleMapsUrl: data.googleMapsUrl?.trim() || mapsUrl,
          image: data.image?.trim() || null,
          googleReviewUrl: data.googleReviewUrl?.trim() || null,
          businessHours: data.businessHours?.trim() || null,
          warrantyInfo: data.warrantyInfo?.trim() || null,
          isMain: shouldBeMain,
        },
      });
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/team");
    revalidatePath("/admin/products");
    revalidatePath("/admin/marketing/qr-stands");
    revalidatePath(`/${store.slug}`);

    return { success: true, branch: serializeBranch(branch) };
  } catch (error: any) {
    console.error("createBranchAction error:", error);
    return { success: false, error: error?.message || "Gagal membuat cabang baru." };
  }
}

/**
 * 3. Update data cabang. Khusus paket ADVANCE dan role STORE_OWNER.
 */
export async function updateBranchAction(
  branchId: string,
  data: {
    name: string;
    slug?: string;
    address: string;
    whatsapp?: string;
    phone?: string;
    mapsUrl?: string;
    isMain?: boolean;
    image?: string | null;
    googleMapsUrl?: string | null;
    googleReviewUrl?: string | null;
    businessHours?: string | null;
    warrantyInfo?: string | null;
  }
) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store, user } = ctx;

    if (user.role !== "STORE_OWNER") {
      return { success: false, error: "Hanya pemilik toko (Store Owner) yang dapat mengubah data cabang." };
    }

    if (store.tier !== "ADVANCE") {
      return {
        success: false,
        error: "Fitur Multi-Cabang khusus untuk paket Advance. Silakan upgrade paket Anda.",
      };
    }

    const existing = await prisma.branch.findFirst({
      where: { id: branchId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Cabang tidak ditemukan atau bukan milik toko Anda." };
    }

    const name = data.name?.trim();
    const address = data.address?.trim();
    let whatsappInput = (data.whatsapp || data.phone || existing.whatsapp || existing.phone || "").trim();
    const mapsUrl = data.googleMapsUrl?.trim() || data.mapsUrl?.trim() || null;
    const isMain = Boolean(data.isMain);

    if (!name || !address) {
      return { success: false, error: "Nama cabang dan alamat wajib diisi." };
    }

    // Format WhatsApp
    let cleanWa = whatsappInput.replace(/\D/g, "");
    if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);
    if (!cleanWa) cleanWa = existing.whatsapp || "6281234567890";

    // Format Slug jika diubah
    let newSlug = existing.slug;
    if (data.slug && data.slug.trim()) {
      const formattedSlug = data.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      if (formattedSlug && formattedSlug !== existing.slug) {
        const slugConflict = await prisma.branch.findFirst({
          where: {
            storeId: store.id,
            slug: formattedSlug,
            id: { not: branchId },
          },
        });
        if (slugConflict) {
          return { success: false, error: `Subdomain slug "${formattedSlug}" sudah digunakan oleh cabang lain.` };
        }
        newSlug = formattedSlug;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isMain) {
        await tx.branch.updateMany({
          where: { storeId: store.id, id: { not: branchId }, isMain: true },
          data: { isMain: false },
        });
      }

      return await tx.branch.update({
        where: { id: branchId },
        data: {
          name,
          slug: newSlug,
          address,
          whatsapp: cleanWa,
          phone: cleanWa,
          mapsUrl,
          googleMapsUrl: mapsUrl,
          ...(data.image !== undefined ? { image: data.image?.trim() || null } : {}),
          ...(data.googleReviewUrl !== undefined ? { googleReviewUrl: data.googleReviewUrl?.trim() || null } : {}),
          ...(data.businessHours !== undefined ? { businessHours: data.businessHours?.trim() || null } : {}),
          ...(data.warrantyInfo !== undefined ? { warrantyInfo: data.warrantyInfo?.trim() || null } : {}),
          ...(isMain ? { isMain: true } : {}),
        },
      });
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/team");
    revalidatePath("/admin/products");
    revalidatePath("/admin/marketing/qr-stands");
    revalidatePath(`/${store.slug}`);

    return { success: true, branch: serializeBranch(updated) };
  } catch (error: any) {
    console.error("updateBranchAction error:", error);
    return { success: false, error: error?.message || "Gagal memperbarui cabang." };
  }
}

/**
 * 4. Hapus cabang. Khusus paket ADVANCE dan role STORE_OWNER.
 */
export async function deleteBranchAction(branchId: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store, user } = ctx;

    if (user.role !== "STORE_OWNER") {
      return { success: false, error: "Hanya pemilik toko (Store Owner) yang dapat menghapus cabang." };
    }

    if (store.tier !== "ADVANCE") {
      return {
        success: false,
        error: "Fitur Multi-Cabang khusus untuk paket Advance.",
      };
    }

    const existing = await prisma.branch.findFirst({
      where: { id: branchId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Cabang tidak ditemukan." };
    }

    if (existing.isMain) {
      const otherBranches = await prisma.branch.count({
        where: { storeId: store.id, id: { not: branchId } },
      });
      if (otherBranches > 0) {
        return {
          success: false,
          error: "Cabang ini adalah Cabang Utama. Jadikan cabang lain sebagai Cabang Utama terlebih dahulu sebelum menghapus.",
        };
      }
    }

    await prisma.branch.delete({
      where: { id: branchId },
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/team");
    revalidatePath("/admin/products");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("deleteBranchAction error:", error);
    return { success: false, error: error?.message || "Gagal menghapus cabang." };
  }
}
