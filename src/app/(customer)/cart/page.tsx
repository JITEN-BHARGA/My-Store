"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface CartItem {
  _id: string; // productId._id
  name: string;
  brand: string;
  price: number;
  qty: number;
  image?: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN").format(amount);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const finalTotal = Math.max(subtotal - discount, 0);

  const formatCart = (items: any[]): CartItem[] => {
    if (!Array.isArray(items)) return [];

    return items.map((item: any) => ({
      _id: item.productId?._id, // ✅ IMPORTANT FIX
      name: item.productId?.name || "Product",
      brand: item.productId?.companyName || "",
      price: item.productId?.finalPrice || 0,
      qty: item.qty || 1,
      image: item.productId?.imageURL?.[0] || "/placeholder.png",
    }));
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      // backend should return cart.products
      setCart(formatCart(data?.cart?.products));
    } catch (err) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };


  const handlePlaceOrder = async () => {
    try {
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          subtotal,
          discount,
          total: finalTotal,
        }),
      });

      router.push("/checkout");
    } catch (err) {
      console.error(err);
    }
  };

  const updateQty = async (
    productId: string, // ✅ now sending productId
    type: "increase" | "decrease" | "remove"
  ) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, action: type }), // ✅ FIXED
      });

      const data = await res.json();

      if (res.ok) {
        setCart(formatCart(data?.cart?.products));
        setDiscount(0);
      }
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h2 className="text-2xl font-bold text-indigo-600">My Cart</h2>

        {loading && <p className="text-gray-600">Loading cart...</p>}
        {!loading && cart.length === 0 && (
          <p className="text-gray-600">Your cart is empty</p>
        )}

        {cart.map((item) => (
          <div
            key={item._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded object-cover flex-shrink-0"
              />
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.brand}</p>
                <p className="font-bold text-gray-800">
                  ₹{formatPrice(item.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <button
                disabled={item.qty <= 1}
                onClick={() => updateQty(item._id, "decrease")}
                className="border px-3 py-1 rounded text-gray-800 hover:bg-gray-100 disabled:opacity-40"
              >
                −
              </button>
              <span className="text-gray-900 font-medium">{item.qty}</span>
              <button
                onClick={() => updateQty(item._id, "increase")}
                className="border px-3 py-1 rounded text-gray-800 hover:bg-gray-100"
              >
                +
              </button>
            </div>

            <button
              onClick={() => updateQty(item._id, "remove")}
              className="text-red-500 hover:text-red-600 text-sm font-medium mt-3 sm:mt-0"
            >
              Remove
            </button>
          </div>
        ))}

        {cart.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm max-w-md w-full ml-auto">
            <h3 className="font-bold mb-4 text-gray-900">Price Details</h3>

            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{formatPrice(subtotal)}</span>
            </div>


            <div className="flex justify-between font-bold mt-3 text-gray-900 border-t pt-3">
              <span>Total</span>
              <span>₹{formatPrice(finalTotal)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-5 w-full bg-indigo-600 text-white py-2 rounded-lg hover:opacity-90 transition"
            >
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}