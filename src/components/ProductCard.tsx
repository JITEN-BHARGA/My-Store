"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Product } from "@/types/product";
import StarRating from "./starreview";
import Tilt3D from "./Tilt3D";

type Props = {
  product: Product;
  isLoggedIn: boolean;
};

export default function ProductCard({ product, isLoggedIn }: Props) {
  const router = useRouter();
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    console.log("Adding to cart:", product._id);

    const res = await fetch("/api/cart/add", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product._id, action: "add" }),
    });

    if (res.ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1400);
    } else alert("Failed to add to cart");
  };

  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    setWished((w) => !w);

    await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product._id }),
    });
  };

  return (
    <Tilt3D
      max={8}
      lift={10}
      glare
      onClick={() => router.push(`/product/${product._id}`)}
      className="group relative rounded-2xl p-4 cursor-pointer flex flex-col bg-white/80 border border-white/70
        backdrop-blur-sm elev-2 hover:elev-3"
    >
      {/* Floating discount badge */}
      {Number(product.discount) > 0 && (
        <span
          className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-bold text-white
            bg-gradient-to-br from-rose-500 to-orange-500 shadow-[0_8px_18px_rgba(244,63,94,0.35)]"
          style={{ transform: "translateZ(40px)" }}
        >
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist heart */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist();
        }}
        aria-label="Toggle wishlist"
        className="absolute top-3 right-3 z-10 grid place-items-center w-9 h-9 rounded-full
          bg-white/80 border border-white/70 shadow-[0_4px_10px_rgba(24,26,40,0.1)]
          transition-transform duration-300 hover:scale-110 active:scale-90"
        style={{ transform: "translateZ(40px)" }}
      >
        <span className={`text-lg ${wished ? "scale-110" : ""} transition-transform`}>
          {wished ? "❤️" : "🤍"}
        </span>
      </button>

      {/* 🖼 IMAGE BOX */}
      <div
        className="w-full h-48 sm:h-56 md:h-64 lg:h-64 rounded-xl flex items-center justify-center overflow-hidden
          bg-gradient-to-b from-gray-50 to-gray-100"
        style={{ transform: "translateZ(30px)" }}
      >
        <img
          src={product.imageURL[0]}
          alt={product.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
        />
      </div>

      {/* 📦 PRODUCT NAME */}
      <h3
        className="font-semibold mt-3 text-sm sm:text-base md:text-base lg:text-lg text-gray-900 line-clamp-1"
        style={{ transform: "translateZ(20px)" }}
      >
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
      <div className="mt-2 flex items-baseline gap-2 text-sm sm:text-base">
        <span className="font-extrabold text-lg text-gray-900">
          ₹{Number(product.finalPrice).toFixed(2)}
        </span>

        <span className="text-gray-400 line-through text-xs sm:text-sm">
          ₹{Number(product.currentPrice).toFixed(2)}
        </span>

        <span className="text-green-600 font-semibold text-xs sm:text-sm">
          {product.discount}% off
        </span>
      </div>

      {/* 🛒 ADD TO CART */}
      <div className="mt-3 flex flex-col sm:flex-row gap-2" style={{ transform: "translateZ(15px)" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist();
          }}
          className="flex-1 border border-gray-300 hover:border-rose-400 text-gray-700 hover:text-rose-500 bg-white/60 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
        >
          <span>{wished ? "♥" : "♡"}</span> Wishlist
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart();
          }}
          className={`sheen flex-1 py-2 rounded-xl text-white text-sm sm:text-base font-semibold shadow-[0_8px_18px_rgba(79,70,229,0.3)] transition-all ${
            added
              ? "bg-gradient-to-br from-emerald-500 to-green-600"
              : "bg-gradient-to-br from-indigo-500 to-violet-600 hover:-translate-y-0.5"
          }`}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </button>
      </div>

      {!isLoggedIn && (
        <p className="text-xs text-rose-500 mt-2 text-center sm:text-sm">
          Login to purchase
        </p>
      )}
    </Tilt3D>
  );
}
