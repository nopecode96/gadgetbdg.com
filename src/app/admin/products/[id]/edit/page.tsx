import { notFound } from "next/navigation";
import { requireStoreOwnerOrStaff } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.id;

  const ctx = await requireStoreOwnerOrStaff();
  const { store } = ctx;

  const [product, branches] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id: productId,
        storeId: store.id, // ← Tenant isolation
      },
    }),
    prisma.branch.findMany({
      where: { storeId: store.id },
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        address: true,
      },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

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
        mode="edit"
        initialData={serializedProduct}
        branches={branches}
        redirectOnSuccess="/admin/products"
      />
    </div>
  );
}
