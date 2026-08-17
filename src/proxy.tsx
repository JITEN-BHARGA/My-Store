import { NextRequest, NextResponse } from "next/server";
import { tokenVerify } from "@/app/_lib/jwt";

// Next.js 16 proxy (formerly "middleware"). Runs on the matched routes below.
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // tokenVerify returns null on failure (it does NOT throw) — check for null explicitly.
  if (!token || tokenVerify(token) === null) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Gate seller + customer pages. APIs self-protect via getUserIdFromToken.
export const config = {
  matcher: [
    "/cart/:path*",
    "/checkout/:path*",
    "/myorder/:path*",
    "/wishlist/:path*",
    "/dashboard/:path*",
    "/my-products/:path*",
    "/seller/:path*",
    "/editProduct/:path*",
  ],
};
