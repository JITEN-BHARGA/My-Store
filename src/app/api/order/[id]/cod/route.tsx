import { NextResponse } from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/app/_lib/databaseConnection";
import Order from "@/module/order";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const params = await context.params;
    const orderId = params.id;

    const body = await req.json();
    const { cartTotal, discount } = body;

    const finalAmount = (cartTotal || 0) - (discount || 0);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "Invalid order id" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentMethod: "COD",
        status: "Placed",
        discount: discount,
        total: finalAmount
      },
      { returnDocument: "after" }
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "COD selected", order });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}