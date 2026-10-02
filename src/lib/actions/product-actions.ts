"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TIER_LIMITS } from "@/lib/constants/pricing";

export async function createProduct(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const priceRaw = formData.get("price") as string;
    const ramRom = formData.get("ramRom") as string;
    const batteryHealthRaw = formData.get("batteryHealth") as string;
    const imeiStatus = formData.get("imeiStatus") as string;
    const completeness = formData.get("completeness") as string;
    const condition = formData.get("condition") as string;
    const minusNotes = formData.get("minusNotes") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (!storeId || !name || !brand || !priceRaw || !ramRom || !imeiStatus || !completeness || !condition) {
      return { success: false, error: "Mohon lengkapi seluruh field wajib." };
    }

    // 1. Ambil data store untuk pengecekan batasan tier
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { id: true, slug: true, tier: true },
    });

    if (!store) {
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // 2. Hitung jumlah produk aktif toko saat ini (AVAILABLE & BOOKED)
    const activeCount = await prisma.product.count({
      where: {
        storeId,
        status: { in: ["AVAILABLE", "BOOKED"] },
      },
    });

    const tierConfig = TIER_LIMITS[store.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.STARTER;
    const maxActive = tierConfig.maxActiveProducts;

    // 3. Validasi batas kuota tier
    if (activeCount >= maxActive) {
      return {
        success: false,
        error: `Kapasitas stok penuh untuk paket Anda (Maksimal ${maxActive} unit). Silakan upgrade paket untuk menambah unit HP lagi.`,
      };
    }

    const price = parseInt(priceRaw.replace(/\D/g, ""), 10);
    const batteryHealth = batteryHealthRaw ? parseInt(batteryHealthRaw, 10) : null;
    const images = imageUrl ? [imageUrl] : [];

    const product = await prisma.product.create({
      data: {
        storeId,
        name,
        brand,
        price,
        ramRom,
        batteryHealth: batteryHealth && !isNaN(batteryHealth) ? batteryHealth : null,
        imeiStatus,
        completeness,
        condition,
        minusNotes: minusNotes || null,
        status: "AVAILABLE",
        images,
      },
      include: {
        store: true,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    if (product.store?.slug) {
      revalidatePath(`/${product.store.slug}`);
    }

    return { success: true, product };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { success: false, error: error?.message || "Gagal menambahkan produk." };
  }
}

export async function updateProductStatus(productId: string, newStatus: "AVAILABLE" | "BOOKED" | "SOLD") {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!existingProduct) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    // Jika beralih dari SOLD kembali ke AVAILABLE / BOOKED, verifikasi batas kapasitas tier
    if (existingProduct.status === "SOLD" && (newStatus === "AVAILABLE" || newStatus === "BOOKED")) {
      const activeCount = await prisma.product.count({
        where: {
          storeId: existingProduct.storeId,
          status: { in: ["AVAILABLE", "BOOKED"] },
        },
      });

      const tierConfig =
        TIER_LIMITS[existingProduct.store.tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.STARTER;
      const maxActive = tierConfig.maxActiveProducts;

      if (activeCount >= maxActive) {
        return {
          success: false,
          error: `Tidak dapat mengaktifkan kembali unit. Kuota stok aktif paket ${tierConfig.name} Anda sudah penuh (${maxActive} unit).`,
        };
      }
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
      include: { store: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    if (updated.store?.slug) {
      revalidatePath(`/${updated.store.slug}`);
    }

    return { success: true, product: updated };
  } catch (error: any) {
    console.error("Error updating product status:", error);
    return { success: false, error: error?.message || "Gagal mengubah status unit." };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const deleted = await prisma.product.delete({
      where: { id: productId },
      include: { store: true },
    });

    revalidatePath("/admin/products");
    revalidatePath("/admin");
    if (deleted.store?.slug) {
      revalidatePath(`/${deleted.store.slug}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return { success: false, error: error?.message || "Gagal menghapus produk." };
  }
}
