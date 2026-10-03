import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

export default async function NewProductPage() {
  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

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
