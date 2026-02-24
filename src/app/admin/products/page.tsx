"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Table from "@/components/Table";

interface Product {
  _id: string;
  name: string;
  companyName: string;
  category: string;
  currentPrice: number;
  stock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(prev => prev.filter(product => product._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-lg font-semibold min-h-screen">
        Loading products...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Products Management</h1>

        <Table
          headers={["Name", "Company", "Category", "Price (₹)", "Stock", "Actions"]}
          data={products}
          renderRow={(product, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4">{product.name}</td>
              <td className="px-6 py-4">{product.companyName}</td>
              <td className="px-6 py-4">{product.category}</td>
              <td className="px-6 py-4">{product.currentPrice}</td>
              <td className="px-6 py-4">{product.stock}</td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => deleteProduct(product._id)}
                  disabled={deletingId === product._id}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === product._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}