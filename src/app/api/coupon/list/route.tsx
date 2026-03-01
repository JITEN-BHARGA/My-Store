import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import { Coupon } from "@/module/coupon";

export async function GET() {
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  return NextResponse.json({ coupons });
}