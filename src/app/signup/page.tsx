"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SignupForm = {
  name: string;
  userName: string;
  email: string;
  password: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    userName: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
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
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-60 animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 60%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 w-[34rem] h-[34rem] rounded-full blur-3xl opacity-50 animate-aurora"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.45), transparent 60%)", animationDelay: "3s" }}
      />
      <div className="relative flex flex-col sm:flex-row w-full max-w-4xl rounded-3xl elev-4 overflow-hidden glass animate-fade-up">
        {/* LEFT SIDE FORM */}
        <div className="w-full sm:w-1/2 p-8 sm:p-10 bg-white/80">
          <h2 className="text-3xl font-black text-gray-900 mb-2">Sign Up</h2>
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
              className="sheen w-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-3.5 rounded-xl font-semibold shadow-[0_12px_28px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform disabled:opacity-70"
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
        <div className="relative w-full sm:w-1/2 bg-gradient-to-br from-indigo-500 via-violet-600 to-fuchsia-600 flex items-center justify-center py-12 sm:py-0 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-white/20 blur-3xl animate-float"
          />
          <div className="relative text-white text-center px-6">
            <div className="text-5xl mb-4 animate-float">🚀</div>
            <h3 className="text-2xl font-black mb-3">Your data, your rules</h3>
            <p className="text-indigo-100 text-sm">
              Secure. Fast. Reliable. Join us and manage everything in one
              place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
