"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type role = "customer" | "seller";

type SignupForm = {
  name: string;
  userName: string;
  email: string;
  password: string;
  role: role;
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    userName: "",
    email: "",
    password: "",
    role: "customer",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data: { success: boolean; message?: string } = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Signup failed");
      } else {
        setMessage("Signup successful 🎉 Redirecting...");

        setTimeout(() => {
          router.push("/verify-notice");
        }, 1500);
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2ff]">
      <div className="flex w-[900px] rounded-3xl shadow-xl overflow-hidden bg-white">
        
        {/* LEFT SIDE FORM */}
        <div className="w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign Up</h2>
          <p className="text-gray-500 mb-6">
            Create your account to get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="text"
              name="userName"
              placeholder="Username"
              value={form.userName}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>

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
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-center text-red-500">{message}</p>
          )}

          {/* LOGIN REDIRECT LINK */}
          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-indigo-600 font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>

        {/* RIGHT SIDE DESIGN PANEL */}
        <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
          <div className="text-white text-center px-6">
            <h3 className="text-2xl font-bold mb-3">
              Your data, your rules
            </h3>
            <p className="text-indigo-100 text-sm">
              Secure. Fast. Reliable.  
              Join us and manage everything in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
