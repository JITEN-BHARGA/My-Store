"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Product } from "@/types/product";

export default function SimilarProducts({ productId }: { productId: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}/similar`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, [productId]);

  if (products.length === 0) return null;

  return (
    <section className="px-6 py-10 bg-white">
      {/* 🔥 TITLE */}
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Recommended for you
      </h2>

      {/* 🛍 PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {products.map((item, i) => (
          <ProductCard key={i} product={item} isLoggedIn={true} />
        ))}
      </div>
    </section>
  );
}
