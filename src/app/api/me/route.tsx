import { NextRequest, NextResponse } from "next/server"
import { tokenVerify } from "@/app/_lib/jwt"
import {connectDB} from "@/app/_lib/databaseConnection"
import User from "@/module/user"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // tokenVerify returns null on failure (does NOT throw) — check explicitly.
    const decoded = tokenVerify(token)

    if (!decoded?.id) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(decoded.id).select("name userName role")

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user._id,
      name: user.name,
      username: user.userName,
      role: user.role ?? decoded.role ?? "customer",
    })
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 })
  }
}
