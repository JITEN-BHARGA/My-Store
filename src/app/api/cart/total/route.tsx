import { NextRequest, NextResponse } from "next/server"
import Cart from "@/module/cartItem"
import { getUserIdFromToken } from "@/app/_lib/getUser"
import { connectDB } from "@/app/_lib/databaseConnection"

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const userId = await getUserIdFromToken(req)

    if (!userId) {
      return NextResponse.json({ total: 0 }, { status: 200 })
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      select: "finalPrice",
    })

    if (!cart || cart.products.length === 0) {
      return NextResponse.json({ total: 0 }, { status: 200 })
    }

    const total = cart.products.reduce((acc: number, item: any) => {
      const price = item.productId?.finalPrice || 0
      return acc + price * item.qty
    }, 0)

    return NextResponse.json({ total })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ total: 0 }, { status: 500 })
  }
}