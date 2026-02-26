"use client";

import { useRouter } from "next/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap sm:flex-nowrap justify-between items-center">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-indigo-600 cursor-pointer mb-2 sm:mb-0 flex-shrink-0"
          onClick={() => router.push("/admin/dashboard")}
        >
          Admin Panel
        </div>

        {/* Links */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 text-gray-700 font-medium">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="hover:text-indigo-600 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push("/admin/users")}
            className="hover:text-indigo-600 transition"
          >
            Users
          </button>
          <button
            onClick={() => router.push("/admin/sellers")}
            className="hover:text-indigo-600 transition"
          >
            Sellers
          </button>
          <button
            onClick={() => router.push("/admin/products")}
            className="hover:text-indigo-600 transition"
          >
            Products
          </button>
          <button
            onClick={() => router.push("/admin/orders")}
            className="hover:text-indigo-600 transition"
          >
            Orders
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="ml-0 sm:ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
