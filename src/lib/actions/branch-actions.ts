"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";

export interface BranchData {
  id: string;
  storeId: string;
  name: string;
  address: string;
  phone: string | null;
  mapsUrl: string | null;
  isMain: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
    users: number;
  };
}

function serializeBranch(b: any): BranchData {
  return {
    id: b.id,
    storeId: b.storeId,
    name: b.name,
    address: b.address,
    phone: b.phone ?? null,
    mapsUrl: b.mapsUrl ?? null,
    isMain: Boolean(b.isMain),
    createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : b.createdAt,
    updatedAt: b.updatedAt instanceof Date ? b.updatedAt.toISOString() : b.updatedAt,
    _count: b._count
      ? {
          products: Number(b._count.products || 0),
          users: Number(b._count.users || 0),
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
  address: string;
  phone?: string;
  mapsUrl?: string;
  isMain?: boolean;
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
    let phone = data.phone?.trim() || null;
    const mapsUrl = data.mapsUrl?.trim() || null;
    const isMain = Boolean(data.isMain);

    if (!name || !address) {
      return { success: false, error: "Nama cabang dan alamat wajib diisi." };
    }

    if (phone) {
      phone = phone.replace(/\D/g, "");
      if (phone.startsWith("0")) phone = "62" + phone.slice(1);
    }

    const branch = await prisma.$transaction(async (tx) => {
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
          address,
          phone,
          mapsUrl,
          isMain: shouldBeMain,
        },
      });
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/team");
    revalidatePath("/admin/products");
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
    address: string;
    phone?: string;
    mapsUrl?: string;
    isMain?: boolean;
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
    let phone = data.phone?.trim() || null;
    const mapsUrl = data.mapsUrl?.trim() || null;
    const isMain = Boolean(data.isMain);

    if (!name || !address) {
      return { success: false, error: "Nama cabang dan alamat wajib diisi." };
    }

    if (phone) {
      phone = phone.replace(/\D/g, "");
      if (phone.startsWith("0")) phone = "62" + phone.slice(1);
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
          address,
          phone,
          mapsUrl,
          ...(isMain ? { isMain: true } : {}),
        },
      });
    });

    revalidatePath("/admin/branches");
    revalidatePath("/admin/team");
    revalidatePath("/admin/products");
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
