import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const params = await context.params;
    const id = params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // 🔍 name keywords (first 2 words)
    const keywords = product.name
      ?.split(" ")
      .slice(0, 2)
      .join("|");

    let similar = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      companyName: product.companyName,
      name: { $regex: keywords, $options: "i" },
      isActive: true,
    })
      .limit(6);

    // fallback 1 → same category + same brand
    if (similar.length < 6) {
      const more = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        companyName: product.companyName,
        isActive: true,
      })
        .limit(6 - similar.length);

      similar = [...similar, ...more];
    }

    // fallback 2 → same category only
    if (similar.length < 6) {
      const more = await Product.find({
        _id: { $ne: product._id },
        category: product.category,
        isActive: true,
      })
        .limit(6 - similar.length);

      similar = [...similar, ...more];
    }

    // ❗ remove duplicates
    const unique = Array.from(
      new Map(similar.map((p) => [p._id.toString(), p])).values()
    );
    
    return NextResponse.json(unique.slice(0, 6));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch similar products" },
      { status: 500 }
    );
  }
}