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
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <h2 className="text-3xl font-black text-gray-900">
          My <span className="text-gradient">Cart</span>
        </h2>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="skeleton h-28 rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && cart.length === 0 && (
          <div className="text-center py-20 rounded-3xl glass elev-2 animate-fade-up">
            <div className="text-6xl mb-4 animate-float">🛒</div>
            <p className="text-xl font-bold text-gray-800">Your cart is empty</p>
            <p className="text-gray-500 mt-1">
              Browse our featured deals and add something you love.
            </p>
            <button
              onClick={() => router.push("/")}
              className="sheen mt-6 px-6 py-3 rounded-2xl text-white font-semibold bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform"
            >
              Continue Shopping →
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4 perspective-1500">
            {cart.map((item) => (
              <div
                key={item._id}
                className="lift flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/85 border border-white/70 p-4 rounded-2xl elev-2 animate-fade-up"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-b from-gray-50 to-gray-100 grid place-items-center flex-shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.brand}</p>
                    <p className="font-extrabold text-lg text-gray-900 mt-1">
                      ₹{formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-200 p-1 elev-1">
                    <button
                      disabled={item.qty <= 1}
                      onClick={() => updateQty(item._id, "decrease")}
                      className="w-9 h-9 rounded-lg text-gray-800 hover:bg-indigo-50 disabled:opacity-40 transition"
                    >
                      −
                    </button>
                    <span className="text-gray-900 font-semibold w-6 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item._id, "increase")}
                      className="w-9 h-9 rounded-lg text-gray-800 hover:bg-indigo-50 transition"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => updateQty(item._id, "remove")}
                    className="text-rose-500 hover:text-rose-600 text-sm font-medium hover:scale-110 transition-transform"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {cart.length > 0 && (
            <div className="glass p-6 rounded-2xl elev-3 lg:sticky lg:top-28 animate-fade-up">
              <h3 className="font-bold mb-4 text-gray-900 text-lg">
                Price Details
              </h3>

              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">
                  ₹{formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between font-black text-xl mt-4 text-gray-900 border-t border-gray-200 pt-4">
                <span>Total</span>
                <span className="text-gradient">₹{formatPrice(finalTotal)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="sheen mt-6 w-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white py-3.5 rounded-2xl font-bold shadow-[0_14px_30px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 transition-transform"
              >
                Place Order →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}