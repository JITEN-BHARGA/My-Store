import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "@/module/admin";
import { connectDB } from "@/app/_lib/databaseConnection";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { email, password }: { email: string; password: string } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_ADMIN_SECRET!,
      { expiresIn: "7d" }
    );

    // ✅ Set JWT in HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // cookie options: secure in production, httpOnly
    response.cookies.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}