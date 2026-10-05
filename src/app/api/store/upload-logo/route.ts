export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

function revalidateStorePaths(slug: string, customDomain?: string | null) {
  try {
    revalidatePath("/[store]", "layout");
    revalidatePath("/[store]/manifest.webmanifest");
    revalidatePath(`/${slug}`, "layout");
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/manifest.webmanifest`);
    if (customDomain) {
      revalidatePath(`/custom-domain/${customDomain}`, "layout");
      revalidatePath(`/custom-domain/${customDomain}`);
      revalidatePath(`/custom-domain/${customDomain}/manifest.webmanifest`);
    }
    revalidatePath("/admin/settings");
    revalidatePath("/admin");
  } catch (e) {
    console.warn("Revalidation error:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.storeId) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login ke akun toko Anda." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const action = formData.get("action") as string | null;

    const store = await prisma.store.findUnique({
      where: { id: user.storeId },
      select: { id: true, slug: true, customDomain: true, logoUrl: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
    }

    // Aksi 1: Hapus logo (kembali ke default)
    if (action === "delete") {
      await prisma.store.update({
        where: { id: store.id },
        data: { logoUrl: null },
      });

      revalidateStorePaths(store.slug, store.customDomain);

      return NextResponse.json({
        success: true,
        message: "Logo toko berhasil dihapus. Toko kembali menggunakan logo default platform.",
        logoUrl: null,
      });
    }

    // Aksi 2: Upload logo baru
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File logo tidak ditemukan." }, { status: 400 });
    }

    // Validasi MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Format file tidak didukung. Format yang diizinkan: PNG, JPG/JPEG, WebP, dan SVG.",
        },
        { status: 400 }
      );
    }

    // Validasi ukuran maksimal 2MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file logo melebihi batas maksimal 2 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = path.extname(file.name).toLowerCase();
    if (!ext || ext === ".") {
      if (file.type === "image/png") ext = ".png";
      else if (file.type === "image/webp") ext = ".webp";
      else if (file.type === "image/svg+xml") ext = ".svg";
      else ext = ".jpg";
    }

    const filename = `${store.id}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const savedFileUrl = `/uploads/logos/${filename}`;

    await prisma.store.update({
      where: { id: store.id },
      data: { logoUrl: savedFileUrl },
    });

    revalidateStorePaths(store.slug, store.customDomain);

    return NextResponse.json({
      success: true,
      message: "Logo toko berhasil disimpan! Favicon dan PWA otomatis diperbarui.",
      logoUrl: savedFileUrl,
    });
  } catch (error: any) {
    console.error("Error uploading store logo:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses logo toko." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.storeId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: user.storeId },
      select: { id: true, slug: true, customDomain: true },
    });

    if (!store) {
      return NextResponse.json({ error: "Toko tidak ditemukan." }, { status: 404 });
    }

    await prisma.store.update({
      where: { id: store.id },
      data: { logoUrl: null },
    });

    revalidateStorePaths(store.slug, store.customDomain);

    return NextResponse.json({
      success: true,
      message: "Logo toko berhasil dihapus. Toko kembali menggunakan logo default platform.",
      logoUrl: null,
    });
  } catch (error: any) {
    console.error("Error deleting store logo:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus logo toko." },
      { status: 500 }
    );
  }
}
