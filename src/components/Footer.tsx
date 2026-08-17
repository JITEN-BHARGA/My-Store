const Footer = () => {
  return (
    <footer className="relative mt-16 text-gray-300 bg-gradient-to-b from-gray-900 to-[#0b0c15] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 60%)" }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-black text-white mb-3">
            My<span className="text-indigo-400">Store</span>
          </h2>
          <p className="text-sm text-gray-400">
            Your one-stop destination for electronics, fashion, home essentials
            and more. Quality products, best prices, fast delivery.
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Shop</li>
            <li className="hover:text-white cursor-pointer">Wishlist</li>
            <li className="hover:text-white cursor-pointer">Cart</li>
            <li className="hover:text-white cursor-pointer">My Orders</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Categories</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Electronics</li>
            <li className="hover:text-white cursor-pointer">Fashion</li>
            <li className="hover:text-white cursor-pointer">Home & Kitchen</li>
            <li className="hover:text-white cursor-pointer">Beauty</li>
            <li className="hover:text-white cursor-pointer">Sports</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3">Stay Updated</h3>
          <p className="text-sm text-gray-400 mb-3">
            Get latest deals & offers directly in your inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-lg sm:rounded-l-lg bg-gray-800 border border-gray-700 text-sm focus:outline-none"
            />
            <button className="sheen bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 rounded-lg sm:rounded-r-lg text-white text-sm font-semibold hover:-translate-y-0.5 transition-transform">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 text-center py-4 text-sm text-gray-500">
        © 2026 MyStore. All rights reserved. • Privacy Policy • Terms of Service
      </div>
    </footer>
  );
};

export default Footer;
