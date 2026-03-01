import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/_lib/databaseConnection"
import Cart from "@/module/cartItem"
import "@/module/product"
import { getUserIdFromToken } from "@/app/_lib/getUser"

export async function GET(req: NextRequest) {
  await connectDB()

  const userId = await getUserIdFromToken(req)

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const cart = await Cart.findOne({ userId }).populate({
    path: "products.productId",
    select: "name companyName finalPrice imageURL",
  })

  return NextResponse.json({
    cart: cart || { products: [] },
  })
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB()

    const userId = await getUserIdFromToken(req)

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { productId, action } = await req.json()

    if (!productId || !action) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      )
    }

    const cart = await Cart.findOne({ userId })

    if (!cart) {
      return NextResponse.json({ cart: { products: [] } })
    }

    const productIndex = cart.products.findIndex(
      (item: any) => item.productId.toString() === productId
    )

    if (productIndex === -1) {
      return NextResponse.json({ cart })
    }

    if (action === "increase") {
      cart.products[productIndex].qty += 1
    }

    if (action === "decrease") {
      cart.products[productIndex].qty -= 1

      if (cart.products[productIndex].qty <= 0) {
        cart.products.splice(productIndex, 1)
      }
    }

    if (action === "remove") {
      cart.products.splice(productIndex, 1)
    }

    await cart.save()

    const updatedCart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "name companyName finalPrice imageURL",
    })

    return NextResponse.json({ cart: updatedCart })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    )
  }
}