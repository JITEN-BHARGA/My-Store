import { NextRequest, NextResponse } from "next/server"
import address from "@/module/address"
import { getUserIdFromToken } from "@/app/_lib/getUser"
import { connectDB } from "@/app/_lib/databaseConnection"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getUserIdFromToken(req)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const addresses = await address
      .find({ userId: user._id })
      .sort({ isDefault: -1, createdAt: -1 })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getUserIdFromToken(req)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const newAddress = await address.create({
      userId: user._id,
      ...body,
    })

    return NextResponse.json({ address: newAddress }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
