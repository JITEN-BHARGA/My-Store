"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerNavbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm px-6 py-3 flex items-center justify-between relative">
      {/* 🔹 LOGO */}
      <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
        Seller Dashboard
      </Link>

      {/* 🔹 DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
        <Link href="/seller" className="hover:text-indigo-600">
          Add Product
        </Link>
        <Link href="/my-products" className="hover:text-indigo-600">
          My Products
        </Link>
        <Link href="/seller/orders" className="hover:text-indigo-600">
          Orders
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* 🔹 MOBILE MENU BUTTON */}
      <button
        className="md:hidden text-gray-700 text-2xl"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* 🔹 MOBILE MENU */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-t shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50">
          <Link href="/seller/dashboard" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/seller/add-product" onClick={() => setMenuOpen(false)}>
            Add Product
          </Link>
          <Link href="/seller/products" onClick={() => setMenuOpen(false)}>
            My Products
          </Link>
          <Link href="/seller/orders" onClick={() => setMenuOpen(false)}>
            Orders
          </Link>
          <Link href="/seller/analytics" onClick={() => setMenuOpen(false)}>
            Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg w-3/4 text-center"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
