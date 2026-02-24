"use client";

import { useEffect, useState } from "react";
import SellerNavbar from "@/components/sellerNavbar";

type OrderItem = {
  productId: {
    _id: string;
    name: string;
    imageURL: string[];
  };
  qty: number;
  price: number;
  status: string;
  isDelivered: boolean;
  deliveryDate?: string;
};

type Order = {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
  items: OrderItem[];
};

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/orders", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-yellow-100 text-yellow-700";
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const markAsDelivered = async (orderId: string, productId: string) => {
    const res = await fetch("/api/seller/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ orderId, productId }),
    });

    const data = await res.json();

    if (data.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map((item) =>
                  item.productId._id === productId
                    ? {
                        ...item,
                        status: "Delivered",
                        isDelivered: true,
                        deliveryDate: new Date().toISOString(),
                      }
                    : item
                ),
              }
            : order
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <SellerNavbar />

      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Seller Orders 📦</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.qty,
                0
              );

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-lg shadow p-4"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:justify-between mb-4">
                    <div>
                      <p className="font-semibold">
                        Order ID: {order._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.name} • {order.user?.email}
                      </p>
                    </div>

                    <p className="font-semibold mt-2 md:mt-0">
                      Total: ₹{total}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.productId._id}
                        className="flex items-center justify-between border rounded p-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productId.imageURL[0]}
                            className="w-12 h-12 object-contain"
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {item.productId.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.qty} • ₹{item.price}
                            </p>
                          </div>
                        </div>

                        <div className="text-right space-y-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                          {!item.isDelivered && (
                            <button
                              onClick={() =>
                                markAsDelivered(
                                  order._id,
                                  item.productId._id
                                )
                              }
                              className="block text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                            >
                              Mark as Delivered
                            </button>
                          )}

                          {item.isDelivered && (
                            <p className="text-xs text-green-600 font-semibold">
                              Delivered
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Order Date:{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}