export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/app/_lib/razorpay";
import { connectDB } from "@/app/_lib/databaseConnection";
import order from "@/module/order";

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, discount } = await req.json();

    if (!amount || !orderId) {
      return NextResponse.json(
        { message: "Amount & orderId required" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `order_${orderId}`,
    });

    await connectDB();
    
        await order.findByIdAndUpdate(
          orderId,
          {
            discount: discount,
            total: Number(razorpayOrder.amount) / 100, // convert back to rupees
          },
          { returnDocument: "after" }
        );

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Razorpay order failed" },
      { status: 500 }
    );
  }
}