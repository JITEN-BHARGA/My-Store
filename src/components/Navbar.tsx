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
  const [scrolled, setScrolled] = useState<boolean>(false);

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

  // Scroll-aware navbar depth
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const iconLink =
    "relative grid place-items-center w-10 h-10 rounded-xl text-lg text-indigo-600 " +
    "bg-white/60 border border-white/70 shadow-[0_2px_6px_rgba(24,26,40,0.06)] " +
    "transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(79,70,229,0.18)] " +
    "active:translate-y-0";

  return (
    <div className="sticky top-0 z-50 px-3 sm:px-5 pt-3">
      <nav
        className={`glass mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 sm:px-6 py-3 transition-all duration-500 ${
          scrolled
            ? "shadow-[0_12px_34px_rgba(24,26,40,0.14)] bg-white/80"
            : "shadow-[0_6px_20px_rgba(24,26,40,0.08)]"
        }`}
      >
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="grid place-items-center w-9 h-9 rounded-xl text-white text-lg font-black
              bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_18px_rgba(79,70,229,0.4)]
              transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3"
          >
            M
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-gradient">
            MyStore
          </span>
        </Link>

        {/* SEARCH BOX */}
        <div className="order-3 sm:order-none w-full sm:w-auto flex items-center rounded-xl px-3 py-2 bg-white/70 border border-white/70 shadow-inner focus-within:ring-2 focus-within:ring-indigo-300 transition">
          <span className="text-gray-400 mr-1">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Search products"
            className="bg-transparent outline-none px-1 w-full sm:w-44 md:w-64 text-gray-800 placeholder:text-gray-400"
          />
          <button
            onClick={handleSearch}
            aria-label="Search"
            className="ml-1 px-3 py-1 rounded-lg text-sm font-semibold text-white bg-gradient-to-br from-indigo-500 to-violet-600 hover:opacity-95 transition"
          >
            Go
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/myorder" className={iconLink} title="My Orders" aria-label="My Orders">
            📦
          </Link>

          <Link href="/wishlist" className={iconLink} title="Wishlist" aria-label="Wishlist">
            ❤️
          </Link>

          <Link href="/cart" className={iconLink} title="Cart" aria-label="Cart">
            🛒
          </Link>

          {/* PROFILE DROPDOWN */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setOpen(!open)}
                  aria-haspopup="true"
                  aria-expanded={open}
                  className="grid place-items-center w-10 h-10 rounded-full text-white font-semibold
                    bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_18px_rgba(79,70,229,0.4)]
                    transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {user.name.charAt(0).toUpperCase()}
                </button>

                {open && (
                  <div className="absolute right-0 mt-3 w-52 glass rounded-2xl shadow-[0_20px_45px_rgba(24,26,40,0.18)] p-4 text-sm text-gray-800 z-50 animate-pop origin-top-right">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-gray-500">@{user.username}</p>

                    <button
                      onClick={handleLogout}
                      className="mt-4 w-full bg-gradient-to-br from-rose-500 to-red-600 text-white py-2 rounded-xl font-semibold hover:opacity-95 transition shadow-[0_8px_18px_rgba(225,29,72,0.3)]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex gap-2 sm:gap-3 items-center">
                <Link
                  href="/login"
                  className="text-indigo-600 font-semibold px-2 hover:text-indigo-700 transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="sheen bg-gradient-to-br from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl font-semibold shadow-[0_8px_18px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
