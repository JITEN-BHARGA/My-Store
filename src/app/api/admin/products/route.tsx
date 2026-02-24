import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function GET(req: NextRequest) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all products
    const products = await Product.find()
      .populate("sellerId", "name email userName") // include seller info
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}