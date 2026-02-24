"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [brands, setBrands] = useState<string[]>([]);

  const category = searchParams.get("category") || "";
  const keyword = searchParams.get("keyword") || "";
  const company = searchParams.get("company") || "";
  const gender = searchParams.get("gender") || "";
  const discount = searchParams.get("discount") || "";
  const minprice = searchParams.get("minprice") || "";
  const maxprice = searchParams.get("maxprice") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // ✅ Check login
  useEffect(() => {
    fetch("/api/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const params = new URLSearchParams();

        // if category filter exists → send it
        const category = searchParams.get("category");
        if (category) params.set("category", category);

        const res = await fetch(`/api/brands?${params.toString()}`);
        const data = await res.json();

        setBrands(data.brands?.map((b: any) => b.name) || []);
      } catch {
        setBrands([]);
      }
    };

    fetchBrands();
  }, [searchParams]);

  // ✅ Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const query = new URLSearchParams({
        keyword,
        company,
        gender,
        minprice,
        maxprice,
        discount,
        category,
      });

      try {
        const res = await fetch(`/api/searchItem?${query.toString()}`);
        const data = await res.json();

        if (data.success) setProducts(data.data);
        else setProducts([]);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, company, gender, minprice, maxprice, discount, category]);

  // ✅ Update filter in URL
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="px-6 py-10 grid grid-cols-12 gap-6">
        {/* 🔹 LEFT SIDEBAR FILTER */}
        <div className="col-span-12 md:col-span-3">
          <div className="sticky top-24 bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4">Filters</h3>

            {/* BRAND */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Brand</p>

              {brands.length > 0 ? (
                brands.map((brand) => (
                  <label key={brand} className="block text-sm">
                    <input
                      type="radio"
                      name="company"
                      checked={company === brand}
                      onChange={() => updateFilter("company", brand)}
                    />{" "}
                    {brand}
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No brands found</p>
              )}

              <button
                onClick={() => updateFilter("company", "")}
                className="text-xs text-red-500 mt-1"
              >
                Clear
              </button>
            </div>

            {/* PRICE */}
            <div className="mb-6">
              <p className="font-semibold mb-3">Price</p>

              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={minprice}
                onChange={(e) => updateFilter("minprice", e.target.value)}
                className="w-full accent-indigo-600"
              />

              <input
                type="range"
                min={0}
                max={100000}
                step={1000}
                value={maxprice}
                onChange={(e) => updateFilter("maxprice", e.target.value)}
                className="w-full mt-2 accent-indigo-600"
              />

              <div className="flex justify-between text-sm mt-2">
                <span>₹{minprice}</span>
                <span>₹{maxprice}</span>
              </div>

              <button
                onClick={() => {
                  updateFilter("minprice", "");
                  updateFilter("maxprice", "");
                }}
                className="text-xs text-red-500 mt-2"
              >
                Clear
              </button>
            </div>

            {/* DISCOUNT */}
            <div className="mb-4">
              <p className="font-semibold mb-2">Discount</p>
              {[10, 20, 30, 40, 50].map((d) => (
                <label key={d} className="block text-sm">
                  <input
                    type="radio"
                    name="discount"
                    checked={discount === String(d)}
                    onChange={() => updateFilter("discount", String(d))}
                  />{" "}
                  {d}% or more
                </label>
              ))}

              <button
                onClick={() => updateFilter("discount", "")}
                className="text-xs text-red-500 mt-1"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* 🔹 PRODUCT GRID */}
        <div className="col-span-12 md:col-span-9">
          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((item, i) => (
                <ProductCard key={i} product={item} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
