"use client";

import SellerNavbar from "@/components/sellerNavbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  name: string;
  category: string;
  companyName: string;
  currentPrice: number;
  discount: number;
  stock: number;
  itemInfo: string;
  imageURL: string[];
  attributes: Record<string, string>;
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* FETCH PRODUCTS */
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/my-products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* DELETE PRODUCT */
  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await fetch(`/api/my-products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setProducts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen text-gray-800">
      <SellerNavbar />

      <section className="relative overflow-hidden text-white py-16 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-float"
        />
        <div className="relative max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black leading-tight">
            Your Products
          </h2>
          <p className="mt-3 text-lg text-indigo-100 max-w-2xl mx-auto">
            View, edit, or delete your products with full details.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto space-y-6">
        {products.length === 0 && (
          <div className="text-center py-20 rounded-3xl glass elev-2">
            <div className="text-6xl mb-4 animate-float">📦</div>
            <p className="text-xl font-bold text-gray-800">No products found</p>
            <button
              onClick={() => router.push("/seller")}
              className="sheen mt-6 px-6 py-3 rounded-2xl text-white font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform"
            >
              + Add Product
            </button>
          </div>
        )}

        {products.map((product) => (
          <div
            key={product._id}
            className="lift flex flex-col lg:flex-row bg-white/85 border border-white/70 rounded-2xl elev-2 p-6 gap-6 animate-fade-up"
          >
            {/* LEFT SIDE - IMAGES */}
            <div className="lg:w-1/3 flex gap-2 overflow-x-auto no-scrollbar">
              {product.imageURL.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 object-cover rounded-xl flex-shrink-0 elev-1"
                  alt={`${product.name} image ${i + 1}`}
                />
              ))}
            </div>

            {/* RIGHT SIDE - DETAILS + ACTIONS */}
            <div className="flex-1 space-y-3 relative">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium text-gray-900">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium text-gray-900">
                    {product.category}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium text-gray-900">
                    {product.companyName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock</p>
                  <p className="font-medium text-gray-900">{product.stock}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-gray-900">
                    ₹{product.currentPrice}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Discount (%)</p>
                  <p className="font-medium text-gray-900">
                    {product.discount}
                  </p>
                </div>
              </div>

              {/* Attributes */}
              {product.attributes &&
                Object.keys(product.attributes).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Attributes</p>
                    <ul className="list-disc list-inside text-gray-900">
                      {Object.entries(product.attributes).map(
                        ([key, value]) => (
                          <li key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

              {/* Description */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="text-gray-900">{product.itemInfo}</p>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => router.push(`/editProduct/${product._id}`)}
                  className="px-5 py-2 bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold rounded-xl shadow-[0_8px_18px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-transform"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteProduct(product._id)}
                  className="px-5 py-2 bg-gradient-to-br from-rose-500 to-red-600 text-white font-semibold rounded-xl shadow-[0_8px_18px_rgba(225,29,72,0.25)] hover:-translate-y-0.5 transition-transform"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
