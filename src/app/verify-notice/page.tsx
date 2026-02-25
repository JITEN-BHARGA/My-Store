"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyNoticePage() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) return;

        const data = await res.json();

        if (data?.user?.isVerified) {
          router.push("/login");
        }
      } catch (error) {
        console.log("Verification check failed");
      }
    }, 3000); // check every 3 seconds

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="p-8 rounded-2xl bg-indigo-600 text-white text-center shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-3">📧 Check your email</h1>
        <p className="text-indigo-100">
          Please verify your account through the link sent to your email.
        </p>

        <p className="text-sm mt-4 text-indigo-200">
          Waiting for verification...
        </p>
      </div>
    </div>
  );
}