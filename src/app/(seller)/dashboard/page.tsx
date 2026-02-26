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
      <div className="p-6 text-gray-600 text-lg font-semibold">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <SellerNavbar />

      <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen text-gray-800">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <h2 className="text-2xl font-bold text-blue-600">
              ₹ {summary.totalRevenue}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Products Sold</p>
            <h2 className="text-2xl font-bold text-green-600">
              {summary.totalProductsSold}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold text-amber-500">
              {summary.totalOrders}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Delivered Orders</p>
            <h2 className="text-2xl font-bold text-green-700">
              {summary.deliveredOrders}
            </h2>
          </div>

          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Orders</p>
            <h2 className="text-2xl font-bold text-yellow-600">
              {summary.pendingOrders}
            </h2>
          </div>
        </div>

        {/* Monthly Sales Graph */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Monthly Sales</h2>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Yearly Sales</h2>
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
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold mb-4">Top Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500">No sales yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center border rounded-lg p-3 gap-2 sm:gap-0"
                >
                  <p>{p.name}</p>
                  <p className="font-semibold text-blue-600">{p.sold} sold</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
