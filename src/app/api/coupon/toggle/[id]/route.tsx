import { NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import { Coupon } from "@/module/coupon";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 params is Promise
) {
  await connectDB();

  const { id } = await context.params; // 👈 unwrap params

  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return NextResponse.json(
      { message: "Coupon not found" },
      { status: 404 }
    );
  }

  coupon.isActive = !coupon.isActive;
  await coupon.save();

  return NextResponse.json({ success: true });
}