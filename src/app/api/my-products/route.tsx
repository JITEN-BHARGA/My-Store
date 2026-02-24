import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/_lib/databaseConnection"
import Product from "@/module/product"
import { getUserIdFromToken } from "@/app/_lib/getUser"

export async function GET(req: NextRequest) {
  await connectDB()

  const userId = await getUserIdFromToken(req)

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 })

  return NextResponse.json({ products })
}
