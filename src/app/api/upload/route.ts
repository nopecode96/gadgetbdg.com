export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Buat layer SVG teks watermark miring 15 derajat dengan drop shadow lembut
 */
function createWatermarkSvg(storeName: string, width: number, height: number): Buffer {
  const safeName = storeName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  // Proporsi font dinamis berdasarkan lebar gambar
  const fontSize = Math.max(28, Math.round(width / 24));
  const textX = Math.round(width / 2);
  const textY = Math.round(height / 2);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.4)"/>
        </filter>
      </defs>
      <style>
        .watermark {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-weight: 800;
          font-size: ${fontSize}px;
          fill: rgba(255, 255, 255, 0.45);
          letter-spacing: 2px;
          text-anchor: middle;
          dominant-baseline: central;
        }
      </style>
      <g transform="rotate(-15, ${textX}, ${textY})">
        <text x="${textX}" y="${textY}" class="watermark" filter="url(#shadow)">
          ${safeName}
        </text>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const type = formData.get("type") as string | null;

    // A. Upload foto trade-in unit oleh customer (publik / storefront)
    if (type === "trade-in") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "File foto HP tidak ditemukan." }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const filename = `tradein-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "tradein");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return NextResponse.json({ success: true, url: `/uploads/tradein/${filename}` });
    }

    const user = await getCurrentUser();

    // 1. Validasi sesi pemanggil untuk upload admin / internal
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // Cek jika ini adalah upload bukti bayar QRIS pendaftaran (onboarding)
    if (type === "receipt" || !user.storeId) {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "File bukti pembayaran tidak ditemukan." }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const filename = `receipt-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);

      return NextResponse.json({ success: true, url: `/uploads/receipts/${filename}` });
    }

    // 2. Upload Foto Profil Fisik Toko / Cabang / Logo (Store Profile & Branch Profile)
    if (type === "store-profile" || type === "branch-profile" || type === "store-logo") {
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "File gambar tidak ditemukan." }, { status: 400 });
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const inputBuffer = Buffer.from(bytes);

      // Inisialisasi sharp pipeline dengan EXIF auto-rotate
      let imagePipeline = sharp(inputBuffer).rotate();

      if (type === "store-logo") {
        imagePipeline = imagePipeline.resize({
          width: 500,
          height: 500,
          fit: "cover",
          withoutEnlargement: true,
        });
      } else {
        // Rasio 16:9 untuk foto storefront fisik gerai konter
        imagePipeline = imagePipeline.resize({
          width: 1280,
          height: 720,
          fit: "cover",
          withoutEnlargement: true,
        });
      }

      const outputBuffer = await imagePipeline.webp({ quality: 85 }).toBuffer();
      const subFolder = type === "branch-profile" ? "branches" : "stores";
      const uploadDir = path.join(process.cwd(), "public", "uploads", subFolder);
      await mkdir(uploadDir, { recursive: true });

      const filename = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
      await writeFile(path.join(uploadDir, filename), outputBuffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${subFolder}/${filename}`,
      });
    }

    // 3. Upload gambar produk katalog oleh toko
    const store = await prisma.store.findUnique({
      where: { id: user.storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        hasWatermark: true,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Data toko tidak ditemukan." }, { status: 404 });
    }

    // Ambil seluruh file gambar dari payload formData (key 'files' atau 'file')
    const files = formData.getAll("files") as File[];
    if (files.length === 0) {
      const singleFile = formData.get("file") as File | null;
      if (singleFile) files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "Tidak ada file gambar yang diunggah." }, { status: 400 });
    }

    // Batasi maks 8 gambar (sesuai spesifikasi galeri produk)
    const filesToProcess = files.slice(0, 8);

    // Target folder penyimpanan
    const storeUploadDir = path.join(process.cwd(), "public", "uploads", "products", store.slug);
    await mkdir(storeUploadDir, { recursive: true });

    // Watermark aktif jika tier bukan STARTER atau store.hasWatermark bernilai true
    const shouldWatermark = store.tier !== "STARTER" || store.hasWatermark === true;

    const uploadedUrls: string[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      // Inisialisasi sharp pipeline dengan EXIF auto-rotate
      let imagePipeline = sharp(inputBuffer).rotate();

      // Resize: max 1200x1200 fit inside without enlargement
      imagePipeline = imagePipeline.resize({
        width: 1200,
        height: 1200,
        fit: "inside",
        withoutEnlargement: true,
      });

      // Dapatkan metadata ukuran gambar setelah resize
      const resizedBuffer = await imagePipeline.toBuffer();
      const metadata = await sharp(resizedBuffer).metadata();
      const imgWidth = metadata.width || 800;
      const imgHeight = metadata.height || 600;

      let finalPipeline = sharp(resizedBuffer);

      // Terapkan Watermark Fisik Permanen (sharp.composite) untuk PRO & ADVANCE
      if (shouldWatermark) {
        const watermarkSvg = createWatermarkSvg(store.name, imgWidth, imgHeight);
        finalPipeline = finalPipeline.composite([
          {
            input: watermarkSvg,
            top: 0,
            left: 0,
          },
        ]);
      }

      // Kompresi ke format .webp kualitas 82
      const outputBuffer = await finalPipeline.webp({ quality: 82 }).toBuffer();

      // Simpan ke filesystem
      const timestamp = Date.now();
      const randomHash = Math.random().toString(36).substring(2, 8);
      const filename = `${timestamp}-${randomHash}.webp`;
      const filepath = path.join(storeUploadDir, filename);

      await writeFile(filepath, outputBuffer);

      const publicUrl = `/uploads/products/${store.slug}/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: "Gagal memproses gambar yang valid." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      count: uploadedUrls.length,
      watermarked: shouldWatermark,
    });
  } catch (error: any) {
    console.error("[API Upload Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses gambar." },
      { status: 500 }
    );
  }
}
