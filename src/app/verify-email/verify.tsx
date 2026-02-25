"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [message, setMessage] = useState("Verifying your email...");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/verify-email?token=${token}`);

        if (res.redirected) {
          setMessage("Email verified successfully!");
          setSuccess(true);
          setTimeout(() => router.push(res.url), 2000);
          return;
        }

        const data = await res.json();
        setMessage(data.message || "Verification failed");
      } catch (err) {
        setMessage("Verification failed");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="p-8 rounded-2xl bg-indigo-600 text-white text-center shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-3">Email Verification</h1>
        <p className="text-indigo-100">{message}</p>

        {success && (
          <p className="mt-3 text-sm text-indigo-200">
            Redirecting to login...
          </p>
        )}
      </div>
    </div>
  );
}