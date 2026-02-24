export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Order from "@/module/order";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // ✅ Await params in Next.js 16
  const { id: orderId } = await context.params;

  if (!orderId) {
    return NextResponse.json(
      { message: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { status, itemStatuses } = body;

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ✅ Update overall status
    if (status) {
      order.status = status;
    }

    // ✅ Update item statuses
    if (Array.isArray(itemStatuses)) {
      order.items = order.items.map((item: any) => {
        const updatedItem = itemStatuses.find(
          (i: any) => i.itemId === item._id.toString()
        );

        if (updatedItem) {
          item.status = updatedItem.status;

          if (updatedItem.status === "Delivered") {
            item.isDelivered = true;
            item.deliveryDate = new Date();
          }
        }

        return item;
      });
    }

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order" },
      { status: 500 }
    );
  }
}