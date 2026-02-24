import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

export async function getUserIdFromToken(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value

    if (!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string
    }

    return { _id: decoded.id }   // 👈 matches your existing route usage
  } catch (error) {
    return null
  }
}
