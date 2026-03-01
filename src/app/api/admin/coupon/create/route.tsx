import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import { Coupon } from "@/module/coupon";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const admin = await verifyAdmin(req);
      if (!admin) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

    const { code, type, value, minPurchase } = await req.json();

    if (!code || !type || !value) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });

    if (existing) {
      return NextResponse.json(
        { message: "Coupon already exists" },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      type,
      value,
      minPurchase: minPurchase || 0,
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    return NextResponse.json(
      { message: "Failed to create coupon" },
      { status: 500 }
    );
  }
}