export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/app/_lib/razorpay";
import { connectDB } from "@/app/_lib/databaseConnection";
import order from "@/module/order";
import { getUserIdFromToken } from "@/app/_lib/getUser";

export async function POST(req: NextRequest) {
  try {
    // ⚠️ Client-sent amount/discount are ignored — server owns the number.
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "orderId required" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔐 Auth
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔐 Ownership
    const dbOrder = await order.findById(orderId);
    if (!dbOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (dbOrder.userId.toString() !== userId._id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔒 Recompute payable total from stored order items minus stored discount.
    const subtotal = dbOrder.items.reduce(
      (acc: number, item: any) => acc + item.price * item.qty,
      0
    );
    const computedTotal = Math.max(0, subtotal - (dbOrder.discount || 0));

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(computedTotal * 100), // paise
      currency: "INR",
      receipt: `order_${orderId}`,
    });

    await order.findByIdAndUpdate(
      orderId,
      {
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
