import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Cart from "@/module/cartItem";
import { getUserIdFromToken } from "@/app/_lib/getUser";

export async function POST(req: NextRequest) {
  await connectDB();

  const userId = await getUserIdFromToken(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json(
      { message: "productId is required" },
      { status: 400 },
    );
  }

  // find cart of user
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // create new cart with first product
    cart = Cart.create({
      userId,
      products: [{ productId, qty: 1 }],
    });

    return NextResponse.json({ message: "Cart created and product added" });
  }

  // check if product already exists in cart
  const productIndex = cart.products.findIndex(
    (item: any) => item.productId.toString() === productId,
  );

  if (productIndex > -1) {
    // product exists → increase qty
    cart.products[productIndex].qty += 1;
  } else {
    // new product → push into array
    cart.products.push({ productId, qty: 1 });
  }

  await cart.save();

  return NextResponse.json({ message: "Cart updated" });
}
