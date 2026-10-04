"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { assertCanAddProduct } from "@/lib/guards/plan-guard";

// ─── Helper: slug generator ───────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Helper: serialize product (Date → string, Decimal → number) ──
function serializeProduct(p: any) {
  if (!p) return null;
  return {
    ...p,
    title: p.title || p.name || "",
    name: p.title || p.name || "",
    price: Number(p.price || 0),
    images: Array.isArray(p.images) ? p.images.map(String) : [],
    grade: p.grade || p.condition || null,
    condition: p.grade || p.condition || "",
    conditionNotes: p.conditionNotes || p.minusNotes || null,
    minusNotes: p.conditionNotes || p.minusNotes || null,
    ramRom: p.ram && p.storage ? `${p.ram} / ${p.storage}` : p.ramRom || p.storage || p.ram || "",
    isFeatured: Boolean(p.isFeatured),
    isReadyCod: p.isReadyCod !== undefined ? Boolean(p.isReadyCod) : true,
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
  const { store, user } = ctx;

  // Filter khusus staf cabang: Jika role STORE_STAFF dan ditugaskan ke cabang, hanya tampilkan produk cabangnya
  const whereClause: any = { storeId: store.id };
  if (user.role === "STORE_STAFF" && user.branchId) {
    whereClause.branchId = user.branchId;
  }

  const products = await prisma.product.findMany({
    where: whereClause,
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
export async function createProductAction(input: FormData | Record<string, any>) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    // Ekstraksi data baik dari FormData maupun Plain Object
    let title = "";
    let category = "SMARTPHONE";
    let brand = "";
    let priceRaw: any = 0;
    let grade: string | null = null;
    let ram: string | null = null;
    let storage: string | null = null;
    let batteryHealth: string | null = null;
    let completeness: string | null = null;
    let conditionNotes: string | null = null;
    let description: string | null = null;
    let status: "AVAILABLE" | "BOOKED" | "SOLD" = "AVAILABLE";
    let branchId: string | null = null;
    let images: string[] = [];
    let imeiStatus: string | null = null;

    let warrantyBonus: string | null = null;
    let thumbnail: string | null = null;
    let isFeatured = false;
    let isReadyCod = true;

    if (input instanceof FormData) {
      title = ((input.get("title") as string) || (input.get("name") as string) || "").trim();
      category = ((input.get("category") as string) || "SMARTPHONE").trim();
      brand = ((input.get("brand") as string) || "").trim();
      priceRaw = input.get("price");
      grade = (input.get("grade") as string) || (input.get("condition") as string) || null;
      ram = (input.get("ram") as string) || null;
      storage = (input.get("storage") as string) || null;
      batteryHealth = (input.get("batteryHealth") as string) || null;
      completeness = (input.get("completeness") as string) || null;
      conditionNotes = (input.get("conditionNotes") as string) || (input.get("minusNotes") as string) || null;
      description = (input.get("description") as string) || null;
      warrantyBonus = (input.get("warrantyBonus") as string) || (input.get("description") as string) || null;
      const isFeaturedRaw = input.get("isFeatured");
      if (isFeaturedRaw !== null) isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "on";
      const isReadyCodRaw = input.get("isReadyCod");
      if (isReadyCodRaw !== null) isReadyCod = isReadyCodRaw === "true" || isReadyCodRaw === "on";
      const statusRaw = input.get("status") as string;
      if (statusRaw === "BOOKED" || statusRaw === "SOLD") {
        status = statusRaw;
      }
      branchId = (input.get("branchId") as string) || null;
      imeiStatus = (input.get("imeiStatus") as string) || null;
      thumbnail = (input.get("thumbnail") as string) || null;

      // Parse images (array JSON, multiple form entries, atau single imageUrl)
      const imagesJson = input.get("images") as string | null;
      if (imagesJson) {
        try {
          const parsed = JSON.parse(imagesJson);
          if (Array.isArray(parsed)) {
            images = parsed.filter((url) => typeof url === "string" && url.trim().length > 0);
          }
        } catch {
          if (imagesJson.trim()) images = [imagesJson.trim()];
        }
      }
      const imageUrl = input.get("imageUrl") as string | null;
      if (images.length === 0 && imageUrl && imageUrl.trim()) {
        images = [imageUrl.trim()];
      }
    } else {
      title = (input.title || input.name || "").trim();
      category = (input.category || "SMARTPHONE").trim();
      brand = (input.brand || "").trim();
      priceRaw = input.price;
      grade = input.grade || input.condition || null;
      ram = input.ram || null;
      storage = input.storage || null;
      batteryHealth = input.batteryHealth || null;
      completeness = input.completeness || null;
      conditionNotes = input.conditionNotes || input.minusNotes || null;
      description = input.description || null;
      warrantyBonus = input.warrantyBonus || input.description || null;
      if (input.status === "BOOKED" || input.status === "SOLD") {
        status = input.status;
      }
      branchId = input.branchId || null;
      imeiStatus = input.imeiStatus || null;
      thumbnail = input.thumbnail || null;
      if (input.isFeatured !== undefined) isFeatured = Boolean(input.isFeatured);
      if (input.isReadyCod !== undefined) isReadyCod = Boolean(input.isReadyCod);
      if (Array.isArray(input.images)) {
        images = input.images.filter((url: any) => typeof url === "string" && url.trim().length > 0);
      }
    }

    if (!thumbnail && images.length > 0) {
      thumbnail = images[0];
    }

    if (!title || !brand || !priceRaw) {
      return { success: false, error: "Mohon lengkapi judul/nama HP, merk, dan harga produk." };
    }

    // Validasi kuota stok aktif via Plan Guard (SSoT dari database SubscriptionPlan)
    const guardCheck = await assertCanAddProduct(store.id);
    if (!guardCheck.allowed) {
      return {
        success: false,
        error: guardCheck.error || "Batas kuota produk aktif telah tercapai.",
      };
    }

    // Validasi branchId jika ada & pembatasan peran STORE_STAFF
    let validBranchId: string | null = null;

    if (ctx.user.role === "STORE_STAFF" && ctx.user.branchId) {
      // Staf otomatis diikat ke cabangnya sendiri
      validBranchId = ctx.user.branchId;
    } else if (branchId && branchId.trim()) {
      const branchExists = await prisma.branch.findFirst({
        where: { id: branchId.trim(), storeId: store.id },
      });
      if (branchExists) {
        validBranchId = branchExists.id;
      }
    }

    const price = typeof priceRaw === "number" ? priceRaw : parseInt(String(priceRaw).replace(/\D/g, ""), 10) || 0;
    const baseSlug = slugify(title) || "produk";
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
    const ramRom = ram && storage ? `${ram} / ${storage}` : storage || ram || "";

    const product = await prisma.product.create({
      data: {
        storeId: store.id, // ← Isolasi data tenant mutlak dari sesi
        branchId: validBranchId,
        title,
        name: title,
        slug: uniqueSlug,
        category,
        brand,
        price,
        grade,
        ram,
        storage,
        batteryHealth,
        completeness,
        conditionNotes,
        description,
        warrantyBonus,
        thumbnail,
        status,
        images,
        ramRom,
        isFeatured,
        isReadyCod,
        condition: grade || "Mulus",
        minusNotes: conditionNotes,
        imeiStatus: imeiStatus || "Resmi Terdaftar",
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

// ─── 3. updateProductAction ───────────────────────────────────────
export async function updateProductAction(
  productId: string,
  input: FormData | Record<string, any>
) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    // Verifikasi kepemilikan mutlak tenant
    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan atau bukan milik toko Anda." };
    }

    // Verifikasi penugasan cabang untuk staf
    if (ctx.user.role === "STORE_STAFF" && ctx.user.branchId) {
      if (existing.branchId && existing.branchId !== ctx.user.branchId) {
        return {
          success: false,
          error: "FORBIDDEN: Anda hanya dapat mengubah produk pada cabang yang ditugaskan.",
        };
      }
    }

    let title = existing.title || existing.name || "";
    let category = existing.category || "SMARTPHONE";
    let brand = existing.brand || "";
    let price: number = Number(existing.price || 0);
    let grade = existing.grade || existing.condition || null;
    let ram = existing.ram || null;
    let storage = existing.storage || null;
    let batteryHealth = existing.batteryHealth || null;
    let completeness = existing.completeness || null;
    let conditionNotes = existing.conditionNotes || existing.minusNotes || null;
    let description = existing.description || null;
    let status = existing.status;
    let branchId = existing.branchId;
    let images = existing.images;
    let imeiStatus = existing.imeiStatus || null;
    let isFeatured = existing.isFeatured;
    let isReadyCod = existing.isReadyCod;

    if (input instanceof FormData) {
      if (input.has("title") || input.has("name")) {
        title = ((input.get("title") as string) || (input.get("name") as string) || "").trim();
      }
      if (input.has("category")) category = ((input.get("category") as string) || "SMARTPHONE").trim();
      if (input.has("brand")) brand = ((input.get("brand") as string) || "").trim();
      if (input.has("price")) {
        const pRaw = input.get("price");
        price = typeof pRaw === "number" ? pRaw : parseInt(String(pRaw).replace(/\D/g, ""), 10) || 0;
      }
      if (input.has("grade") || input.has("condition")) {
        grade = (input.get("grade") as string) || (input.get("condition") as string) || null;
      }
      if (input.has("ram")) ram = (input.get("ram") as string) || null;
      if (input.has("storage")) storage = (input.get("storage") as string) || null;
      if (input.has("batteryHealth")) batteryHealth = (input.get("batteryHealth") as string) || null;
      if (input.has("completeness")) completeness = (input.get("completeness") as string) || null;
      if (input.has("conditionNotes") || input.has("minusNotes")) {
        conditionNotes = (input.get("conditionNotes") as string) || (input.get("minusNotes") as string) || null;
      }
      if (input.has("description")) description = (input.get("description") as string) || null;
      if (input.has("status")) {
        const sRaw = input.get("status") as string;
        if (sRaw === "AVAILABLE" || sRaw === "BOOKED" || sRaw === "SOLD") {
          status = sRaw;
        }
      }
      if (input.has("branchId")) branchId = (input.get("branchId") as string) || null;
      if (input.has("imeiStatus")) imeiStatus = (input.get("imeiStatus") as string) || null;
      if (input.has("isFeatured")) {
        const feat = input.get("isFeatured");
        isFeatured = feat === "true" || feat === "on";
      }
      if (input.has("isReadyCod")) {
        const cod = input.get("isReadyCod");
        isReadyCod = cod === "true" || cod === "on";
      }

      if (input.has("images")) {
        const imagesJson = input.get("images") as string | null;
        if (imagesJson) {
          try {
            const parsed = JSON.parse(imagesJson);
            if (Array.isArray(parsed)) {
              images = parsed.filter((url) => typeof url === "string" && url.trim().length > 0);
            }
          } catch {
            if (imagesJson.trim()) images = [imagesJson.trim()];
          }
        }
      }
    } else {
      if (input.title !== undefined || input.name !== undefined) title = (input.title || input.name || "").trim();
      if (input.category !== undefined) category = (input.category || "SMARTPHONE").trim();
      if (input.brand !== undefined) brand = (input.brand || "").trim();
      if (input.price !== undefined) {
        price = typeof input.price === "number" ? input.price : parseInt(String(input.price).replace(/\D/g, ""), 10) || 0;
      }
      if (input.grade !== undefined || input.condition !== undefined) grade = input.grade || input.condition || null;
      if (input.ram !== undefined) ram = input.ram || null;
      if (input.storage !== undefined) storage = input.storage || null;
      if (input.batteryHealth !== undefined) batteryHealth = input.batteryHealth || null;
      if (input.completeness !== undefined) completeness = input.completeness || null;
      if (input.conditionNotes !== undefined || input.minusNotes !== undefined) {
        conditionNotes = input.conditionNotes || input.minusNotes || null;
      }
      if (input.description !== undefined) description = input.description || null;
      if (input.status === "AVAILABLE" || input.status === "BOOKED" || input.status === "SOLD") {
        status = input.status;
      }
      if (input.branchId !== undefined) branchId = input.branchId || null;
      if (input.imeiStatus !== undefined) imeiStatus = input.imeiStatus || null;
      if (input.isFeatured !== undefined) isFeatured = Boolean(input.isFeatured);
      if (input.isReadyCod !== undefined) isReadyCod = Boolean(input.isReadyCod);
      if (Array.isArray(input.images)) {
        images = input.images.filter((url: any) => typeof url === "string" && url.trim().length > 0);
      }
    }

    // Jika mengaktifkan kembali unit dari SOLD menjadi AVAILABLE/BOOKED, cek kuota
    if (existing.status === "SOLD" && (status === "AVAILABLE" || status === "BOOKED")) {
      const guardCheck = await assertCanAddProduct(store.id);
      if (!guardCheck.allowed) {
        return {
          success: false,
          error: guardCheck.error || "Batas kuota produk aktif telah tercapai.",
        };
      }
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

    const ramRom = ram && storage ? `${ram} / ${storage}` : storage || ram || "";

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        name: title,
        category,
        brand,
        price,
        grade,
        ram,
        storage,
        batteryHealth,
        completeness,
        conditionNotes,
        description,
        warrantyBonus: input instanceof FormData
          ? ((input.get("warrantyBonus") as string) || (input.get("description") as string) || description)
          : (input.warrantyBonus !== undefined ? input.warrantyBonus : description),
        thumbnail: images.length > 0 ? images[0] : null,
        status,
        images,
        branchId: validBranchId,
        ramRom,
        isFeatured,
        isReadyCod,
        condition: grade || "Mulus",
        minusNotes: conditionNotes,
        imeiStatus: imeiStatus || "Resmi Terdaftar",
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

    return { success: true, product: serializeProduct(updated) };
  } catch (error: any) {
    console.error("updateProductAction error:", error);
    return { success: false, error: error?.message || "Gagal memperbarui produk." };
  }
}

// ─── 3.5. toggleProductFeaturedAction ─────────────────────────────
export async function toggleProductFeaturedAction(productId: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        isFeatured: !existing.isFeatured,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath(`/${store.slug}`);

    return { success: true, isFeatured: updated.isFeatured, product: serializeProduct(updated) };
  } catch (error: any) {
    console.error("toggleProductFeaturedAction error:", error);
    return { success: false, error: error?.message || "Gagal mengubah status featured produk." };
  }
}

// ─── 4. updateProductStatusAction ────────────────────────────────
export async function updateProductStatusAction(
  productId: string,
  newStatus: "AVAILABLE" | "BOOKED" | "SOLD"
) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan atau bukan milik toko Anda." };
    }

    if (ctx.user.role === "STORE_STAFF" && ctx.user.branchId) {
      if (existing.branchId && existing.branchId !== ctx.user.branchId) {
        return {
          success: false,
          error: "FORBIDDEN: Anda hanya dapat mengubah status produk pada cabang yang ditugaskan.",
        };
      }
    }

    if (existing.status === "SOLD" && (newStatus === "AVAILABLE" || newStatus === "BOOKED")) {
      const guardCheck = await assertCanAddProduct(store.id);
      if (!guardCheck.allowed) {
        return {
          success: false,
          error: guardCheck.error || "Batas kuota produk aktif telah tercapai.",
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

// ─── 5. deleteProductAction ───────────────────────────────────────
export async function deleteProductAction(productId: string) {
  try {
    const ctx = await requireStoreOwnerOrStaff();
    const { store } = ctx;

    const existing = await prisma.product.findUnique({
      where: { id: productId, storeId: store.id },
    });

    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan atau bukan milik toko Anda." };
    }

    if (ctx.user.role === "STORE_STAFF" && ctx.user.branchId) {
      if (existing.branchId && existing.branchId !== ctx.user.branchId) {
        return {
          success: false,
          error: "FORBIDDEN: Anda hanya dapat menghapus produk pada cabang yang ditugaskan.",
        };
      }
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
export const createProduct = createProductAction;
export const updateProduct = updateProductAction;
export const updateProductStatus = updateProductStatusAction;
export const deleteProduct = deleteProductAction;
