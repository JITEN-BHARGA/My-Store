import { NextRequest, NextResponse } from "next/server"
import {connectDB} from "@/app/_lib/databaseConnection"
import Cart from "@/module/cartItem"
import { getUserIdFromToken } from "@/app/_lib/getUser"

export async function POST(req: NextRequest) {
  await connectDB()

  const userId = await getUserIdFromToken(req)
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { productId } = await req.json()

  const existing = await Cart.findOne({ userId, productId })

  if (existing) {
    existing.qty += 1
    await existing.save()
  } else {
    await Cart.create({ userId, productId, qty: 1 })
  }

  return NextResponse.json({ message: "Added to cart" })
}
