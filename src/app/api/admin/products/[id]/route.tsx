import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const productId = params.id;
  if (!productId) {
    return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      productId: deletedProduct._id,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}