"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchContent from "./search";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-10">Loading search...</p>}>
      <SearchContent />
    </Suspense>
  );
}