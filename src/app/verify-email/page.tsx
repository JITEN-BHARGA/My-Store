"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token");

  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }

    fetch(`/api/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Verification failed"));
  }, [token]);

  return <h1 className="text-center mt-10 text-xl font-semibold">{message}</h1>;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<h1 className="text-center mt-10">Verifying...</h1>}>
      <VerifyEmailContent />
    </Suspense>
  );
}