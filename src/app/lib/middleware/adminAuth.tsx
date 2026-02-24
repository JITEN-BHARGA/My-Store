import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Admin from "@/module/admin";
import { connectDB } from "@/app/_lib/databaseConnection";

/**
 * Admin JWT authentication middleware
 * Usage: call verifyAdmin(req) in your API route
 * ✅ Now reads token from cookies
 */
export const verifyAdmin = async (req: NextRequest) => {
  await connectDB();

  // ✅ Read token from cookies
  const token = req.cookies.get("adminToken")?.value;
  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_ADMIN_SECRET!);

    // find admin by id
    const admin = await Admin.findById(decoded.id);
    return admin || null;
  } catch (err) {
    console.error("Admin token verification failed:", err);
    return null;
  }
};

/**
 * Middleware for server-side route protection (optional)
 */
export const adminAuthMiddleware = async (req: NextRequest) => {
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return admin;
};