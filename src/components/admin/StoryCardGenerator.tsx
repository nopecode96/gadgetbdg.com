"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  Tag,
  Info,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface Product {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  price: number;
  ramRom: string;
  batteryHealth: string | number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  minusNotes: string | null;
  status: string;
  images?: string[];
}

interface StoryCardGeneratorProps {
  store?: {
    name: string;
    slug: string;
    address: string | null;
    whatsapp: string;
    templateId?: string;
    tier?: string;
    hasWatermark?: boolean;
    customDomain?: string | null;
    logoUrl?: string | null;
  };
  product: Product;
}

type PromoPreset = "none" | "flash-sale" | "payday" | "cod-ready";

export function StoryCardGenerator({ store, product }: StoryCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [promoPreset, setPromoPreset] = useState<PromoPreset>("none");
  const [toast, setToast] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);

  const storeName = store?.name || "Official Store GadgetBdg";
  const storeSlug = store?.slug || "demo1";
  const storeAddress = store?.address || "Bandung Electronic Center (BEC), Bandung";
  const storeWa = store?.whatsapp || "62895389974414";
  const catalogDomain = store?.customDomain || (store?.slug ? `${store.slug}.gadgetbdg.com` : "gadgetbdg.com");
  const catalogUrl = `https://${catalogDomain}`;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    drawStoryCanvas();
  }, [product, store, promoPreset]);

  function drawStoryCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas Dimensions 9:16 (1080 x 1920) HD
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const isGaming = store?.templateId === "dark-gaming";

    // 1. Draw Background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, H);
    if (isGaming) {
      bgGradient.addColorStop(0, "#090d16");
      bgGradient.addColorStop(0.5, "#0f172a");
      bgGradient.addColorStop(1, "#020617");
    } else {
      bgGradient.addColorStop(0, "#0f172a");
      bgGradient.addColorStop(0.3, "#1e293b");
      bgGradient.addColorStop(1, "#0f172a");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);

    // Decorative Glow Circles
    ctx.save();
    ctx.filter = "blur(120px)";
    ctx.fillStyle = isGaming ? "rgba(16, 185, 129, 0.25)" : "rgba(37, 99, 235, 0.3)";
    ctx.beginPath();
    ctx.arc(W / 2, 400, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isGaming ? "rgba(6, 182, 212, 0.2)" : "rgba(147, 51, 234, 0.25)";
    ctx.beginPath();
    ctx.arc(W / 2, 1400, 350, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Header Section (Store info with safe horizontal padding)
    ctx.textAlign = "center";
    const headerMaxW = W - 160;

    let storeNameFontSize = 46;
    if (storeName.length > 30) {
      storeNameFontSize = 36;
    } else if (storeName.length > 20) {
      storeNameFontSize = 40;
    }
    ctx.fillStyle = "#ffffff";
    ctx.font = `900 ${storeNameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    // Auto truncate header store name if too wide
    let safeStoreName = storeName.toUpperCase();
    if (ctx.measureText(safeStoreName).width > headerMaxW) {
      while (ctx.measureText(safeStoreName + "...").width > headerMaxW && safeStoreName.length > 0) {
        safeStoreName = safeStoreName.slice(0, -1);
      }
      safeStoreName += "...";
    }
    ctx.fillText(safeStoreName, W / 2, 120);

    ctx.fillStyle = isGaming ? "#34d399" : "#93c5fd";
    ctx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    let safeAddress = `📍 ${storeAddress}`;
    if (ctx.measureText(safeAddress).width > headerMaxW) {
      while (ctx.measureText(safeAddress + "...").width > headerMaxW && safeAddress.length > 0) {
        safeAddress = safeAddress.slice(0, -1);
      }
      safeAddress += "...";
    }
    ctx.fillText(safeAddress, W / 2, 175);

    // Status Ribbon
    ctx.fillStyle = isGaming ? "#10b981" : "#2563eb";
    roundRect(ctx, W / 2 - 200, 215, 400, 52, 26);
    ctx.fill();

    ctx.fillStyle = isGaming ? "#022c22" : "#ffffff";
    ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText("READY STOCK • UNIT TERUJI", W / 2, 250);

    // 3. Main Product Image (Card Container)
    const imgX = 80;
    const imgY = 300;
    const imgW = W - 160;
    const imgH = 680;

    // Draw container shadow & background
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = "#1e293b";
    roundRect(ctx, imgX, imgY, imgW, imgH, 36);
    ctx.fill();
    ctx.restore();

    const drawOverlaysAndWatermark = () => {
      // 1. Watermark Protection pada Kanvas Poster
      ctx.save();
      ctx.translate(W / 2, imgY + imgH / 2);
      ctx.rotate((-15 * Math.PI) / 180);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      roundRect(ctx, -270, -45, 540, 90, 20);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = "900 44px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(storeName.toUpperCase(), 0, 5);
      ctx.restore();

      // 2. Preset Badge Promo di Bagian Atas Gambar
      if (promoPreset !== "none") {
        ctx.save();
        let badgeText = "";
        let badgeBg = "#ef4444";
        let badgeTextColor = "#ffffff";

        if (promoPreset === "flash-sale") {
          badgeText = "🔥 FLASH SALE HANYA HARI INI!";
          badgeBg = "#dc2626";
        } else if (promoPreset === "payday") {
          badgeText = "💸 PROMO SPESIAL GAJIAN • CASHBACK TOKO";
          badgeBg = "#059669";
        } else if (promoPreset === "cod-ready") {
          badgeText = "⚡ SIAP COD / LANGSUNG CEK DI TOKO";
          badgeBg = "#2563eb";
        }

        ctx.fillStyle = badgeBg;
        roundRect(ctx, imgX + 30, imgY + 30, imgW - 60, 64, 18);
        ctx.fill();

        ctx.fillStyle = badgeTextColor;
        ctx.font = "900 28px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(badgeText, W / 2, imgY + 72);
        ctx.restore();
      }
    };

    const fallbackDraw = () => {
      ctx.fillStyle = "#334155";
      roundRect(ctx, imgX, imgY, imgW, imgH, 36);
      ctx.fill();
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FOTO UNIT HP SECOND", W / 2, imgY + imgH / 2);

      drawOverlaysAndWatermark();
      renderDetails();
    };

    if (product.images && product.images.length > 0) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = product.images[0];
      img.onload = () => {
        ctx.save();
        roundRect(ctx, imgX, imgY, imgW, imgH, 36);
        ctx.clip();
        drawImageCover(ctx, img, imgX, imgY, imgW, imgH);
        ctx.restore();

        drawOverlaysAndWatermark();
        renderDetails();
      };
      img.onerror = () => {
        fallbackDraw();
      };
    } else {
      fallbackDraw();
    }

    function wrapText(
      text: string,
      maxWidth: number,
      maxLines: number = 2
    ): string[] {
      const words = text.split(/\s+/);
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx!.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
          if (lines.length === maxLines - 1) {
            break;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine && lines.length < maxLines) {
        const processedWordsCount = lines.join(" ").split(/\s+/).filter(Boolean).length;
        const remainingWords = words.slice(processedWordsCount);
        if (remainingWords.length > 0) {
          let lastLine = remainingWords.join(" ");
          while (ctx!.measureText(lastLine + "...").width > maxWidth && lastLine.length > 0) {
            lastLine = lastLine.slice(0, -1).trim();
          }
          if (lastLine !== remainingWords.join(" ")) {
            lines.push(lastLine + "...");
          } else {
            lines.push(lastLine);
          }
        }
      }

      return lines.length > 0 ? lines : [text];
    }

    function renderDetails() {
      if (!ctx) return;

      // 4. Product Name & Price (Multi-line wrap, safe padding & proportional typography)
      ctx.textAlign = "center";
      const maxTextW = W - 160;
      
      const rawTitle = (product.name || `${product.brand} Smartphone`).trim();

      let titleFontSize = 54;
      if (rawTitle.length > 40) {
        titleFontSize = 42;
      } else if (rawTitle.length > 28) {
        titleFontSize = 48;
      }

      ctx.font = `900 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const titleLines = wrapText(rawTitle, maxTextW, 2);
      const titleLineHeight = titleFontSize + 12;

      const titleStartY = titleLines.length === 1 ? 1045 : 1025;
      ctx.fillStyle = "#ffffff";
      titleLines.forEach((line, idx) => {
        ctx.fillText(line, W / 2, titleStartY + idx * titleLineHeight);
      });

      // Price Tag Box
      const priceY = titleStartY + (titleLines.length - 1) * titleLineHeight + 82;
      ctx.fillStyle = isGaming ? "#10b981" : "#38bdf8";
      ctx.font = '900 64px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(formatRupiah(product.price), W / 2, priceY);

      // 5. Specification Badges (Grid of 4 badges)
      const badgeY = 1205;
      const badgeH = 82;
      const badgeW = 430;
      const badgeX1 = 80;
      const badgeX2 = W - 80 - badgeW; // 570

      // Badge 1: IMEI Status
      drawBadge(
        ctx,
        badgeX1,
        badgeY,
        badgeW,
        badgeH,
        "STATUS IMEI",
        product.imeiStatus || "Resmi Terdaftar",
        isGaming ? "#064e3b" : "#1e3a8a",
        isGaming ? "#34d399" : "#60a5fa"
      );

      // Badge 2: RAM / Internal Storage
      drawBadge(
        ctx,
        badgeX2,
        badgeY,
        badgeW,
        badgeH,
        "STORAGE / RAM",
        product.ramRom || "Standar Pabrik",
        "#334155",
        "#f8fafc"
      );

      // Badge 3: Kondisi Fisik
      drawBadge(
        ctx,
        badgeX1,
        badgeY + 102,
        badgeW,
        badgeH,
        "KONDISI FISIK",
        product.condition || "Mulus Normal",
        "#334155",
        "#38bdf8"
      );

      // Badge 4: Battery Health or Kelengkapan
      const numericBh = product.batteryHealth ? parseInt(String(product.batteryHealth).replace(/\D/g, ""), 10) : 0;
      const bhText = product.batteryHealth
        ? String(product.batteryHealth).includes("%")
          ? `BH ${product.batteryHealth}`
          : `BH ${product.batteryHealth}%`
        : "Tested 100% Normal";
      drawBadge(
        ctx,
        badgeX2,
        badgeY + 102,
        badgeW,
        badgeH,
        product.batteryHealth ? "BATTERY HEALTH" : "KELENGKAPAN",
        product.batteryHealth ? bhText : product.completeness || "Fullset Box",
        numericBh > 0 && numericBh < 80 ? "#78350f" : "#14532d",
        numericBh > 0 && numericBh < 80 ? "#fcd34d" : "#4ade80"
      );

      // 6. Minus Notes Bar (Transparan dengan padding & wrap)
      const minusY = 1435;
      ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
      roundRect(ctx, 80, minusY, W - 160, 115, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.stroke();

      ctx.textAlign = "left";
      ctx.fillStyle = "#cbd5e1";
      ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("📋 KELENGKAPAN & CATATAN UNIT:", 110, minusY + 42);

      ctx.fillStyle = "#94a3b8";
      ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const note = product.minusNotes || "No minus, fungsi 100% normal siap pakai, garansi toko 30 hari!";
      const fullNoteText = `• ${product.completeness || "Unit"} • ${note}`;
      
      let safeNoteText = fullNoteText;
      const maxNoteW = W - 220;
      if (ctx.measureText(safeNoteText).width > maxNoteW) {
        while (ctx.measureText(safeNoteText + "...").width > maxNoteW && safeNoteText.length > 0) {
          safeNoteText = safeNoteText.slice(0, -1);
        }
        safeNoteText += "...";
      }
      ctx.fillText(safeNoteText, 110, minusY + 84);

      // 7. Footer CTA Box (Link Katalog Lengkap di Bio Toko Kami)
      const ctaY = 1585;
      const ctaGrad = ctx.createLinearGradient(80, ctaY, W - 80, ctaY);
      if (isGaming) {
        ctaGrad.addColorStop(0, "#059669");
        ctaGrad.addColorStop(1, "#10b981");
      } else {
        ctaGrad.addColorStop(0, "#2563eb");
        ctaGrad.addColorStop(1, "#4f46e5");
      }
      ctx.fillStyle = ctaGrad;
      roundRect(ctx, 80, ctaY, W - 160, 230, 36);
      ctx.fill();

      ctx.textAlign = "center";
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("MINAT? SCREENSHOT STORY INI & HUBUNGI KAMI", W / 2, ctaY + 60);

      ctx.fillStyle = "#fef08a";
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`WhatsApp: ${storeWa}`, W / 2, ctaY + 120);

      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("👉 Link Katalog Lengkap di Bio Toko Kami", W / 2, ctaY + 172);

      ctx.fillStyle = "#bfdbfe";
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(catalogDomain, W / 2, ctaY + 208);

      setRendered(true);
    }
  }

  function drawBadge(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    val: string,
    bgColor: string,
    textColor: string
  ) {
    ctx.fillStyle = bgColor;
    roundRect(ctx, x, y, w, h, 18);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(label, x + 24, y + 32);

    ctx.fillStyle = textColor;
    const maxValW = w - 48;
    let valFontSize = 28;
    ctx.font = `bold ${valFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

    let safeVal = val;
    if (ctx.measureText(safeVal).width > maxValW) {
      valFontSize = 24;
      ctx.font = `bold ${valFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    }

    if (ctx.measureText(safeVal).width > maxValW) {
      while (ctx.measureText(safeVal + "...").width > maxValW && safeVal.length > 0) {
        safeVal = safeVal.slice(0, -1).trim();
      }
      safeVal += "...";
    }

    ctx.fillText(safeVal, x + 24, y + 66);
  }

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Draw image with object-fit: cover
  function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number
  ) {
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) {
      ctx.drawImage(img, x, y, w, h);
      return;
    }

    const imgRatio = iw / ih;
    const targetRatio = w / h;
    let sx = 0,
      sy = 0,
      sWidth = iw,
      sHeight = ih;

    if (imgRatio > targetRatio) {
      // Image wider than target
      sWidth = ih * targetRatio;
      sx = (iw - sWidth) / 2;
    } else {
      // Image taller than target
      sHeight = iw / targetRatio;
      sy = (ih - sHeight) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
  }

  function triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Action 1: Web Share API Native Intent
  async function shareToStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSharing(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) {
        throw new Error("Gagal mengonversi poster ke format gambar.");
      }

      const cleanName = (product.slug || product.name || "produk").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const timestamp = Date.now();
      const fileName = `story-${cleanName}-${timestamp}.png`;
      const imageFile = new File([blob], fileName, { type: "image/png" });

      const shareData = {
        title: `Promo ${product.name}`,
        text: `Ready unit ${product.name}! Cek katalog lengkap di link bio kami: ${catalogUrl}`,
        files: [imageFile],
      };

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [imageFile] })
      ) {
        await navigator.share(shareData);
        setToast({
          type: "success",
          message: "Native share terbuka! Pilih WhatsApp Story, Instagram Story, atau medsos lainnya.",
        });
      } else {
        // Fallback otomatis jika di desktop/browser tidak mendukung:
        triggerDownload(blob, fileName);
        setToast({
          type: "info",
          message: "Browser tidak mendukung native share. Poster otomatis diunduh.",
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Share failed or aborted:", err);
        downloadStory();
      }
    } finally {
      setSharing(false);
    }
  }

  // Action 2: Direct HD Download
  async function downloadStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      const cleanName = (product.slug || product.name || "produk").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const timestamp = Date.now();
      const fileName = `story-${cleanName}-${timestamp}.png`;

      if (blob) {
        triggerDownload(blob, fileName);
      } else {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
      }

      setToast({
        type: "success",
        message: `Poster 9:16 HD (${fileName}) berhasil diunduh ke galeri/perangkat!`,
      });
    } catch (err) {
      console.error("Download error:", err);
      setToast({
        type: "error",
        message: "Gagal mengunduh poster gambar.",
      });
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  }

  // Action 3: Copy Format Caption
  function copyStoryCaption() {
    const cleanWa = (store?.whatsapp || "081234567890").replace(/\D/g, "").replace(/^0/, "62");
    const caption =
      `🔥 READY UNIT ISTIMEWA: ${product.name} 🔥\n\n` +
      `💰 Harga: ${formatRupiah(product.price)}\n` +
      `📱 Varian: ${product.ramRom}\n` +
      `✨ Kondisi: ${product.condition}\n` +
      `🛡️ Garansi IMEI: ${product.imeiStatus || "Resmi Terdaftar"}\n` +
      (product.batteryHealth ? `🔋 Battery Health: ${product.batteryHealth}%\n` : "") +
      `📦 Kelengkapan: ${product.completeness}\n` +
      (product.minusNotes ? `⚠️ Catatan: ${product.minusNotes}\n` : "✅ Jaminan tested normal 100% siap pakai!\n") +
      `\n👉 Cek foto detail & stok katalog lengkap di Link Bio:\n` +
      `🔗 ${catalogUrl}\n\n` +
      `📲 WhatsApp Fast Response: https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo min, saya tertarik dengan unit ${product.name} di story katalog.`)}`;

    navigator.clipboard.writeText(caption);
    setCopiedCaption(true);
    setToast({
      type: "success",
      message: "Format caption story siap posting berhasil disalin ke clipboard!",
    });
    setTimeout(() => setCopiedCaption(false), 2500);
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Poster Story Medsos (9:16 HD)</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Watermark Toko Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Format portrait 1080x1920 siap share ke WhatsApp Story, Instagram Story, TikTok, & Facebook
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={promoPreset}
            onChange={(e) => setPromoPreset(e.target.value as PromoPreset)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">Normal (Spesifikasi Unit)</option>
            <option value="flash-sale">🔥 Flash Sale Terbatas</option>
            <option value="payday">💸 Promo Gajian (Payday)</option>
            <option value="cod-ready">⚡ Siap COD / Toko BEC</option>
          </select>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 border transition ${
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : toast.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : toast.type === "error" ? (
              <Info className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-1 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ACTION BAR: DUAL ACTION + CAPTION COPY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tombol 1: Bagikan ke Story (Web Share API Native Intent) */}
        <button
          onClick={shareToStory}
          disabled={!rendered || sharing}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          {sharing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Menyiapkan Share...</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Bagikan ke Story</span>
            </>
          )}
        </button>

        {/* Tombol 2: Unduh Gambar 9:16 (HD) */}
        <button
          onClick={downloadStory}
          disabled={!rendered || downloading}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mengunduh...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Gambar (HD)</span>
            </>
          )}
        </button>

        {/* Tombol 3: Salin Format Caption */}
        <button
          onClick={copyStoryCaption}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center gap-2 shadow-sm transition"
        >
          {copiedCaption ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Caption Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Salin Format Caption</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas Preview Container (Scaled Down for UI) */}
      <div className="flex flex-col items-center justify-center bg-slate-950/95 rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 max-w-[280px] sm:max-w-[320px]">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block select-none pointer-events-none"
            style={{ aspectRatio: "9/16" }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          Preview poster 1080x1920 (HD). Klik tombol di atas untuk share atau unduh.
        </p>
      </div>
    </div>
  );
}
