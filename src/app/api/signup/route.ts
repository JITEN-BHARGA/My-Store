export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/module/user";
import { connectDB } from "@/app/_lib/databaseConnection";
import crypto from "crypto";
import { sendVerificationEmail } from "@/app/_lib/mailer";

type Signup = {
  email: string;
  name: string;
  userName: string;
  role: "customer" | "seller";
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data: Signup = await request.json();
    if (
      !data.email ||
      !data.role ||
      !data.name ||
      !data.userName ||
      !data.password
    ) {
      return NextResponse.json(
        { message: "Some fields are missing...", success: false },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { userName: data.userName }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", success: false },
        { status: 409 }
      );
    }

    const saltRounds = 10;

    const hashPassword = await bcrypt.hash(data.password, saltRounds);

    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    const newUser = await User.create({
      name: data.name,
      userName: data.userName,
      email: data.email,
      role: data.role,
      password: hashPassword,
      verifyToken,
      verifyTokenExpiry,
      isVerified: false,
    });

    // send email
    await sendVerificationEmail(data.email, verifyToken);

    return NextResponse.json({
      success: true,
      message: "Signup successful. Please verify your email.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
