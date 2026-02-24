import { NextRequest, NextResponse } from "next/server"
import cart from "@/module/cartItem"
import address from "@/module/address"
import { getUserIdFromToken } from "@/app/_lib/getUser"
import { connectDB } from "@/app/_lib/databaseConnection"
import order from "@/module/order"

export async function GET(req: NextRequest) {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Identify User from Token
    const user = await getUserIdFromToken(req);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 3. Fetch Orders for this specific user
    // We use .sort({ createdAt: -1 }) to show the newest orders first
    // We use .populate("items.productId") to get product names/images for the UI
    const orders = await order
      .find({ userId: user._id })
      .populate("items.productId") 
      .sort({ createdAt: -1 });

    // 4. Return the data
    return NextResponse.json(
      { 
        success: true, 
        count: orders.length, 
        orders 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("GET Order Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getUserIdFromToken(req)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { addressId, coupon } = await req.json()

    if (!addressId) {
      return NextResponse.json({ message: "Address required" }, { status: 400 })
    }

    const selectedAddress = await address.findOne({
      _id: addressId,
      userId: user._id,
    })

    if (!selectedAddress) {
      return NextResponse.json({ message: "Invalid address" }, { status: 404 })
    }

    const cartItems = await cart.find({ userId: user._id }).populate("productId")

    if (!cartItems.length) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 })
    }

    const items = cartItems.map((item: any) => ({
      productId: item.productId._id,
      qty: item.qty,
      price: item.productId.finalPrice,
    }))

    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.price * item.qty,
      0
    )

    let discount = 0
    if (coupon === "SAVE10") {
      discount = subtotal * 0.1
    }

    const total = subtotal - discount

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + 7)

    const isDelivered = false;

    const newOrder = await order.create({
      userId: user._id,
      items,
      addressId,
      subtotal,
      discount,
      total,
      status: "Placed",
      deliveryDate,
      isDelivered,
    })

    // 🔥 clear cart after order
    await cart.deleteMany({ userId: user._id })

    return NextResponse.json({ order: newOrder }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
