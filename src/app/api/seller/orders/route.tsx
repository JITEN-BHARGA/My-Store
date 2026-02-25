import { connectDB } from "@/app/_lib/databaseConnection";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import Order from "@/module/order";
import Product from "@/module/product";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const sellerId = await getUserIdFromToken(req);

    if (!sellerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get seller products
    const sellerProducts = await Product.find({ sellerId }).select("_id");
    const productIds = sellerProducts.map((p) => p._id);

    if (productIds.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    // ✅ Find orders that contain seller products
    const orders = await Order.find({
      "items.productId": { $in: productIds },
    })
      .populate("userId", "name email")
      .populate("items.productId", "name imageURL sellerId");

    // ✅ Return only seller items per order
    const sellerOrders = orders.map((order: any) => {
      const sellerItems = order.items.filter((item: any) =>
        productIds.some((id) => id.equals(item.productId?._id)),
      );

      return {
        _id: order._id,
        user: order.userId,
        createdAt: order.createdAt,

        items: sellerItems.map((item: any) => ({
          productId: item.productId,
          qty: item.qty,
          price: item.price,
          status: item.status || "Placed",
          isDelivered: item.isDelivered || false,
          deliveryDate: item.deliveryDate || null,
        })),
      };
    });

    return NextResponse.json({ orders: sellerOrders });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const seller = await getUserIdFromToken(req);
    const sellerId = seller?._id || seller;

    if (!sellerId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId, productId } = await req.json();

    if (
      !mongoose.Types.ObjectId.isValid(orderId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json({ message: "Invalid IDs" }, { status: 400 });
    }

    const order = await Order.findById(orderId).populate(
      "items.productId",
      "sellerId",
    );

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ✅ find item that belongs to this seller
    const item = order.items.find((i: any) => {
      if (!i.productId) return false;

      const sellerIdStr = typeof i.productId.sellerId === 'string' 
        ? i.productId.sellerId 
        : i.productId.sellerId._id;

      const sellerIdValue = typeof sellerIdStr === 'string' ? sellerIdStr : sellerIdStr.toString();

      return (
        i.productId._id.toString() === productId &&
        new mongoose.Types.ObjectId(sellerIdValue).equals(new mongoose.Types.ObjectId(sellerId.toString()))
      );
    });

    if (!item) {
      return NextResponse.json(
        { message: "Not allowed: seller does not own this product" },
        { status: 403 },
      );
    }

    // ✅ update item-level delivery
    item.status = "Delivered";
    item.isDelivered = true;
    item.deliveryDate = new Date();

    // ✅ update order-level status
    const allDelivered = order.items.every((i: any) => i.isDelivered);
    order.status = allDelivered ? "Delivered" : "Partially Delivered";

    await order.save();

    return NextResponse.json({
      success: true,
      message: "Item marked as delivered",
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
