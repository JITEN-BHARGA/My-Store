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
      className="border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition flex flex-col"
    >
      {/* 🖼 IMAGE BOX */}
      <div className="w-full h-48 sm:h-56 md:h-64 lg:h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
        <img
          src={product.imageURL[0]}
          alt={product.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* 📦 PRODUCT NAME */}
      <h3 className="font-semibold mt-3 text-sm sm:text-base md:text-base lg:text-lg">
        {product.name}
      </h3>

      {/* ⭐ RATING SECTION */}
      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
        <StarRating rating={Number(product.averageRating || 0)} />

        <span className="text-gray-700">
          {Number(product.averageRating || 0).toFixed(1)}
        </span>

        <span className="text-gray-500">({product.reviewCount || 0})</span>
      </div>

      {/* 📝 DESCRIPTION */}
      <p className="mt-2 text-gray-500 text-xs sm:text-sm line-clamp-2">
        {product.itemInfo}
      </p>

      {/* 💰 PRICE */}
      <div className="mt-2 flex items-center gap-4 text-sm sm:text-base">
        <span className="font-bold text-gray-900">
          ₹{Number(product.finalPrice).toFixed(2)}
        </span>

        <span className="text-gray-500 line-through">
          ₹{Number(product.currentPrice).toFixed(2)}
        </span>

        <span className="text-green-600 font-semibold">
          {product.discount}% off
        </span>
      </div>

      {/* 🛒 ADD TO CART */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className="flex-1 border border-gray-400 hover:border-red-500 text-gray-700 hover:text-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <span>♡</span> Wishlist
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }}
          className="flex-1 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-sm sm:text-base"
        >
          Add to Cart
        </button>
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-red-500 mt-2 text-center sm:text-sm">
          Login to purchase
        </p>
      )}
    </div>
  );
}
