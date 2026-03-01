"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface Address {
  _id: string;
  type: "home" | "work" | "other";
  name: string;
  phone: string;
  pincode: string;
  state: string;
  city: string;
  house: string;
  area: string;
  landmark: string;
}

export default function CheckoutPage() {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    pincode: "",
    state: "",
    city: "",
    house: "",
    area: "",
    landmark: "",
    type: "home" as "home" | "work" | "other",
  });

  const [cartTotal, setCartTotal] = useState(0);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  // 🆕 payment states
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchCartTotal();

    // load razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchAddresses = async () => {
    const res = await fetch("/api/address", { credentials: "include" });
    const data = await res.json();
    const addrs = data.addresses || [];
    setAddresses(addrs);

    if (addrs.length === 0) {
      setIsAddingNew(true);
    } else {
      setSelectedAddress(addrs[0]._id);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode) return alert("Enter coupon code");

    setCouponLoading(true);

    const res = await fetch("/api/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        code: couponCode,
        subtotal: cartTotal,
      }),
    });

    const data = await res.json();
    setCouponLoading(false);

    if (!res.ok) {
      alert(data.message || "Invalid coupon");
      return;
    }

    setDiscount(data.discountAmount);
    setFinalTotal(data.finalTotal);
  };

  const fetchCartTotal = async () => {
    const res = await fetch("/api/cart/total", { credentials: "include" });
    const data = await res.json();
    setCartTotal(data.total || 0);
  };

  const handleDeleteAddress = async (id: string) => {
    const confirmDelete = confirm("Delete this address?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/address/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const updated = addresses.filter((addr) => addr._id !== id);
      setAddresses(updated);

      if (selectedAddress === id) {
        setSelectedAddress(updated[0]?._id || "");
      }

      if (updated.length === 0) {
        setIsAddingNew(true);
      }
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingAddressId
      ? `/api/address/${editingAddressId}`
      : "/api/address";

    const method = editingAddressId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm),
    });

    if (res.ok) {
      const data = await res.json();

      if (editingAddressId) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editingAddressId ? data.address : addr,
          ),
        );
      } else {
        setAddresses([...addresses, data.address]);
      }

      setSelectedAddress(data.address._id);
      setIsAddingNew(false);
      setEditingAddressId(null);

      setAddressForm({
        name: "",
        phone: "",
        pincode: "",
        state: "",
        city: "",
        house: "",
        area: "",
        landmark: "",
        type: "home",
      });
    }
  };

  // ✅ Step 1 — Create Order only
  const placeOrder = async () => {
    if (!selectedAddress) return alert("Please select an address");

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress,
        subtotal: cartTotal,
        discount,
        total: cartTotal - discount,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setOrderId(data.order._id);
      setShowPaymentOptions(true);
    }
  };

  // ✅ COD
  const handleCOD = async () => {
    if (!orderId) return;

    const res = await fetch(`/api/order/${orderId}/cod`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cartTotal,
        discount,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Order placed with Cash on Delivery 🎉");
      router.push("/myorder");
    } else {
      alert(data.message || "COD failed");
    }
  };

  // ✅ Razorpay
  const handleRazorpay = async () => {
    if (!orderId) return;

    setPaymentLoading(true);

    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        discount,
        amount: cartTotal - discount,
      }),
    });

    const data = await res.json();

    if (!data.razorpayOrderId) {
      alert("Razorpay order failed");
      setPaymentLoading(false);
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "MyStore",
      description: "Order Payment",
      order_id: data.razorpayOrderId,

      handler: async function (response: any) {
        const verifyRes = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          alert("Payment successful 🎉");
          router.push("/myorder");
        } else {
          alert("Payment verification failed");
        }
      },

      prefill: {
        name: "Customer",
        email: "customer@email.com",
        contact: "9999999999",
      },

      theme: { color: "#6366f1" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();

    setPaymentLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-10">
      <Navbar />

      <div className="max-w-[600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* PRICE DETAILS */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
          <h2 className="text-2xl font-bold">1. Price Details</h2>

          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-semibold">₹{cartTotal}</span>
          </div>

          {/* ✅ COUPON INPUT */}
          <div className="flex gap-2 mt-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="border px-3 py-2 rounded w-full text-sm"
            />
            <button
              onClick={applyCoupon}
              disabled={couponLoading}
              className="bg-indigo-600 text-white px-4 rounded text-sm font-bold"
            >
              {couponLoading ? "..." : "Apply"}
            </button>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>- ₹{discount}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery Charges</span>
            <span className="text-green-600 font-bold">FREE</span>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span className="text-lg font-bold">Total Amount</span>
            <span className="text-2xl font-black">₹{cartTotal - discount}</span>
          </div>

          {/* ✅ BUY / PAYMENT BUTTONS */}
          {!showPaymentOptions ? (
            <button
              onClick={placeOrder}
              disabled={!selectedAddress}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-extrabold text-lg hover:bg-indigo-700 disabled:bg-gray-400"
            >
              Buy Now
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleRazorpay}
                disabled={paymentLoading}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700"
              >
                {paymentLoading ? "Processing..." : "Pay Now"}
              </button>

              <button
                onClick={handleCOD}
                className="w-full border-2 border-gray-300 py-4 rounded-xl font-bold hover:border-indigo-400"
              >
                Cash on Delivery
              </button>
            </div>
          )}
        </section>

        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            2. Shipping Address
          </h2>

          {isAddingNew ? (
            <form
              onSubmit={handleSaveAddress}
              className="grid grid-cols-1 gap-4"
            >
              {/* TYPE SELECTOR */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Address Type
                </p>
                <div className="flex flex-wrap gap-3">
                  {["home", "work", "other"].map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() =>
                        setAddressForm({
                          ...addressForm,
                          type: type as "home" | "work" | "other",
                        })
                      }
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                        addressForm.type === type
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-300 text-gray-600 hover:border-indigo-400"
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <input
                required
                placeholder="Full Name"
                className="input"
                value={addressForm.name}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    name: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="Phone Number"
                className="input"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    phone: e.target.value,
                  })
                }
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Pincode"
                  className="input"
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      pincode: e.target.value,
                    })
                  }
                />
                <input
                  required
                  placeholder="City"
                  className="input"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      city: e.target.value,
                    })
                  }
                />
              </div>

              <input
                required
                placeholder="House No. / Building"
                className="input"
                value={addressForm.house}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    house: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="Area / Colony"
                className="input"
                value={addressForm.area}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    area: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="State"
                className="input"
                value={addressForm.state}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    state: e.target.value,
                  })
                }
              />

              <input
                placeholder="Landmark (Optional)"
                className="input"
                value={addressForm.landmark}
                onChange={(e) =>
                  setAddressForm({
                    ...addressForm,
                    landmark: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md mt-2"
              >
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr._id)}
                  className={`p-4 bg-white border-2 rounded-xl cursor-pointer transition-all ${
                    selectedAddress === addr._id
                      ? "border-indigo-600 ring-2 ring-indigo-50"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{addr.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {addr.house}, {addr.area},
                        <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>

                      {/* EDIT / DELETE */}
                      <div className="flex gap-4 mt-2 flex-wrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddressId(addr._id);
                            setIsAddingNew(true);
                            setAddressForm({ ...addr });
                          }}
                          className="text-xs text-indigo-600 font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(addr._id);
                          }}
                          className="text-xs text-red-500 font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase">
                      {addr.type}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setIsAddingNew(true);
                  setEditingAddressId(null);
                }}
                className="w-full border-2 border-dashed border-gray-200 py-3 rounded-xl text-gray-400 font-medium hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                + Add New Address
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
