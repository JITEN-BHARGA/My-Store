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
    <div className="bg-gray-50 text-gray-800 min-h-screen flex flex-col">
      {/* 🔝 NAVBAR */}
      <Navbar />

      {/* 🧾 PAGE TITLE */}
      <div className="max-w-full mx-auto w-full px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold">My Wishlist ❤️</h1>
      </div>

      {/* 📦 PRODUCT GRID */}
      <div className="max-w-full mx-auto w-full px-4 sm:px-6 pb-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-grow">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product._id}
              onClick={() => router.push(`/product/${product._id}`)}
              className="border rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition bg-white"
            >
              {/* 🖼 IMAGE BOX */}
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageURL?.[0]}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain"
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
          <p className="text-gray-500 text-center col-span-full">
            Your wishlist is empty.
          </p>
        )}
      </div>

      {/* 🔻 FOOTER */}
      <Footer />
    </div>
  );
}
