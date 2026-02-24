"use client";

import Navbar from "@/components/Navbar";
import { CategoryCard } from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

enum Catagory {
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Groceries",
  "Mobiles",
  "Accessories",
}

const categoryIcons: Record<string, string> = {
  Electronics: "💻",
  Fashion: "👕",
  "Home & Kitchen": "🏠",
  Beauty: "💄",
  Sports: "⚽",
  Books: "📚",
  Toys: "🧸",
  Groceries: "🛒",
  Mobiles: "📱",
  Accessories: "🎧",
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const categories = Object.values(Catagory).filter(
    (v) => typeof v === "string",
  ) as string[];
  ``;
  useEffect(() => {
    // ✅ Check login via cookie using /api/me
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me");

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/getItem");

        if (!res.ok) throw new Error("product not found...");

        const product = await res.json();

        setProducts(Array.isArray(product.data) ? product.data : []);
      } catch (error) {
        console.error(error);
        setProducts([]); // fallback
      }
    };

    checkLogin();
    fetchProduct();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      {/* HERO */}
      <section className="bg-indigo-600 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* 🧠 Headline */}
          <h2 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Mega Savings on Your Favorite Brands
          </h2>

          {/* 📝 Subtext */}
          <p className="mt-4 text-lg text-indigo-100 max-w-2xl mx-auto">
            Discover unbeatable deals on electronics, fashion, home essentials
            and more. Shop smarter, save bigger — only for a short time.
          </p>

          {/* 💸 Offer Highlight */}
          <p className="mt-3 text-2xl font-bold">
            Up to <span className="text-yellow-300">50% OFF</span> + Extra
            Cashback 💳
          </p>

          {/* ⭐ Trust Line */}
          <p className="mt-2 text-sm text-indigo-200">
            Trusted by 10,000+ happy customers • Fast delivery • Easy returns
          </p>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 py-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Shop by Category
        </h2>

        <div className="w-full overflow-x-auto">
          <div className="flex w-max min-w-full justify-between gap-4 px-4">
            {categories.map((cat) => (
              <div
                key={cat}
                onClick={() =>
                  router.push(`/search?category=${encodeURIComponent(cat)}`)
                }
                className="w-[70px] h-[72px] flex-shrink-0 rounded-full bg-white shadow flex items-center justify-center text-2xl cursor-pointer hover:scale-105 transition"
                title={cat}
              >
                {categoryIcons[cat]}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="px-6 py-10 bg-white">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((item, i) => (
            <ProductCard key={i} product={item} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      </section>

      {/* OFFER BANNER */}
      <section className="bg-orange-500 text-white text-center py-10">
        <h2 className="text-3xl font-bold">
          Flat 40% OFF on Limited Edition Products
        </h2>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
