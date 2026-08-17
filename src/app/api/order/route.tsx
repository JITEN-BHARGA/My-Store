import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import cart from "@/module/cartItem";
import Product from "@/module/product";
import "@/module/address";
import address from "@/module/address";
import { Coupon } from "@/module/coupon";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import { connectDB } from "@/app/_lib/databaseConnection";
import order from "@/module/order";

// Thrown inside the transaction when a product lacks stock, so the whole
// order aborts atomically.
class InsufficientStockError extends Error {
  insufficientStock = true;
  productId: string;
  constructor(productId: string) {
    super("Insufficient stock");
    this.productId = productId;
  }
}

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
  const session = await mongoose.startSession();
  try {
    await connectDB();

    const userId = await getUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ⚠️ Client-sent discount/total are never trusted — accept only a coupon code.
    const body = await req.json();
    const addressId = body.addressId;
    const couponCode = body.couponCode ?? body.coupon;

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

    // ✅ Build order items from cart.products[] — price only from DB finalPrice.
    const items = userCart.products.map((item: any) => ({
      productId: item.productId._id,
      qty: item.qty,
      price: item.productId.finalPrice,
    }));

    // 🔒 subtotal is computed only from DB finalPrice.
    const subtotal = items.reduce(
      (acc: number, item: any) => acc + item.price * item.qty,
      0,
    );

    // 🔒 Coupon is validated server-side against the DB — client discount ignored.
    let discount = 0;
    let appliedCode = "";
    if (couponCode) {
      const dbCoupon = await Coupon.findOne({
        code: String(couponCode).toUpperCase(),
        isActive: true,
      });

      if (dbCoupon && subtotal >= (dbCoupon.minPurchase || 0)) {
        discount =
          dbCoupon.type === "percent"
            ? (subtotal * dbCoupon.value) / 100
            : dbCoupon.value;
        discount = Math.min(discount, subtotal); // never below zero
        appliedCode = dbCoupon.code;
      }
    }

    const total = subtotal - discount;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    // 🔒 Stock decrement + order create + cart clear are one atomic transaction.
    let newOrder: any;
    await session.withTransaction(async () => {
      // Atomic, guarded stock decrement — rejects overselling.
      for (const item of items) {
        const result = await Product.updateOne(
          { _id: item.productId, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } },
          { session },
        );
        if (result.modifiedCount !== 1) {
          throw new InsufficientStockError(item.productId.toString());
        }
      }

      const created = await order.create(
        [
          {
            userId,
            items,
            addressId,
            subtotal,
            discount,
            couponCode: appliedCode,
            total,
            paymentMethod: "ONLINE PAYMENT",
            status: "Placed",
            deliveryDate,
            isDelivered: false,
          },
        ],
        { session },
      );
      newOrder = created[0];

      // 🔥 Clear cart properly (array structure)
      userCart.products = [];
      await userCart.save({ session });
    });

    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (error: any) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        {
          message: "Insufficient stock",
          productId: error.productId,
        },
        { status: 400 },
      );
    }
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
