import { NextRequest, NextResponse } from "next/server";
import cart from "@/module/cartItem";
import "@/module/product";
import "@/module/address";
import address from "@/module/address";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import { connectDB } from "@/app/_lib/databaseConnection";
import order from "@/module/order";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const orders = await order.find({ userId })
      .populate("items.productId")
      .populate("addressId")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET Order Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { addressId, coupon } = await req.json();

    if (!addressId) {
      return NextResponse.json(
        { message: "Address required" },
        { status: 400 },
      );
    }

    const selectedAddress = await address.findOne({
      _id: addressId,
      userId,
    });

    if (!selectedAddress) {
      return NextResponse.json({ message: "Invalid address" }, { status: 404 });
    }

    // ✅ Get single cart document
    const userCart = await cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "finalPrice",
    });

    if (!userCart || userCart.products.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // ✅ Build order items from cart.products[]
    const items = userCart.products.map((item: any) => ({
      productId: item.productId._id,
      qty: item.qty,
      price: item.productId.finalPrice,
    }));

    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.price * item.qty,
      0,
    );

    let discount = 0;
    if (coupon === "SAVE10") {
      discount = subtotal * 0.1;
    }

    const total = subtotal - discount;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    const newOrder = await order.create({
      userId,
      items,
      addressId,
      subtotal,
      discount,
      total,
      paymentMethod: "ONLINE PAYMENT",
      status: "Placed",
      deliveryDate,
      isDelivered: false,
    });

    // 🔥 Clear cart properly (array structure)
    userCart.products = [];
    await userCart.save();

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
