import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export async function getUserIdFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
      role?: string
    }

    // 👈 matches existing route usage ({ _id }) and now also carries role
    return { _id: decoded.id, role: decoded.role ?? "customer" }
  } catch (error) {
    return null
  }
}
