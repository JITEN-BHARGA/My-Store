"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/product";

function SearchContent() {
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
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);

        const res = await fetch(`/api/brands?${params.toString()}`);
        const data = await res.json();

        setBrands(data.brands?.map((b: any) => b.name) || []);
      } catch {
        setBrands([]);
      }
    };

    fetchBrands();
  }, [category]);

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

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-12 gap-6">
        {/* 🔹 LEFT SIDEBAR FILTER */}
        <div className="col-span-12 md:col-span-3">
          <div className="sticky top-28 glass p-5 rounded-2xl elev-2 w-full">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Filters</h3>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 bg-white/80 border border-white/70 elev-1">
                  <div className="skeleton w-full h-56 rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded mt-4" />
                  <div className="skeleton h-4 w-1/2 rounded mt-2" />
                  <div className="skeleton h-9 w-full rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 rounded-3xl glass elev-2">
              <div className="text-6xl mb-4 animate-float">🔍</div>
              <p className="text-xl font-bold text-gray-800">No products found</p>
              <p className="text-gray-500 mt-1">
                Try adjusting your filters or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 perspective-1500">
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

export default SearchContent;
