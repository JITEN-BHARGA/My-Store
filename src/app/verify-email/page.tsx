"use client";

import { Suspense } from "react";
import VerifyEmailContent from "./verify"; // move client logic here

export const dynamic = "force-dynamic";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Verifying...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}