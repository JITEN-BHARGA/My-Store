import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import User from "@/module/user";
import PasswordResetToken from "@/module/PasswordResetToken";
import { connectDB } from "@/app/_lib/databaseConnection";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      await PasswordResetToken.deleteOne({ token });
      return NextResponse.json(
        { message: "Token expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { email: resetToken.email },
      { $set: { password: hashedPassword } }
    );

    await PasswordResetToken.deleteOne({ token });

    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}