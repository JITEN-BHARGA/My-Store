import { NextRequest, NextResponse } from "next/server";
import Product from "@/module/product";
import { connectDB } from "@/app/_lib/databaseConnection";
import { getUserIdFromToken } from "@/app/_lib/getUser";

enum Catagory {
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Groceries",
  "Mobiles",
  "Accessories",
}

// ➕ CREATE PRODUCT
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const sellerId = await getUserIdFromToken(req);

    if (!sellerId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      name,
      imageURL,
      currentPrice,
      discount = 0,
      itemInfo,
      category,
      companyName,
      attributes,
      stock,
    } = body;

    if (!name || !currentPrice || !stock) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const finalPrice =
      currentPrice - (currentPrice * discount) / 100;

    const product = await Product.create({
      name,
      imageURL,
      currentPrice,
      discount,
      finalPrice,
      itemInfo,
      category,
      companyName,
      sellerId,
      attributes,
      stock,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}


// 📥 GET PRODUCTS (All or Seller-specific)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sellerId = getUserIdFromToken(req);

    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");

    const query = mine ? { sellerId } : {};

    const products = await Product.find(query).sort({
      createdAt: -1,
    });

    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
