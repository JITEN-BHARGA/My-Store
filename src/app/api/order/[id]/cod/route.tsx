import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/app/_lib/databaseConnection";
import Order from "@/module/order";
import { getUserIdFromToken } from "@/app/_lib/getUser";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    await connectDB();

    // 🔐 Auth
    const userId = await getUserIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔐 Ownership
    const existing = await Order.findById(orderId);
    if (!existing) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (existing.userId.toString() !== userId._id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 🔒 Server owns the amount — recompute from stored items minus stored discount.
    const subtotal = existing.items.reduce(
      (acc: number, item: any) => acc + item.price * item.qty,
      0
    );
    const finalAmount = Math.max(0, subtotal - (existing.discount || 0));

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentMethod: "COD",
        status: "Placed",
        total: finalAmount
      },
      { returnDocument: "after" }
    );

    return NextResponse.json({ message: "COD selected", order });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
