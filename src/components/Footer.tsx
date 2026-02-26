const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">MyStore</h2>
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
            <button className="bg-indigo-600 px-4 py-2 rounded-lg sm:rounded-r-lg text-white text-sm hover:bg-indigo-700">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © 2026 MyStore. All rights reserved. • Privacy Policy • Terms of Service
      </div>
    </footer>
  );
};

export default Footer;
