import { NextRequest, NextResponse } from "next/server";
import User from "@/module/user";
import { connectDB } from "@/app/_lib/databaseConnection";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const user = await User.findOne({
      verifyToken: token,
      verifyTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Token expired or invalid" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
  } catch (error) {
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    );
  }
}