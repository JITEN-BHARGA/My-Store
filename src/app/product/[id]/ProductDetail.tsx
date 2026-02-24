"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SimilarProducts from "@/components/SimilarProducts";
import StarRating from "@/components/starreview";
import { useState } from "react";

export interface Product {
  _id: string;
  name: string;
  imageURL: string[];

  currentPrice: number;
  discount: number;
  finalPrice: number;

  itemInfo: string;
  category: string;
  companyName: string;

  attributes?: Record<string, string | number | boolean>;

  reviews?: Review[];
  reviewCount?: number;
  averageRating?: number;

  stock: number;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  userId: string;
  userName: string; // required for UI display
  rating: number; // 1 → 5
  comment?: string;
  createdAt: string | Date;
}

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.imageURL[0],
  );

  const [zoomScale, setZoomScale] = useState("scale(1)");
  const [zoomPosition, setZoomPosition] = useState("center");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomPosition(`${x}% ${y}%`);
    setZoomScale("scale(2)"); // 🔍 zoom level
  };

  const handleMouseLeave = () => {
    setZoomScale("scale(1)");
    setZoomPosition("center");
  };

  const addToCart = async () => {
    await fetch("/api/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId: product._id }),
    });

    alert("Added to cart ✅");
  };

  const reviews = product.reviews || [];

  const displayedReviews = reviews;
  return (
    <div className="bg-white">
      <Navbar />

      <div className="bg-white min-h-screen max-w-screen-2xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-12 p-4 md:p-10">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div className="flex gap-6 items-start">
          {/* 🔹 THUMBNAILS (LEFT) */}
          <div
            className="relative bg-white rounded-xl overflow-hidden grid grid-cols-1"
            style={{ width: "100px", height: "600px" }}
          >
            {product.imageURL?.slice(0, 3).map((img) => (
              <button
                key={img}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 flex items-center justify-center ${
                  selectedImage === img
                    ? "border-indigo-600 ring-2 ring-indigo-200"
                    : "border-gray-200 hover:border-indigo-400"
                }`}
              >
                <img
                  src={img}
                  alt="Thumbnail"
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>

          {/* 🔹 MAIN IMAGE (RIGHT) */}
          <div
            className="relative bg-white rounded-xl overflow-hidden flex items-center justify-center cursor-zoom-in border border-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ width: "600px", height: "600px" }}
          >
            <img
              src={selectedImage}
              alt={product.name}
              className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-200"
              style={{
                transformOrigin: zoomPosition,
                transform: zoomScale,
              }}
            />
          </div>
        </div>

        {/* RIGHT SIDE - PRODUCT DETAILS */}
        <div className="w-full max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          <p className="text-gray-500 mt-1">{product.companyName}</p>

          {/* PRICE */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-gray-900">
              ₹{Math.round(product.finalPrice)}
            </span>

            <span className="line-through text-gray-500">
              ₹{Math.round(product.currentPrice)}
            </span>

            <span className="text-green-600 font-semibold">
              {product.discount}% off
            </span>
          </div>

          {/* DESCRIPTION */}
          <p className="mt-6 text-gray-700 leading-relaxed">
            {product.itemInfo}
          </p>

          {/* META INFO */}
          <div className="mt-4 space-y-1 text-sm text-gray-500">
            <p>Category: {product.category}</p>
            <p>
              Stock:{" "}
              <span
                className={
                  product.stock > 0 ? "text-green-600" : "text-red-500"
                }
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </p>
          </div>

          {/* SPECIFICATIONS */}
          {product.attributes && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                Specifications
              </h3>

              <div className="grid grid-cols-1 gap-3 text-sm">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-gray-200 py-2"
                  >
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium text-gray-800">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS SECTION */}
          <div className="mt-10 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ratings & Reviews
            </h3>

            {/* AVERAGE RATING */}
            <div className="flex items-center gap-3 mb-6">
              {/* BIG NUMBER */}
              <span className="text-3xl font-bold text-gray-900">
                {Number(product.averageRating || 0).toFixed(1)}
              </span>

              {/* STARS */}
              <StarRating rating={Number(product.averageRating || 0)} />

              {/* REVIEW COUNT */}
              <span className="text-gray-500 text-sm">
                ({product.reviewCount || 0} reviews)
              </span>
            </div>

            {/* REVIEW LIST */}
            {displayedReviews.length > 0 ? (
              <div className="h-[516px] overflow-y-auto pr-2 space-y-5 border rounded-lg p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {displayedReviews.map((review, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">
                        {review.userName || "Anonymous"}
                      </p>

                      <StarRating rating={review.rating} />
                    </div>

                    <p className="text-sm text-gray-800 mt-1">
                      {review.comment || "No comment provided."}
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            )}
          </div>

          {/* ADD TO CART */}
          <button
            onClick={addToCart}
            className="mt-8 w-full py-3 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <SimilarProducts productId={product._id} />

      <Footer />
    </div>
  );
}
