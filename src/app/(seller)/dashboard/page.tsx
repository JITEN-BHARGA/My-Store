"use client";

import SellerNavbar from "@/components/sellerNavbar";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  totalProductsSold: number;
  deliveredOrders: number;
  pendingOrders: number;
}

interface Product {
  name: string;
  sold: number;
}

export default function SellerDashboard() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/seller/dashboard");
      const data = await res.json();

      setMonthlyData(data.monthlySales || []);
      setYearlyData(data.yearlySales || []);
      setTopProducts(data.topProducts || []);

      setSummary({
        totalRevenue: data.totalRevenue || 0,
        totalOrders: data.totalOrders || 0,
        totalProductsSold: data.totalProductsSold || 0,
        deliveredOrders: data.deliveredOrders || 0,
        pendingOrders: data.pendingOrders || 0,
      });
    } catch (error) {
      console.error("Analytics fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SellerNavbar />
        <div className="p-4 sm:p-6 space-y-6 min-h-screen">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-72 rounded-2xl" />
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: `₹ ${summary.totalRevenue}`, icon: "💰", from: "from-indigo-500", to: "to-violet-600" },
    { label: "Products Sold", value: summary.totalProductsSold, icon: "📦", from: "from-emerald-500", to: "to-green-600" },
    { label: "Total Orders", value: summary.totalOrders, icon: "🧾", from: "from-amber-400", to: "to-orange-500" },
    { label: "Delivered Orders", value: summary.deliveredOrders, icon: "✅", from: "from-teal-500", to: "to-emerald-600" },
    { label: "Pending Orders", value: summary.pendingOrders, icon: "⏳", from: "from-rose-400", to: "to-red-500" },
  ];

  return (
    <div>
      <SellerNavbar />

      <div className="p-4 sm:p-6 space-y-6 min-h-screen text-gray-800">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 perspective-1500">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="lift group relative overflow-hidden bg-white/85 border border-white/70 rounded-2xl p-5 elev-2 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{s.label}</p>
                <span
                  className={`grid place-items-center w-9 h-9 rounded-xl text-white bg-gradient-to-br ${s.from} ${s.to} shadow-[0_8px_16px_rgba(79,70,229,0.25)]`}
                >
                  {s.icon}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mt-2">
                {s.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Monthly Sales Graph */}
        <div className="bg-white/85 border border-white/70 rounded-2xl p-5 elev-2">
          <h2 className="font-bold text-gray-900 mb-4">Monthly Sales</h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Yearly Sales Graph */}
        <div className="bg-white/85 border border-white/70 rounded-2xl p-5 elev-2">
          <h2 className="font-bold text-gray-900 mb-4">Yearly Sales</h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/85 border border-white/70 rounded-2xl p-5 elev-2">
          <h2 className="font-bold text-gray-900 mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 p-3 gap-2 sm:gap-0 hover:-translate-y-0.5 hover:elev-1 transition-transform"
                >
                  <p className="flex items-center gap-2">
                    <span className="grid place-items-center w-7 h-7 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-600">
                      {i + 1}
                    </span>
                    {p.name}
                  </p>
                  <p className="font-bold text-indigo-600">{p.sold} sold</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
