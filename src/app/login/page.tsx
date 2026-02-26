"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginForm = {
  email: string;
  password: string;
  role: "customer" | "seller";
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    role: "customer", // default role
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMsg("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setForgotMsg(data.message || "Error sending reset email");
      } else {
        setForgotMsg("Password reset link sent to your email 📩");
        setForgotEmail("");
      }
    } catch {
      setForgotMsg("Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data: { success: boolean; message?: string; token?: string } =
        await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid credentials");
      } else {
        setMessage("Login successful 🎉 Redirecting...");

        setTimeout(() => {
          if (form.role === "seller") router.push("/dashboard");
          else router.push("/");
        }, 1000);
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2ff] p-4">
      <div className="flex flex-col lg:flex-row w-full max-w-[900px] rounded-3xl shadow-xl overflow-hidden bg-white">
        {/* LEFT SIDE FORM */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
          <p className="text-gray-500 mb-6">
            Welcome back! Please enter your details
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            {/* ROLE SELECTION */}
            <div className="flex gap-4 mt-2 flex-wrap">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={form.role === "customer"}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Customer</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="seller"
                  checked={form.role === "seller"}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-gray-700">Seller</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-sm text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-center text-red-500">{message}</p>
          )}

          <p className="mt-6 text-sm text-gray-600 text-center">
            Don’t have an account?{" "}
            <span
              onClick={() => router.push("/signup")}
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>

        {/* RIGHT SIDE PANEL */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center p-6 lg:p-0">
          <div className="text-white text-center px-4">
            <h3 className="text-2xl font-bold mb-3">Welcome Back 👋</h3>
            <p className="text-indigo-100 text-sm">
              Login to continue managing your account securely and easily.
            </p>
          </div>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-xl relative">
            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-2">Forgot Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter your login email and we’ll send you a reset link.
            </p>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {forgotMsg && (
              <p className="mt-3 text-sm text-center text-red-500">
                {forgotMsg}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
