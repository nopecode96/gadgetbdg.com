"use client";

import React from "react";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building2,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";
import { StoreData } from "./types";
import { getTemplateConfig } from "@/lib/constants/templates";

interface StoreAboutViewProps {
  store: StoreData;
  theme?: string;
}

export function StoreAboutView({ store, theme }: StoreAboutViewProps) {
  const currentThemeId = theme || store.templateId || "minimal-clean";
  const themeConfig = getTemplateConfig(currentThemeId);
  const { colors } = themeConfig;
  const isDark = colors.isDark;

  let cleanWa = (store.whatsapp || "").replace(/\D/g, "");
  if (cleanWa.startsWith("0")) cleanWa = "62" + cleanWa.slice(1);

  const defaultMapsLink =
    store.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.address || `${store.name} Bandung`
    )}`;

  const branches = store.branches || [];

  return (
    <div className="p-4 space-y-4 animate-fade-in text-xs font-sans pb-10">
      {/* 1. Storefront Photo / Banner */}
      <div className={`rounded-3xl overflow-hidden relative border ${colors.borderContainer} shadow-lg`}>
        <div className="aspect-[16/9] w-full bg-slate-800 relative">
          <img
            src={
              store.bannerUrl ||
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&auto=format&fit=crop&q=80"
            }
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 text-white">
            <span className={`text-[10px] font-mono font-black uppercase tracking-wider ${colors.accentText}`}>
              OFFLINE STORE RESMI BANDUNG
            </span>
            <h2 className="text-xl font-black leading-tight tracking-tight mt-0.5">{store.name}</h2>
            <p className="text-xs text-slate-300 font-medium">Spesialis HP Second Original Bergaransi</p>
          </div>
        </div>
      </div>

      {/* 2. Direct Store WhatsApp Contact Card */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-sm">
            <MessageCircle className="w-4 h-4 text-emerald-500 fill-current" />
            <span>Kontak &amp; Hotline Resmi</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Fast Response
          </span>
        </div>

        <p className={`text-xs ${colors.textSecondary}`}>
          Butuh foto detail kondisi unit, nego tipis, atau konfirmasi ketersediaan stok fisik sebelum datang ke toko? Hubungi kami langsung.
        </p>

        <a
          href={`https://wa.me/${cleanWa}?text=Halo%20${encodeURIComponent(
            store.name
          )},%20saya%20ingin%20tanya%20stok%20HP%20second`}
          target="_blank"
          rel="noreferrer"
          className="w-full py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          <span>Chat Kasir Toko via WhatsApp</span>
        </a>
      </div>

      {/* 3. Operational Hours & Info Card */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className={`flex items-center justify-between border-b pb-2.5 ${colors.cardBorder}`}>
          <div className="flex items-center gap-2 font-black text-sm">
            <Clock className={`w-4 h-4 ${colors.accentText}`} />
            <span>Jam Operasional Toko Fisik</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Buka Setiap Hari
          </span>
        </div>

        <div className={`space-y-2 text-xs ${colors.textSecondary}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Senin - Sabtu:</span>
            <b className={colors.textPrimary}>10:00 - 20:30 WIB</b>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Minggu &amp; Hari Libur:</span>
            <b className={colors.textPrimary}>11:00 - 19:30 WIB</b>
          </div>
        </div>
      </div>

      {/* 4. Offline Address / Multi-Branch Locations */}
      {branches.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-black text-sm px-1">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Cabang Resmi Toko ({branches.length})</span>
          </div>

          <div className="space-y-2.5">
            {branches.map((b) => {
              const bMaps =
                b.mapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  b.address || `${store.name} ${b.name}`
                )}`;
              let bCleanWa = (b.phone || store.whatsapp || "").replace(/\D/g, "");
              if (bCleanWa.startsWith("0")) bCleanWa = "62" + bCleanWa.slice(1);

              return (
                <div
                  key={b.id}
                  className={`rounded-3xl p-4 border space-y-2.5 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{b.name}</span>
                    </div>
                    {b.isMain && (
                      <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                        PUSAT
                      </span>
                    )}
                  </div>

                  <p className={`text-xs leading-relaxed ${colors.textSecondary}`}>{b.address}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={bMaps}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 py-2 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1.5 transition ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                          : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Petunjuk Arah</span>
                    </a>

                    <a
                      href={`https://wa.me/${bCleanWa}?text=Halo%20${encodeURIComponent(
                        store.name
                      )}%20${encodeURIComponent(b.name)},%20apakah%20stok%20tersedia?`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-2xl font-bold text-[11px] flex items-center justify-center gap-1 text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs"
                    >
                      <MessageCircle className="w-3 h-3 fill-current" />
                      <span>WA</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={`rounded-3xl p-4 border space-y-3 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
        >
          <div className={`flex items-center gap-2 font-black text-sm border-b pb-2.5 ${colors.cardBorder}`}>
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Alamat Fisik Markas Toko</span>
          </div>

          <p className={`text-xs leading-relaxed ${colors.textSecondary}`}>
            {store.address || "Bandung Electronic Center (BEC) Lantai 1 Blok C-05, Jl. Purnawarman No. 13-15, Bandung"}
          </p>

          <a
            href={defaultMapsLink}
            target="_blank"
            rel="noreferrer"
            className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Petunjuk Arah Google Maps</span>
          </a>
        </div>
      )}

      {/* 5. Trust Badges & Guarantee Policy */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center gap-2 font-black text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-500" />
          <span>Garansi &amp; Jaminan Transaksi</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className={colors.textSecondary}>
              <b className={colors.textPrimary}>Bebas Blokir IMEI Seumur Hidup:</b> Semua unit berstatus resmi iBox/SEIN atau terdaftar Bea Cukai.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className={colors.textSecondary}>
              <b className={colors.textPrimary}>Garansi Toko 30 Hari:</b> Tukar unit jika ada kendala hardware non-human error.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className={colors.textSecondary}>
              <b className={colors.textPrimary}>Cek Fisik Sepuasnya:</b> COD di markas toko, uji kamera, layar, speaker, dan 3uTools sebelum bayar.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Customer Trust & Reviews Widget */}
      <div
        className={`rounded-3xl p-4 border space-y-3 shadow-sm ${colors.cardBg} ${colors.cardBorder} ${colors.textPrimary}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Reputasi &amp; Ulasan Pembeli</span>
          </div>
          <span className="text-xs font-black text-amber-500 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            4.9 / 5.0
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className={`p-3 rounded-2xl border ${colors.cardBorder} ${isDark ? "bg-slate-900/60" : "bg-neutral-50"}`}>
            <div className="flex items-center gap-1 text-amber-400 mb-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <p className={`text-xs italic leading-relaxed ${colors.textSecondary}`}>
              "Beli iPhone 15 Pro di sini kondisi mulus 99% persis foto katalog. IMEI iBox dicek kemenperin aktif, baterai awet. Pelayanan ramah banget di BEC!"
            </p>
            <span className="text-[10px] text-neutral-400 block mt-1.5 font-medium">— Dimas R., Dago Bandung</span>
          </div>

          <div className={`p-3 rounded-2xl border ${colors.cardBorder} ${isDark ? "bg-slate-900/60" : "bg-neutral-50"}`}>
            <div className="flex items-center gap-1 text-amber-400 mb-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <p className={`text-xs italic leading-relaxed ${colors.textSecondary}`}>
              "Tukar tambah Samsung S22 ke S24 Ultra cepet banget, taksiran harga transparan gak pake ribet. Pindah data dibantuin kasir sampe selesai."
            </p>
            <span className="text-[10px] text-neutral-400 block mt-1.5 font-medium">— Sarah P., Buahbatu Bandung</span>
          </div>
        </div>
      </div>
    </div>
  );
}
