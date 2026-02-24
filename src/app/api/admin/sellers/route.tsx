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
    // Fetch all sellers
    const sellers = await User.find({ role: "seller" })
      .select("-password") // remove sensitive info
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sellers,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sellers" },
      { status: 500 }
    );
  }
}