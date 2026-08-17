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
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex items-center justify-between relative border-b border-white/60 shadow-[0_6px_20px_rgba(24,26,40,0.08)]">
      {/* 🔹 LOGO */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="grid place-items-center w-9 h-9 rounded-xl text-white text-lg font-black bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_18px_rgba(79,70,229,0.4)]">
          M
        </span>
        <span className="text-xl font-extrabold tracking-tight text-gradient">
          Seller Dashboard
        </span>
      </Link>

      {/* 🔹 DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
        <Link href="/seller" className="hover:text-indigo-600 transition-colors">
          Add Product
        </Link>
        <Link href="/my-products" className="hover:text-indigo-600 transition-colors">
          My Products
        </Link>
        <Link href="/seller/orders" className="hover:text-indigo-600 transition-colors">
          Orders
        </Link>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-br from-rose-500 to-red-600 text-white px-4 py-1.5 rounded-xl font-semibold shadow-[0_8px_18px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 transition-transform"
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
        <div className="absolute top-full left-0 w-full glass border-t border-white/60 shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50 animate-fade-in">
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
