"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

interface OrderItem {
  _id: string;
  qty: number;
  price: number;
  status: string;
  isDelivered: boolean;
  deliveryDate?: string;
  productId: {
    _id: string;
    name: string;
    imageURL: string[];
  };
}

interface Order {
  _id: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});
  const [reviews, setReviews] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const res = await fetch("/api/order", { credentials: "include" });
    const data = await res.json();

    if (!data.orders) {
      console.error("Invalid order response");
      return [];
    }

    setOrders(data.orders);
    return data.orders;
  };

  const fetchExistingReviews = async (ordersData: Order[]) => {
    const newRatings: { [key: string]: number } = {};
    const newReviews: { [key: string]: string } = {};
    const newSubmitted: { [key: string]: boolean } = {};

    await Promise.all(
      ordersData.map(async (order) => {
        for (const item of order.items) {
          if (!item.isDelivered) continue;
          // Product may have been deleted — its populated ref is then null.
          if (!item.productId?._id) continue;

          try {
            const res = await fetch(`/api/reviews/${item.productId._id}`, {
              method: "GET",
              credentials: "include",
            });

            const reviewData = await res.json();

            if (reviewData?.reviews?.length > 0) {
              const myReview = reviewData.reviews[0];
              newRatings[item._id] = myReview.rating;
              newReviews[item._id] = myReview.comment;
              newSubmitted[item._id] = true;
            }
          } catch (err) {
            console.error("Review fetch error", err);
          }
        }
      }),
    );

    setRatings(newRatings);
    setReviews(newReviews);
    setSubmitted(newSubmitted);
  };

  const handleSubmitReview = async (item: OrderItem) => {
    if (!item.productId?._id) {
      alert("This product is no longer available");
      return;
    }
    if (!ratings[item._id]) {
      alert("Please select a rating");
      return;
    }

    try {
      const res = await fetch(`/api/reviews/${item.productId._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: ratings[item._id],
          comment: reviews[item._id],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit review");
        return;
      }

      setSubmitted((prev) => ({
        ...prev,
        [item._id]: true,
      }));
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const ordersData = await fetchOrders();
        await fetchExistingReviews(ordersData);
      } catch (err) {
        console.error("Load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (orders.length === 0) return <p className="p-4">No orders found.</p>;

  return (
    <div className="min-h-screen text-gray-800">
      <Navbar />

      <section className="relative overflow-hidden text-white text-center py-16 px-4 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-10 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-float"
        />
        <h2 className="relative text-3xl sm:text-4xl font-black">My Orders</h2>
        <p className="relative text-indigo-100 mt-2">
          Track, manage and review your orders
        </p>
      </section>

      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto space-y-6">
        <h2 className="text-2xl font-extrabold mb-6 text-gray-900">
          Recent Orders
        </h2>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white/85 border border-white/70 rounded-2xl elev-2 p-5 animate-fade-up"
            >
              <div className="flex justify-between items-center px-2 py-2 mb-4">
                <p className="text-sm font-semibold text-gray-700">
                  Order ID: {order._id}
                </p>
                <p className="text-sm font-black text-gradient">
                  ₹{order.total}
                </p>
              </div>

              {order.items.map((item) => {
                const isDelivered = item.isDelivered;

                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6 border-t pt-4"
                  >
                    <img
                      src={
                        item.productId?.imageURL?.[0] ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item.productId?.name}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />

                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-gray-900">
                        {item.productId?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.qty}
                      </p>
                      <p className="text-sm font-semibold text-green-600">
                        Total Amount: ₹{item.price * item.qty}
                      </p>

                      {!isDelivered ? (
                        <p className="text-sm text-blue-600">
                          Expected delivery{" "}
                          {item.deliveryDate
                            ? new Date(item.deliveryDate).toLocaleDateString()
                            : "Pending"}
                        </p>
                      ) : (
                        <p className="text-sm text-green-600">
                          Delivered on{" "}
                          {item.deliveryDate
                            ? new Date(item.deliveryDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      )}

                      <span
                        className={`inline-block text-xs py-1 rounded mt-1 ${
                          isDelivered
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        STATUS: {item.status}
                      </span>

                      {isDelivered && submitted[item._id] && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-sm font-medium mb-1">
                            Your Rating:
                          </p>
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-xl">
                                {star <= (ratings[item._id] || 0) ? "⭐" : "☆"}
                              </span>
                            ))}
                          </div>

                          {reviews[item._id] && (
                            <p className="text-sm text-gray-700 bg-gray-100 p-2 rounded">
                              {reviews[item._id]}
                            </p>
                          )}
                        </div>
                      )}

                      {isDelivered && item.productId && !submitted[item._id] && (
                        <div className="mt-4 border-t pt-3">
                          <p className="text-sm font-medium mb-1">
                            Rate this product:
                          </p>

                          <div className="flex gap-1 mb-2 flex-wrap">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() =>
                                  setRatings((prev) => ({
                                    ...prev,
                                    [item._id]: star,
                                  }))
                                }
                                className="text-xl"
                              >
                                {star <= (ratings[item._id] || 0) ? "⭐" : "☆"}
                              </button>
                            ))}
                          </div>

                          <textarea
                            placeholder="Share your experience with this product..."
                            value={reviews[item._id] || ""}
                            onChange={(e) =>
                              setReviews((prev) => ({
                                ...prev,
                                [item._id]: e.target.value,
                              }))
                            }
                            className="input text-sm mb-2"
                            rows={3}
                          />

                          <button
                            onClick={() => handleSubmitReview(item)}
                            className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-[0_8px_18px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-transform"
                          >
                            Submit Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
