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

  if (userId.role !== "seller") {
    return NextResponse.json({ message: "Forbidden: sellers only" }, { status: 403 })
  }

  const products = await Product.find({ sellerId: userId._id }).sort({ createdAt: -1 })

  return NextResponse.json({ products })
}
