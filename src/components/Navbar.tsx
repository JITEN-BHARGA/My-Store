"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, KeyboardEvent } from "react";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  username: string;
};

const Navbar: React.FC = () => {
  const router = useRouter();

  const [search, setSearch] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  // ✅ Fetch user from /api/me (cookie auth)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // ✅ Search API
  const handleSearch = (): void => {
    if (!search.trim()) return;

    router.push(`/search?keyword=${encodeURIComponent(search.trim())}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSearch();
  };

  // ✅ Logout via API (clears cookie)
  const handleLogout = async (): Promise<void> => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      {/* LOGO */}
      <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}`} className="text-2xl font-bold text-indigo-600">
        MyStore
      </Link>
      

      {/* SEARCH BOX */}
      <div className="w-2xs hidden md:flex items-center border rounded-lg px-2 py-1 bg-gray-100">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none px-2 w-40 md:w-56 text-gray-800"
        />
        <button onClick={handleSearch}>🔍</button>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        <Link href="/myorder" className="text-indigo-600 font-semibold text-xl">
          📦
        </Link>
        {/* ❤️ WISHLIST ICON (added left of cart) */}
        <Link
          href="/wishlist"
          className="text-indigo-600 font-semibold text-xl"
        >
          ❤️
        </Link>

        {/* 🛒 CART ICON */}
        <Link href="/cart" className="text-indigo-600 font-semibold text-xl">
          🛒
        </Link>

        {/* PROFILE */}
        <div className="relative">
          {user ? (
            <>
              {/* Avatar */}
              <button
                onClick={() => setOpen(!open)}
                className="bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>

              {/* DROPDOWN */}
              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-md p-3 text-sm text-gray-800 z-50">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-gray-600">@{user.username}</p>

                  <button
                    onClick={handleLogout}
                    className="mt-3 w-full bg-red-500 text-white py-1 rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="text-indigo-600 font-semibold">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
