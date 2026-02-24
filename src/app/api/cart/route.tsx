import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/_lib/databaseConnection"
import Cart from "@/module/cartItem"
import "@/module/product"
import { getUserIdFromToken } from "@/app/_lib/getUser"

export async function GET(req : NextRequest) {
  await connectDB()

  const userId = await getUserIdFromToken(req)

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const cart = await Cart.find({ userId }).populate("productId")
  
  return NextResponse.json({ cart })
}

export async function PATCH(req: Request) {
  try {
    await connectDB()

    const { cartItemId, action } = await req.json()

    if (!cartItemId || !action) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      )
    }

    const cartItem = await Cart.findById(cartItemId)

    if (!cartItem) {
      return NextResponse.json(
        { message: "Cart item not found" },
        { status: 404 }
      )
    }

    if (action === "increase") {
      cartItem.qty += 1
      await cartItem.save()
    }

    if (action === "decrease") {
      if (cartItem.qty > 1) {
        cartItem.qty -= 1
        await cartItem.save()
      }
    }

    if (action === "remove") {
      await Cart.findByIdAndDelete(cartItemId)
    }

    const updatedCart = await Cart.find({ userId: cartItem.userId })
      .populate("productId")

    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}