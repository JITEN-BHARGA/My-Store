import { NextResponse } from "next/server";
import { Coupon } from "@/module/coupon";
import { connectDB } from "@/app/_lib/databaseConnection";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return NextResponse.json({ message: "Invalid Coupon" }, { status: 404 });
    }

    if (subtotal < coupon.minPurchase) {
      return NextResponse.json({ message: `Spend at least ₹${coupon.minPurchase} to use this.` }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.type === "percent") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    return NextResponse.json({ discountAmount, code: coupon.code });
  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}