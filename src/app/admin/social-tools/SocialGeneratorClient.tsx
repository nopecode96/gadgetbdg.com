"use client";

import { useState } from "react";
import { Copy, Check, Share2, Sparkles, Smartphone, Instagram, Facebook } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { StoryCardGenerator } from "@/components/admin/StoryCardGenerator";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  ramRom: string;
  batteryHealth: number | null;
  imeiStatus: string;
  completeness: string;
  condition: string;
  minusNotes: string | null;
  status: string;
}

export function SocialGeneratorClient({
  store,
  products,
}: {
  store?: any;
  products: Product[];
}) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || "");
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-400 text-xs border border-slate-200">
        Belum ada produk untuk digenerate captionnya.
      </div>
    );
  }

  // Construct captions
  const fbMarketplaceCaption =
    `🔥 DIJUAL: ${product.name} 🔥\n\n` +
    `💰 Harga: ${formatRupiah(product.price)} (Nego Santai di Toko)\n\n` +
    `Spesifikasi & Kondisi Unit:\n` +
    `✅ RAM / Internal: ${product.ramRom}\n` +
    `✅ Kondisi Fisik: ${product.condition}\n` +
    `✅ Kelengkapan: ${product.completeness}\n` +
    `✅ Status IMEI: ${product.imeiStatus}\n` +
    (product.batteryHealth ? `✅ Battery Health: ${product.batteryHealth}%\n` : "") +
    (product.minusNotes ? `⚠️ Catatan Minus: ${product.minusNotes}\n` : "✅ Minus: Tidak ada (Mulus normal siap pakai)\n") +
    `\n📍 Lokasi Toko: ${store?.address || "Bandung Electronic Center (BEC)"}\n` +
    `📲 WhatsApp Fast Response: ${store?.whatsapp || "081234567890"}\n` +
    `🤝 Siap COD Toko / Kirim se-Bandung Raya via GoSend`;

  const igCaption =
    `Ready stock second istimewa! ✨\n\n` +
    `${product.name}\n` +
    `Varian: ${product.ramRom}\n` +
    `Price: ${formatRupiah(product.price)}\n\n` +
    `Detail Unit:\n` +
    `• ${product.condition}\n` +
    `• ${product.completeness}\n` +
    `• IMEI: ${product.imeiStatus}\n` +
    (product.batteryHealth ? `• Battery Health: ${product.batteryHealth}%\n` : "") +
    (product.minusNotes ? `• Minus: ${product.minusNotes}\n` : "• No minus, 100% tested\n") +
    `\nBerminat langsung klik link di bio / WhatsApp admin yaa! 👇\n` +
    `WA: ${store?.whatsapp || "081234567890"}\n\n` +
    `#hpsecondbandung #gadgetbandung #jualhpsecond #applebandung #samsungbandung #becbandung`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Generator Media & Caption Medsos</h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate caption teks Facebook Marketplace / Instagram serta poster grafis Story 9:16 siap posting.
        </p>
      </div>

      {/* Select Unit */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Pilih Unit:</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {formatRupiah(p.price)} ({p.condition})
            </option>
          ))}
        </select>
      </div>

      {/* 9:16 Canvas Story Card Generator */}
      <StoryCardGenerator store={store} product={product as any} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facebook Marketplace Template */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook Marketplace & Grup Jual Beli</span>
              </div>
            </div>

            <textarea
              readOnly
              rows={12}
              value={fbMarketplaceCaption}
              className="w-full p-3 rounded-xl bg-slate-50 text-slate-800 text-xs font-mono border border-slate-200 resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={() => copyToClipboard(fbMarketplaceCaption, "fb")}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition shadow-sm"
          >
            {copiedType === "fb" ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Salin Caption Facebook
              </>
            )}
          </button>
        </div>

        {/* Instagram Post Template */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Instagram Feed / Reels Caption</span>
              </div>
            </div>

            <textarea
              readOnly
              rows={12}
              value={igCaption}
              className="w-full p-3 rounded-xl bg-slate-50 text-slate-800 text-xs font-mono border border-slate-200 resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={() => copyToClipboard(igCaption, "ig")}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 transition shadow-sm"
          >
            {copiedType === "ig" ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Tersalin ke Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Salin Caption Instagram
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
