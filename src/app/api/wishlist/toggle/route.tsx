import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Wishlist from "@/module/wishlist";
import { getUserIdFromToken } from "@/app/_lib/getUser";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID required" },
        { status: 400 }
      );
    }

    let wishlist = await Wishlist.findOne({ userId });

    // 🆕 create wishlist if not exist
    if (!wishlist) {
      wishlist = await Wishlist.create({
        userId,
        productIds: [productId],
      });

      return NextResponse.json({
        message: "Added to wishlist ❤️",
        wishlist,
      });
    }

    // ✅ FIXED comparison
    const alreadyInWishlist = wishlist.productIds.some(
      (id: any) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      // ❌ remove
      wishlist.productIds = wishlist.productIds.filter(
        (id: any) => id.toString() !== productId
      );
    } else {
      // ❤️ add
      wishlist.productIds.push(productId);
    }

    await wishlist.save();

    return NextResponse.json({
      message: alreadyInWishlist
        ? "Removed from wishlist ❌"
        : "Added to wishlist ❤️",
      wishlist,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Wishlist toggle failed" },
      { status: 500 }
    );
  }
}