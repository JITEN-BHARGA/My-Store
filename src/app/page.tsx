"use client";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import { Product } from "@/types/product";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";

enum Catagory {
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Groceries",
  "Mobiles",
  "Accessories",
}

const categoryIcons: Record<string, string> = {
  Electronics: "💻",
  Fashion: "👕",
  "Home & Kitchen": "🏠",
  Beauty: "💄",
  Sports: "⚽",
  Books: "📚",
  Toys: "🧸",
  Groceries: "🛒",
  Mobiles: "📱",
  Accessories: "🎧",
};

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const heroRef = useRef<HTMLElement>(null);
  const categories = Object.values(Catagory).filter(
    (v) => typeof v === "string",
  ) as string[];

  useEffect(() => {
    // ✅ Check login via cookie using /api/me
    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me");

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    const fetchProduct = async () => {
      try {
        const res = await fetch("/api/getItem");

        if (!res.ok) throw new Error("product not found...");

        const product = await res.json();

        setProducts(Array.isArray(product.data) ? product.data : []);
      } catch (error) {
        console.error(error);
        setProducts([]); // fallback
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
    fetchProduct();
  }, []);

  // Desktop-only mouse parallax (writes CSS vars — no re-render)
  const handleParallax = (e: React.PointerEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--px", px.toFixed(3));
    el.style.setProperty("--py", py.toFixed(3));
  };

  const heroProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen text-gray-800">
      <Navbar />

      {/* ===================== HERO ===================== */}
      <section
        ref={heroRef}
        onPointerMove={handleParallax}
        style={{ "--px": 0, "--py": 0 } as React.CSSProperties}
        className="relative overflow-hidden px-4 sm:px-6 pt-16 pb-24 sm:pt-20 sm:pb-28"
      >
        {/* Aurora depth layers */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl opacity-60 animate-aurora"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.55), transparent 60%)",
            transform:
              "translate3d(calc(var(--px)*-30px), calc(var(--py)*-30px), 0)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-50 animate-aurora"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.5), transparent 60%)",
            transform:
              "translate3d(calc(var(--px)*30px), calc(var(--py)*30px), 0)",
            animationDelay: "3s",
          }}
        />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center perspective-2000">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-indigo-700 text-sm font-semibold shadow-[0_8px_20px_rgba(79,70,229,0.15)] animate-fade-in">
              ✨ Trusted by 10,000+ happy customers
            </span>

            <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-gray-900 animate-fade-up">
              Mega Savings on Your{" "}
              <span className="text-gradient">Favorite Brands</span>
            </h1>

            <p
              className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Discover unbeatable deals on electronics, fashion, home essentials
              and more. Shop smarter, save bigger — only for a short time.
            </p>

            <p
              className="mt-5 text-2xl sm:text-3xl font-extrabold text-gray-900 animate-fade-up"
              style={{ animationDelay: "0.18s" }}
            >
              Up to <span className="text-gradient">50% OFF</span> + Extra
              Cashback 💳
            </p>

            <div
              className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-up"
              style={{ animationDelay: "0.26s" }}
            >
              <button
                onClick={() =>
                  document
                    .getElementById("featured")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="sheen px-7 py-3.5 rounded-2xl text-white font-bold text-lg
                  bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_16px_36px_rgba(79,70,229,0.4)]
                  hover:-translate-y-1 transition-transform"
              >
                Shop Deals →
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("categories")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-7 py-3.5 rounded-2xl font-bold text-lg glass text-indigo-700
                  hover:-translate-y-1 transition-transform"
              >
                Browse Categories
              </button>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-gray-500">
              Fast delivery • Easy returns • Secure checkout
            </p>
          </div>

          {/* 3D floating product composition */}
          <div className="relative h-[22rem] sm:h-[26rem] hidden md:block preserve-3d">
            {/* Glass stage */}
            <div
              className="absolute inset-6 rounded-[2rem] glass elev-4"
              style={{
                transform:
                  "translate3d(calc(var(--px)*14px), calc(var(--py)*14px), 0) rotateX(6deg) rotateY(-8deg)",
                transition: "transform 0.2s ease-out",
              }}
            />

            {heroProducts.map((p, i) => {
              const spots = [
                { top: "6%", left: "8%", depth: 60, delay: "0s", size: "10rem" },
                { top: "40%", left: "48%", depth: 90, delay: "1.2s", size: "12rem" },
                { top: "58%", left: "10%", depth: 40, delay: "2.1s", size: "9rem" },
              ];
              const s = spots[i];
              return (
                <div
                  key={p._id || i}
                  className="absolute rounded-2xl bg-white p-3 elev-3 animate-float"
                  style={{
                    top: s.top,
                    left: s.left,
                    width: s.size,
                    animationDelay: s.delay,
                    transform: `translate3d(calc(var(--px)*${s.depth}px), calc(var(--py)*${s.depth}px), 0)`,
                  }}
                >
                  <img
                    src={p.imageURL?.[0]}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-28 object-contain"
                  />
                  <div className="mt-1 text-xs font-semibold text-gray-800 line-clamp-1">
                    {p.name}
                  </div>
                  <div className="text-xs font-bold text-indigo-600">
                    ₹{Number(p.finalPrice).toFixed(0)}
                  </div>
                </div>
              );
            })}

            {/* Floating badge */}
            <div
              className="absolute top-2 right-4 px-4 py-2 rounded-2xl text-white font-extrabold text-sm
                bg-gradient-to-br from-rose-500 to-orange-500 elev-3 animate-float-slow"
              style={{
                transform:
                  "translate3d(calc(var(--px)*70px), calc(var(--py)*70px), 0)",
              }}
            >
              50% OFF 🔥
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section id="categories" className="px-4 sm:px-6 py-10 max-w-7xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-900">
            Shop by <span className="text-gradient">Category</span>
          </h2>
        </Reveal>

        <div className="w-full overflow-x-auto no-scrollbar">
          <div className="flex w-max min-w-full justify-start sm:justify-between gap-4 sm:gap-5 px-1 pb-2 perspective-1000">
            {categories.map((cat, i) => (
              <button
                key={cat}
                onClick={() =>
                  router.push(`/search?category=${encodeURIComponent(cat)}`)
                }
                title={cat}
                className="group flex flex-col items-center gap-2 flex-shrink-0"
                style={{ animation: "pop-in 0.5s both", animationDelay: `${i * 40}ms` }}
              >
                <span
                  className="grid place-items-center w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-2xl text-2xl sm:text-3xl
                    bg-white/80 border border-white/70 elev-2
                    transition-all duration-300 group-hover:-translate-y-1.5 group-hover:elev-3
                    group-hover:[transform:translateY(-6px)_rotateX(12deg)_rotateY(-12deg)]"
                >
                  {categoryIcons[cat]}
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-600 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED PRODUCTS ===================== */}
      <section id="featured" className="px-4 sm:px-6 py-12 max-w-7xl mx-auto">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-gray-900">
            Featured <span className="text-gradient">Products</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 perspective-1500">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 bg-white/80 border border-white/70 elev-1">
                  <div className="skeleton w-full h-56 rounded-xl" />
                  <div className="skeleton h-4 w-3/4 rounded mt-4" />
                  <div className="skeleton h-4 w-1/2 rounded mt-2" />
                  <div className="skeleton h-9 w-full rounded-xl mt-4" />
                </div>
              ))
            : products?.map((item, i) => (
                <Reveal key={item._id || i} delay={(i % 4) * 80}>
                  <ProductCard product={item} isLoggedIn={isLoggedIn} />
                </Reveal>
              ))}
        </div>
      </section>

      {/* ===================== OFFER BANNER ===================== */}
      <section className="px-4 sm:px-6 py-10 max-w-7xl mx-auto">
        <Reveal>
          <div className="sheen relative overflow-hidden rounded-3xl px-6 sm:px-12 py-12 sm:py-16 text-center text-white
            bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 elev-4">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-3xl"
            />
            <h2 className="relative text-2xl sm:text-4xl font-black">
              Flat 40% OFF on Limited Edition Products
            </h2>
            <p className="relative mt-3 text-indigo-100">
              Hurry — offer ends soon. Grab yours before it&apos;s gone.
            </p>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
