"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import StarRating from "@/components/starreview";

type Product = {
  _id: string;
  name: string;
  imageURL: string[];
  finalPrice: number;
  currentPrice: number;
  discount: number;
  itemInfo: string;
  averageRating?: number;
  reviewCount?: number;
};

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/wishlist");
        if (!res.ok) return;

        const data = await res.json();
        setProducts(data.wishlist?.productIds || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchWishlist();
  }, []);

  const addToCart = async (productId: string) => {
    await fetch("/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    alert("Added to cart ✅");
  };

  const removeFromWishlist = async (productId: string) => {
    await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId }),
    });

    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  return (
    <div className="text-gray-800 min-h-screen flex flex-col">
      {/* 🔝 NAVBAR */}
      <Navbar />

      {/* 🧾 PAGE TITLE */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900">
          My <span className="text-gradient">Wishlist</span> ❤️
        </h1>
      </div>

      {/* 📦 PRODUCT GRID */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-grow perspective-1500">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              onClick={() => router.push(`/product/${product._id}`)}
              className="group lift rounded-2xl p-4 cursor-pointer bg-white/85 border border-white/70 elev-2 animate-fade-up"
            >
              {/* 🖼 IMAGE BOX */}
              <div className="w-full h-64 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageURL?.[0]}
                  alt={product.name}
                  loading="lazy"
                  className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* 📦 NAME */}
              <h3 className="font-semibold mt-3 text-sm sm:text-base">
                {product.name}
              </h3>

              {/* ⭐ RATING */}
              <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                <StarRating rating={Number(product.averageRating || 0)} />

                <span className="text-sm">
                  {Number(product.averageRating || 0).toFixed(1)}
                </span>

                <span className="text-xs text-gray-500">
                  ({product.reviewCount || 0})
                </span>
              </div>

              {/* 📝 DESCRIPTION */}
              <p className="mt-2 text-gray-500 line-clamp-2 text-xs sm:text-sm">
                {product.itemInfo}
              </p>

              {/* 💰 PRICE */}
              <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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

              {/* ❤️ REMOVE + 🛒 ADD TO CART */}
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product._id);
                  }}
                  className="w-full sm:w-1/2 border border-red-400 hover:bg-red-500 hover:text-white text-red-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  ❤️ Remove
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product._id);
                  }}
                  className="w-full sm:w-1/2 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 rounded-3xl glass elev-2 animate-fade-up">
            <div className="text-6xl mb-4 animate-float">💝</div>
            <p className="text-xl font-bold text-gray-800">
              Your wishlist is empty
            </p>
            <p className="text-gray-500 mt-1">
              Tap the heart on any product to save it here.
            </p>
            <button
              onClick={() => router.push("/")}
              className="sheen mt-6 px-6 py-3 rounded-2xl text-white font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform"
            >
              Discover Products →
            </button>
          </div>
        )}
      </div>

      {/* 🔻 FOOTER */}
      <Footer />
    </div>
  );
}
