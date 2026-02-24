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
  const [discount] = useState(0);

  useEffect(() => {
    fetchAddresses();
    fetchCartTotal();
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
    } else {
      alert("Failed to delete address");
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

  const placeOrder = async () => {
    if (!selectedAddress) return alert("Please select an address");

    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        addressId: selectedAddress,
        subtotal: cartTotal,
        discount: discount,
        total: cartTotal - discount,
      }),
    });

    if (res.ok) {
      alert("Order placed successfully! 🎉");
      router.push("/myorder");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-10">
      <Navbar />

      <div className="max-w-[600px] mx-auto p-6 flex flex-col gap-6">
        {/* PRICE DETAILS */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">1. Price Details</h2>

          <div className="flex justify-between text-gray-700">
            <span>Items Subtotal</span>
            <span className="font-semibold">₹{cartTotal}</span>
          </div>

          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span className="font-semibold">- ₹{discount}</span>
          </div>

          <div className="flex justify-between text-gray-700">
            <span>Delivery Charges</span>
            <span className="text-green-600 font-bold">FREE</span>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span className="text-lg font-bold text-gray-900">
              Total Amount
            </span>
            <span className="text-2xl font-black text-gray-900">
              ₹{cartTotal - discount}
            </span>
          </div>

          <button
            onClick={placeOrder}
            disabled={!selectedAddress}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-extrabold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:bg-gray-400"
          >
            Buy Now
          </button>

          <p className="text-center text-[11px] text-gray-400 italic">
            Safe & Secure Payments. Easy returns.
          </p>
        </section>

        {/* SHIPPING ADDRESS */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
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
                <div className="flex gap-3">
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
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                      ${
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
                  setAddressForm({ ...addressForm, name: e.target.value })
                }
              />

              <input
                required
                placeholder="Phone Number"
                className="input"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, phone: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Pincode"
                  className="input"
                  value={addressForm.pincode}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, pincode: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="City"
                  className="input"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                />
              </div>

              <input
                required
                placeholder="House No. / Building"
                className="input"
                value={addressForm.house}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, house: e.target.value })
                }
              />

              <input
                required
                placeholder="Area / Colony"
                className="input"
                value={addressForm.area}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, area: e.target.value })
                }
              />

              <input
                required
                placeholder="State"
                className="input"
                value={addressForm.state}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, state: e.target.value })
                }
              />

              <input
                placeholder="Landmark (Optional)"
                className="input"
                value={addressForm.landmark}
                onChange={(e) =>
                  setAddressForm({ ...addressForm, landmark: e.target.value })
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
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{addr.name}</p>
                      <p className="text-xs text-gray-500 mb-2">{addr.phone}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {addr.house}, {addr.area}, <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>

                      {/* EDIT BUTTON */}
                      <div className="flex justify-between items-center mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddressId(addr._id);
                            setIsAddingNew(true);

                            setAddressForm({
                              name: addr.name,
                              phone: addr.phone,
                              pincode: addr.pincode,
                              state: addr.state,
                              city: addr.city,
                              house: addr.house,
                              area: addr.area,
                              landmark: addr.landmark,
                              type: addr.type,
                            });
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

      <style jsx>{`
        .input {
          border: 1px solid #e5e7eb;
          padding: 0.8rem;
          border-radius: 0.6rem;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }
        .input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 2px #eef2ff;
        }
      `}</style>
    </div>
  );
}
