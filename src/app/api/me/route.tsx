import { NextRequest, NextResponse } from "next/server"
import { tokenVerify } from "@/app/_lib/jwt"
import {connectDB} from "@/app/_lib/databaseConnection"
import User from "@/module/user"

export async function GET(request: NextRequest) {
  try {
    // 🍪 Get token from cookie
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // 🔐 Verify token
    const decoded = tokenVerify(token) as { id: string }

    // 🗄️ Connect DB
    await connectDB()

    // 👤 Find user
    const user = await User.findById(decoded.id).select(
      "name username"
    )

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // ✅ Return user
    return NextResponse.json({
      id: user._id,
      name: user.name,
      username: user.username,
    })
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    )
  }
}
