import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { checkProductLimit } from "@/lib/guards/plan-guard";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, Rocket } from "lucide-react";

export const revalidate = 0;

export default async function NewProductPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const limitCheck = await checkProductLimit(store.id);

  if (!limitCheck.allowed) {
    return (
      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="mb-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Inventaris Produk</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-rose-200 shadow-xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Batas 50 Produk Starter Telah Tercapai
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {limitCheck.error || "Batas 50 produk untuk Paket Starter telah tercapai. Silakan upgrade ke Paket Pro untuk menambah produk tanpa batas."}
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-1.5 max-w-md mx-auto">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-blue-600" />
              Keuntungan Upgrade ke Paket Pro:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
              <li>Kapasitas Produk Tanpa Batas (Unlimited)</li>
              <li>Bisa gunakan Custom Domain Toko (.com / .id)</li>
              <li>Prioritas Server &amp; Layanan VIP WhatsApp</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/subscription"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Upgrade ke Paket Pro Sekarang</span>
            </Link>
            <Link
              href="/admin/products"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition"
            >
              Kembali ke Inventaris
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const branches = await prisma.branch.findMany({
    where: { storeId: store.id },
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      address: true,
    },
  });

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
      <div className="mb-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Inventaris Produk</span>
        </Link>
      </div>

      <ProductForm
        mode="create"
        branches={branches}
        redirectOnSuccess="/admin/products"
      />
    </div>
  );
}
