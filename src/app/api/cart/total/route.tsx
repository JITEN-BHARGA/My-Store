import { NextRequest, NextResponse } from "next/server"
import cart from "@/module/cartItem"
import { getUserIdFromToken } from "@/app/_lib/getUser"
import { connectDB } from "@/app/_lib/databaseConnection"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getUserIdFromToken(req)

    if (!user) {
      return NextResponse.json({ total: 0 }, { status: 200 })
    }

    const cartItems = await cart.find({ userId: user._id }).populate("productId")

    const total = cartItems.reduce((acc: number, item: any) => {
      const price = item.productId?.finalPrice || 0
      return acc + price * item.qty
    }, 0)

    return NextResponse.json({ total })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ total: 0 }, { status: 500 })
  }
}
