import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/app/_lib/databaseConnection";
import Product from "@/module/product";

// 🔐 Replace with real auth
const getSellerId = (req: NextRequest) => {
  return req.headers.get("x-seller-id") || "seller_123";
};

// 📄 GET SINGLE PRODUCT
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ await params

    const product = await Product.findById({_id : id});

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ✏️ UPDATE PRODUCT (Only Seller Owner)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const sellerId = getSellerId(req);
    const body = await req.json();

    const params = await context.params;
    const id = params.id;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.sellerId !== sellerId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    if (body.currentPrice || body.discount) {
      const price = body.currentPrice ?? product.currentPrice;
      const discount = body.discount ?? product.discount ?? 0;

      body.finalPrice = price - (price * discount) / 100;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ❌ DELETE PRODUCT (Only Seller Owner)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const sellerId = getSellerId(req);

    const params = await context.params;
    const product = await Product.findById(params.id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.sellerId !== sellerId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
