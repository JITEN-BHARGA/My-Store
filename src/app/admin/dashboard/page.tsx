"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Card from "@/components/Card";
import Chart from "@/components/Chart";
import Table from "@/components/Table";

interface Summary {
  totalUsers: number;
  totalSellers: number;
  totalOrders: number;
  totalRevenue: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "seller";
}

interface Seller {
  _id: string;
  name: string;
  email: string;
}

interface Product {
  _id: string;
  name: string;
  stock: number;
  currentPrice: number;
}

interface Order {
  _id: string;
  userName: string;
  total: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [monthlySales, setMonthlySales] = useState<{ name: string; sales: number }[]>([]);
  const [yearlySales, setYearlySales] = useState<{ name: string; sales: number }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const data = await res.json();

      setSummary({
        totalUsers: data.totalUsers || 0,
        totalSellers: data.totalSellers || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
      });

      setMonthlySales(data.monthlySales || []);
      setYearlySales(data.yearlySales || []);
      setUsers(data.users || []);
      setSellers(data.sellers || []);
      setProducts(data.products || []);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-lg font-semibold min-h-screen">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Users" value={summary.totalUsers} color="blue" />
          <Card title="Total Sellers" value={summary.totalSellers} color="green" />
          <Card title="Total Orders" value={summary.totalOrders} color="amber" />
          <Card title="Total Revenue" value={`₹ ${summary.totalRevenue}`} color="indigo" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart data={monthlySales} dataKey="sales" title="Monthly Sales" color="#2563eb" />
          <Chart data={yearlySales} dataKey="sales" title="Yearly Sales" color="#10b981" />
        </div>

        {/* Tables */}
        <div className="space-y-6">
          {/* Users Table */}
          <Table
            headers={["Name", "Email", "Role"]}
            data={users}
            renderRow={(user, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
              </tr>
            )}
          />

          {/* Sellers Table */}
          <Table
            headers={["Name", "Email"]}
            data={sellers}
            renderRow={(seller, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{seller.name}</td>
                <td className="px-6 py-4">{seller.email}</td>
              </tr>
            )}
          />

          {/* Products Table */}
          <Table
            headers={["Name", "Stock", "Price"]}
            data={products}
            renderRow={(product, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">₹ {product.currentPrice}</td>
              </tr>
            )}
          />

          {/* Orders Table */}
          <Table
            headers={["User", "Total", "Status", "Date"]}
            data={orders}
            renderRow={(order, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4">{order.userName}</td>
                <td className="px-6 py-4">₹ {order.total}</td>
                <td className="px-6 py-4">{order.status}</td>
                <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            )}
          />
        </div>
      </div>
    </div>
  );
}