import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import product from "@/module/product";
import User from "@/module/user";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id : string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const userId = await getUserIdFromToken(req); 
    
    const Product = await product.findOne({
      _id: id,
      "reviews.userId": userId
    }).lean();

    if (!Product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Return all reviews
    return NextResponse.json(
      {
        reviews: Product.reviews || [],
        reviewCount: Product.reviewCount || 0,
        averageRating: Product.averageRating || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await context.params;
    const userId = await getUserIdFromToken(req);
    const user = await User.findOne({ _id : userId}) // Fetch user name for review display

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const Product = await product.findById(id);

    if (!Product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Prevent duplicate review by same user
    const alreadyReviewed = Product.reviews?.find(
      (r: any) => r.userId.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return NextResponse.json(
        { message: "You already reviewed this product" },
        { status: 400 }
      );
    }
    console.log(user.userName)

    // ✅ Push new review with createdAt
    Product.reviews = [
      ...(Product.reviews || []),
      {
        userId,
        userName : user.userName, // Store user name for display
        rating,
        comment,
        createdAt: new Date(),
      },
    ];

    // ✅ Update review count
    Product.reviewCount = Product.reviews.length;

    // ✅ Recalculate average rating
    const totalRating = Product.reviews.reduce(
      (sum: number, r: any) => sum + r.rating,
      0
    );

    Product.averageRating =
      totalRating / Product.reviewCount;

    await Product.save();

    return NextResponse.json(
      {
        message: "Review added successfully",
        averageRating: Product.averageRating,
        reviewCount: Product.reviewCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}