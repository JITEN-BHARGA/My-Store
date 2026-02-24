"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Table from "@/components/Table";

interface Order {
  _id: string;
  userName: string;
  total: number;
  status: string;
  itemsCount: number;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(
        data.orders.map((o: any) => ({
          _id: o._id,
          userName: o.user?.name || "Unknown",
          total: o.total,
          status: o.status,
          itemsCount: o.items.length,
          createdAt: new Date(o.createdAt).toLocaleString(),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    let nextStatus: string;
    if (currentStatus === "Placed") nextStatus = "Shipped";
    else if (currentStatus === "Shipped") nextStatus = "Delivered";
    else return;

    setUpdatingId(id);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o._id === id ? { ...o, status: nextStatus } : o))
        );
      } else {
        const data = await res.json();
        alert(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-lg font-semibold min-h-screen">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

        <Table
          headers={["User", "Items", "Total (₹)", "Status", "Date", "Actions"]}
          data={orders}
          renderRow={(order, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4">{order.userName}</td>
              <td className="px-6 py-4">{order.itemsCount}</td>
              <td className="px-6 py-4">{order.total}</td>
              <td className="px-6 py-4">{order.status}</td>
              <td className="px-6 py-4">{order.createdAt}</td>
              <td className="px-6 py-4 space-x-2">
                {order.status !== "Delivered" && (
                  <button
                    onClick={() => updateStatus(order._id, order.status)}
                    disabled={updatingId === order._id}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {updatingId === order._id ? "Updating..." : "Next Status"}
                  </button>
                )}
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}