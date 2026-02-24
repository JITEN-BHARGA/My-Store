import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;   // ✅ unwrap params

  const product = await getProduct(id);

  if (!product) return notFound();

  return <ProductDetail product={product} />;
}