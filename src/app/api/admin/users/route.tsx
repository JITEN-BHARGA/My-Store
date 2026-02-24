import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import User from "@/module/user";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function GET(req: NextRequest) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all users
    const users = await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}