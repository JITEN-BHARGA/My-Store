"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Table from "@/components/Table";

interface Coupon {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minPurchase: number;
  isActive: boolean;
}

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minPurchase: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupon/list");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error("Coupon fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/admin/coupon/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minPurchase: Number(form.minPurchase),
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Coupon created ✅");
      setForm({ code: "", type: "percent", value: "", minPurchase: "" });
      fetchCoupons();
    } else {
      alert(data.message);
    }
  };

  const toggleCoupon = async (id: string) => {
    await fetch(`/api/coupon/toggle/${id}`, {
      method: "PATCH",
    });

    fetchCoupons();
  };

  if (loading) {
    return <div className="p-6 text-lg font-semibold">Loading coupons...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Coupon Management</h1>

        {/* CREATE COUPON CARD */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h2 className="text-lg font-semibold">Create Coupon</h2>

          <form
            onSubmit={handleCreateCoupon}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              required
              placeholder="Coupon Code"
              className="border px-3 py-2 rounded-lg"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
            />

            <select
              className="border px-3 py-2 rounded-lg"
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as "percent" | "fixed" })
              }
            >
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed ₹</option>
            </select>

            <input
              required
              type="number"
              placeholder="Value"
              className="border px-3 py-2 rounded-lg"
              value={form.value}
              onChange={(e) =>
                setForm({ ...form, value: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Min Purchase"
              className="border px-3 py-2 rounded-lg"
              value={form.minPurchase}
              onChange={(e) =>
                setForm({ ...form, minPurchase: e.target.value })
              }
            />

            <button className="md:col-span-4 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700">
              Create Coupon
            </button>
          </form>
        </div>

        {/* COUPON TABLE */}
        <Table
          headers={[
            "Code",
            "Type",
            "Value",
            "Min Purchase",
            "Status",
            "Action",
          ]}
          data={coupons}
          renderRow={(coupon, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-semibold">{coupon.code}</td>
              <td className="px-6 py-4 capitalize">{coupon.type}</td>
              <td className="px-6 py-4">
                {coupon.type === "percent"
                  ? `${coupon.value}%`
                  : `₹ ${coupon.value}`}
              </td>
              <td className="px-6 py-4">₹ {coupon.minPurchase}</td>

              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    coupon.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {coupon.isActive ? "Active" : "Inactive"}
                </span>
              </td>

              <td className="px-6 py-4">
                <button
                  onClick={() => toggleCoupon(coupon._id)}
                  className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600"
                >
                  Toggle
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}