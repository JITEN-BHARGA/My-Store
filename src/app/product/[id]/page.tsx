import { notFound } from "next/navigation";
import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";
import ProductDetail from "./ProductDetail";

async function getProduct(id: string) {
  try {
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) return notFound();

  return <ProductDetail product={product} />;
}