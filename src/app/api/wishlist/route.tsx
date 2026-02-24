import { connectDB } from "@/app/_lib/databaseConnection";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import Wishlist from "@/module/wishlist";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate("productIds");

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}