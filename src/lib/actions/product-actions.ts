"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { TIER_LIMITS } from "@/lib/constants/pricing";
import { assertCanAddProduct } from "@/lib/guards/plan-guard";

// ─── Helper: serialize product (Date → string, Decimal → number) ──
function serializeProduct(p: any) {
  return {
    ...p,
    price: Number(p.price),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
    branch: p.branch
      ? {
          id: p.branch.id,
          name: p.branch.name,
          address: p.branch.address,
          phone: p.branch.phone ?? null,
          mapsUrl: p.branch.mapsUrl ?? null,
          isMain: Boolean(p.branch.isMain),
        }
      : null,
  };
}

// ─── 1. getStoreProductsAction ────────────────────────────────────
export async function getStoreProductsAction() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const products = await prisma.product.findMany({
    where: { storeId: store.id },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          mapsUrl: true,
          isMain: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    products: products.map(serializeProduct),
  };
}

// ─── 2. createProductAction ───────────────────────────────────────
export async function createProductAction(formData: FormData) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const priceRaw = formData.get("price") as string;
    const ramRom = formData.get("ramRom") as string;
    const batteryHealthRaw = formData.get("batteryHealth") as string;
    const imeiStatusRaw = formData.get("imeiStatus") as string;
    const imeiNumber = (formData.get("imeiNumber") as string)?.trim() || "";
    const completeness = formData.get("completeness") as string;
    const condition = formData.get("condition") as string;
    const minusNotes = (formData.get("minusNotes") as string) || null;
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const branchId = (formData.get("branchId") as string) || null;

    const imeiStatus = imeiNumber
      ? `${imeiStatusRaw} [IMEI: ${imeiNumber}]`
      : imeiStatusRaw;

    if (!name || !brand || !priceRaw || !ramRom || !imeiStatusRaw || !completeness || !condition) {
      return { success: false, error: "Mohon lengkapi seluruh field wajib." };
    }

    // Validasi branchId jika ada
    let validBranchId: string | null = null;
    if (branchId && branchId.trim()) {
      const branchExists = await prisma.branch.findFirst({
        where: { id: branchId.trim(), storeId: store.id },
      });
      if (branchExists) {
        validBranchId = branchExists.id;
      }
    }

    // Validasi kuota stok aktif via Plan Guard (SSoT dari database SubscriptionPlan)
    const guardCheck = await assertCanAddProduct(store.id);
    if (!guardCheck.allowed) {
      return {
        success: false,
        error: guardCheck.error || "Batas kuota produk aktif telah tercapai.",
      };
    }

    const price = parseInt(priceRaw.replace(/\D/g, ""), 10);
    const batteryHealth = batteryHealthRaw ? parseInt(batteryHealthRaw, 10) : null;

    // Ambil array images dari FormData (mendukung multi-upload WebP atau single imageUrl)
    let images: string[] = [];
    const imagesJson = formData.get("images") as string | null;
    if (imagesJson) {
      try {
        const parsed = JSON.parse(imagesJson);
        if (Array.isArray(parsed)) {
          images = parsed.filter((url) => typeof url === "string" && url.trim().length > 0);
        }
      } catch {
        // Not JSON, treat as raw url
        if (imagesJson.trim()) images = [imagesJson.trim()];
      }
    }

    if (images.length === 0 && imageUrl) {
      images = [imageUrl.trim()];
    }

    const product = await prisma.product.create({
      data: {
        storeId: store.id, // ← selalu dari session, bukan dari formData
        branchId: validBranchId,
        name,
        brand,
        price,
        ramRom,
        batteryHealth: batteryHealth && !isNaN(batteryHealth) ? batteryHealth : null,
        imeiStatus,
        completeness,
        condition,
        minusNotes,
        status: "AVAILABLE",
        images,
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            mapsUrl: true,
            isMain: true,
          },
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath(`/${store.slug}`);

    return { success: true, product: serializeProduct(product) };
  } catch (error: any) {
    console.error("createProductAction error:", error);
    return { success: false, error: error?.message || "Gagal menambahkan produk." };
  }
}

// ─── 3. updateProductStatusAction ────────────────────────────────
export async function updateProductStatusAction(
  productId: string,
  newStatus: "AVAILABLE" | "BOOKED" | "SOLD"
) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    // Verifikasi kepemilikan: produk harus milik toko yang sedang login
    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id }, // ← tenant guard
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan atau bukan milik toko Anda." };
    }

    // Jika mengaktifkan kembali dari SOLD → AVAILABLE/BOOKED, cek kuota dulu
    if (
      existing.status === "SOLD" &&
      (newStatus === "AVAILABLE" || newStatus === "BOOKED")
    ) {
      const activeCount = await prisma.product.count({
        where: {
          storeId: store.id,
          status: { in: ["AVAILABLE", "BOOKED"] },
        },
      });

      const tierConfig = TIER_LIMITS[store.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.STARTER;
      const maxActive = tierConfig.maxActiveProducts;

      if (maxActive !== Infinity && activeCount >= maxActive) {
        return {
          success: false,
          error: `Tidak dapat mengaktifkan kembali unit. Kuota stok aktif paket ${tierConfig.name} sudah penuh (${maxActive} unit).`,
        };
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath(`/${store.slug}`);

    return { success: true, product: serializeProduct(updated) };
  } catch (error: any) {
    console.error("updateProductStatusAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status unit." };
  }
}

// ─── 4. deleteProductAction ───────────────────────────────────────
export async function deleteProductAction(productId: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    // Verifikasi kepemilikan sebelum hapus
    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id }, // ← tenant guard
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan atau bukan milik toko Anda." };
    }

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath(`/${store.slug}`);

    return { success: true };
  } catch (error: any) {
    console.error("deleteProductAction error:", error);
    return { success: false, error: error?.message || "Gagal menghapus produk." };
  }
}

// ─── Legacy aliases (backward compatibility) ─────────────────────
// Keep old names working so actions.ts wrappers don't break
export const createProduct = createProductAction;
export const updateProductStatus = updateProductStatusAction;
export const deleteProduct = deleteProductAction;
