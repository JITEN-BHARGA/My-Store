import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Order from "@/module/order";
import { verifyAdmin} from "@/app/lib/middleware/adminAuth";

export async function GET(req: NextRequest) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all orders with user and product info
    const orders = await Order.find()
      .populate("userId", "name email userName")
      .populate("items.productId", "name currentPrice")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}