"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Sparkles, Check, Tag } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface Product {
  id: string;
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
  };
  product: Product;
}

type PromoPreset = "none" | "flash-sale" | "payday" | "cod-ready";

export function StoryCardGenerator({ store, product }: StoryCardGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [promoPreset, setPromoPreset] = useState<PromoPreset>("none");

  const storeName = store?.name || "Official Store GadgetBdg";
  const storeSlug = store?.slug || "demo1";
  const storeAddress = store?.address || "Bandung Electronic Center (BEC), Bandung";
  const storeWa = store?.whatsapp || "62895389974414";

  // Cek hak watermark: aktif untuk paket PRO & ADVANCE atau jika hasWatermark === true
  const showWatermark = Boolean(store?.hasWatermark || (store?.tier && store.tier !== "STARTER"));

  useEffect(() => {
    drawStoryCanvas();
  }, [product, store, promoPreset]);

  function drawStoryCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas Dimensions 9:16 (1080 x 1920)
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

    let storeNameFontSize = 48;
    if (storeName.length > 30) {
      storeNameFontSize = 38;
    } else if (storeName.length > 20) {
      storeNameFontSize = 42;
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
    roundRect(ctx, W / 2 - 190, 215, 380, 52, 26);
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
      if (showWatermark) {
        ctx.save();
        ctx.translate(W / 2, imgY + imgH / 2);
        ctx.rotate((-15 * Math.PI) / 180);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        roundRect(ctx, -260, -45, 520, 90, 20);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        ctx.font = "900 46px -apple-system, BlinkMacSystemFont, sans-serif";
        ctx.fillText(storeName.toUpperCase(), 0, 5);
        ctx.restore();
      }

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
          badgeText = "⚡ SIAP COD / LANGSUNG CEK DI TOKO BEC";
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
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
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

      // Sisa kata
      if (currentLine && lines.length < maxLines) {
        // Jika baris terakhir dan masih ada sisa kata yang belum masuk
        const processedWordsCount = lines.join(" ").split(/\s+/).filter(Boolean).length;
        const remainingWords = words.slice(processedWordsCount);
        if (remainingWords.length > 0) {
          let lastLine = remainingWords.join(" ");
          // Jika melebihi maxWidth di baris terakhir, truncate dengan ellipsis
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
      const maxTextW = W - 160; // Safe horizontal padding: 80px left and right (W = 1080)
      
      const rawTitle = (product.name || `${product.brand} Smartphone`).trim();

      // Dynamic Font Sizing: sesuaikan jika nama sangat panjang
      let titleFontSize = 54;
      if (rawTitle.length > 40) {
        titleFontSize = 44;
      } else if (rawTitle.length > 28) {
        titleFontSize = 48;
      }

      ctx.font = `900 ${titleFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      const titleLines = wrapText(rawTitle, maxTextW, 2);
      const titleLineHeight = titleFontSize + 12;

      // Hitung posisi Y agar seimbang
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
      
      // Auto truncate note text cleanly within max bounds
      let safeNoteText = fullNoteText;
      const maxNoteW = W - 220;
      if (ctx.measureText(safeNoteText).width > maxNoteW) {
        while (ctx.measureText(safeNoteText + "...").width > maxNoteW && safeNoteText.length > 0) {
          safeNoteText = safeNoteText.slice(0, -1);
        }
        safeNoteText += "...";
      }
      ctx.fillText(safeNoteText, 110, minusY + 84);

      // 7. Footer CTA Box
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
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText("MINAT? SCREENSHOT STORY INI & HUBUNGI:", W / 2, ctaY + 65);

      ctx.fillStyle = "#fef08a";
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`WhatsApp: ${storeWa}`, W / 2, ctaY + 130);

      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.font = '600 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`Katalog Online: ${storeSlug}.gadgetbdg.com`, W / 2, ctaY + 188);

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

  function downloadStory() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    const link = document.createElement("a");
    const cleanName = product.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    link.download = `story-${storeSlug}-${cleanName}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setTimeout(() => setDownloading(false), 1500);
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Poster Story Medsos (9:16 HD)</h3>
              {showWatermark && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Watermark Aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Format portrait 1080x1920 siap share ke WhatsApp Story & Instagram Story
            </p>
          </div>
        </div>

        <button
          onClick={downloadStory}
          disabled={!rendered || downloading}
          className="px-4 py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Mengunduh...</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Download Poster (PNG)</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Badge Promo Selector */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Tag className="w-4 h-4 text-blue-600" />
          <span>Preset Banner Promo Poster:</span>
        </div>

        <select
          value={promoPreset}
          onChange={(e) => setPromoPreset(e.target.value as PromoPreset)}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">Normal (Spesifikasi Unit)</option>
          <option value="flash-sale">🔥 Flash Sale Terbatas</option>
          <option value="payday">💸 Promo Gajian (Payday)</option>
          <option value="cod-ready">⚡ Siap COD / Toko BEC</option>
        </select>
      </div>

      {/* Canvas Preview Container (Scaled Down for UI) */}
      <div className="flex justify-center bg-slate-900/90 rounded-2xl p-4 sm:p-6 overflow-hidden">
        <div className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 max-w-[280px] sm:max-w-[320px]">
          <canvas
            ref={canvasRef}
            className="w-full h-auto block select-none pointer-events-none"
            style={{ aspectRatio: "9/16" }}
          />
        </div>
      </div>
    </div>
  );
}
