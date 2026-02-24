"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginForm = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: { success: boolean; message?: string } = await res.json();

      if (!res.ok || !data.success) {
        setMessage(data.message || "Invalid credentials");
      } else {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => router.push("/admin/dashboard"), 1000);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex w-[800px] bg-white rounded-3xl shadow-lg overflow-hidden">
        {/* LEFT SIDE FORM */}
        <div className="w-1/2 p-10">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Admin Login</h2>
          <p className="text-gray-500 mb-6">
            Enter your credentials to access the admin panel
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm text-center ${
                message.includes("success") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        {/* RIGHT SIDE INFO PANEL */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
          <div className="text-white text-center px-6">
            <h3 className="text-2xl font-bold mb-3">Welcome, Admin 👋</h3>
            <p className="text-indigo-100 text-sm">
              Securely manage users, products, and orders from the admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}