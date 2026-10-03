"use server";

import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireSaasAdmin } from "@/lib/auth/session";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export async function uploadQrisImageAction(formData: FormData) {
  try {
    const admin = await requireSaasAdmin();
    if (admin.role !== "SUPER_ADMIN") {
      return { success: false, error: "Hanya Super Admin yang berwenang mengunggah gambar QRIS resmi." };
    }

    const file = formData.get("qrisFile") as File | null;
    if (!file) {
      return { success: false, error: "File gambar QRIS tidak ditemukan." };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Format file tidak valid. Harap unggah file gambar PNG, JPG, atau WebP.",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "Ukuran file terlalu besar. Maksimal 5 MB.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/uploads/platform/qris-official.png
    const uploadDir = path.join(process.cwd(), "public", "uploads", "platform");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, "qris-official.png");
    await fs.writeFile(filePath, buffer);

    const relativeUrl = `/uploads/platform/qris-official.png?v=${Date.now()}`;

    // Update PlatformSetting in database
    await prisma.platformSetting.upsert({
      where: { id: "GLOBAL" },
      update: {
        qrisImageUrl: "/uploads/platform/qris-official.png",
      },
      create: {
        id: "GLOBAL",
        qrisImageUrl: "/uploads/platform/qris-official.png",
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/");
    revalidatePath("/super-admin/billing");

    return {
      success: true,
      message: "Gambar QRIS resmi berhasil diunggah dan disimpan ke sistem!",
      qrisImageUrl: relativeUrl,
    };
  } catch (error: any) {
    console.error("uploadQrisImageAction error:", error);
    return {
      success: false,
      error: error?.message || "Gagal mengunggah gambar QRIS.",
    };
  }
}
