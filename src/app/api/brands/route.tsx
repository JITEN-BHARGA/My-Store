import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const matchStage: any = {};
    if (category) matchStage.category = category;

    const brands = await Product.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: "$companyName",
          count: { $sum: 1 }, // number of products per brand
        },
      },

      { $sort: { count: -1 } }, // top brands first
      { $limit: 6 }, // only 6 brands

      {
        $project: {
          _id: 0,
          name: "$_id",
        },
      },
    ]);

    return NextResponse.json({ brands });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}