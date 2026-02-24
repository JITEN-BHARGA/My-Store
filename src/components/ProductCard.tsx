"use client";

import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import StarRating from "./starreview";

type Props = {
  product: Product;
  isLoggedIn: boolean;
};

export default function ProductCard({ product, isLoggedIn }: Props) {
  const router = useRouter();

  const addToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product._id }),
    });

    alert("Added to cart ✅");
  };

  const toggleWishlist = async () => {
  if (!isLoggedIn) {
    router.push("/login");
    return;
  }

  await fetch("/api/wishlist/toggle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productId: product._id }),
  });

  alert("Wishlist updated ❤️");
};

  return (
    <div
      onClick={() => router.push(`/product/${product._id}`)}
      className="border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition"
    >
      {/* 🖼 IMAGE BOX */}
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src={product.imageURL[0]}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* 📦 PRODUCT NAME */}
      <h3 className="font-semibold mt-3">{product.name}</h3>

      {/* ⭐ RATING SECTION */}
      <div className="flex items-center gap-2 mt-1">
        <StarRating rating={Number(product.averageRating || 0)} />

        <span className="text-sm text-gray-700">
          {Number(product.averageRating || 0).toFixed(1)}
        </span>

        <span className="text-xs text-gray-500">
          ({product.reviewCount || 0})
        </span>
      </div>

      {/* 📝 DESCRIPTION */}
      <p className="mt-2 text-gray-500 line-clamp-2">{product.itemInfo}</p>

      {/* 💰 PRICE */}
      <div className="mt-2 flex items-center gap-4">
        <span className="text-lg font-bold text-gray-900">
          ₹{Number(product.finalPrice).toFixed(2)}
        </span>

        <span className="text-sm text-gray-500 line-through">
          ₹{Number(product.currentPrice).toFixed(2)}
        </span>

        <span className="text-sm text-green-600 font-semibold">
          {product.discount}% off
        </span>
      </div>

      {/* 🛒 ADD TO CART */}
      <div className="mt-3 flex gap-2">
        <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist();
        }}
        className="w-1/2 border border-gray-400 hover:border-red-500 text-gray-700 hover:text-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
          <span>♡ </span>
          Wishlist
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }}
          className="w-2/3 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add to Cart
        </button>
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-red-500 mt-2 text-center">
          Login to purchase
        </p>
      )}
    </div>
  );
}
