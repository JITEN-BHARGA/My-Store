"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface CartItem {
  _id: string;
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
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");

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
      _id: item._id,
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
      setCart(formatCart(data?.cart));
    } catch (err) {
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Validate coupon against Database
  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, subtotal }),
      });

      const data = await res.json();

      if (res.ok) {
        setDiscount(data.discountAmount);
        setAppliedCouponCode(data.code);
        alert("Coupon Applied Successfully!");
      } else {
        alert(data.message);
        setDiscount(0);
        setAppliedCouponCode("");
      }
    } catch (err) {
      alert("Error applying coupon");
    }
  };

  // NEW: Place order and save everything to Database
  const handlePlaceOrder = async () => {
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          subtotal,
          discount,
          total: finalTotal,
          couponCode: appliedCouponCode,
        }),
      });

      router.push("/checkout");
    } catch (err) {
      console.error(err);
    }
  };

  const updateQty = async (
    cartItemId: string,
    type: "increase" | "decrease" | "remove",
  ) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cartItemId, action: type }),
      });
      const data = await res.json();
      if (res.ok) {
        setCart(formatCart(data?.cart));
        setDiscount(0); // Reset discount if cart changes
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

            <h3 className="font-bold text-sm mb-2">Apply Coupon</h3>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="border p-2 flex-1"
                placeholder="Enter coupon"
              />
              <button
                onClick={applyCoupon}
                className="bg-black text-white px-3 py-2 sm:py-0"
              >
                Apply
              </button>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>Subtotal</span>
              <span>₹{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600 mt-1">
                <span>Discount ({appliedCouponCode})</span>
                <span>- ₹{formatPrice(discount)}</span>
              </div>
            )}

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
