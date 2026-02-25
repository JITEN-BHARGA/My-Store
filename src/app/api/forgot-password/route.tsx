import { NextResponse } from "next/server";
import crypto from "crypto";
import User from "@/module/user";

import { sendResetEmail } from "@/app/lib/mailer";
import { connectDB } from "@/app/_lib/databaseConnection";
import PasswordResetToken from "@/module/PasswordResetToken";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });

    // 🔐 Prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If this email exists, a reset link was sent.",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Delete old tokens for this email
    await PasswordResetToken.deleteMany({ email });

    // Save new token
    await PasswordResetToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes
    });

    // Send email
    await sendResetEmail(email, token);

    return NextResponse.json({
      success: true,
      message: "Reset link sent to your email 📩",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
