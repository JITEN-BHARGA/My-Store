"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Table from "@/components/Table";

interface Seller {
  _id: string;
  name: string;
  email: string;
  companyName: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSeller = async (id: string) => {
    if (!confirm("Are you sure you want to delete this seller?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSellers(prev => prev.filter(seller => seller._id !== id));
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
        Loading sellers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Sellers Management</h1>

        <Table
          headers={["Name", "Email", "Company", "Actions"]}
          data={sellers}
          renderRow={(seller, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4">{seller.name}</td>
              <td className="px-6 py-4">{seller.email}</td>
              <td className="px-6 py-4">{seller.companyName}</td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => deleteSeller(seller._id)}
                  disabled={deletingId === seller._id}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === seller._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}