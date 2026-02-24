export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/app/_lib/databaseConnection";
import Admin from "@/module/admin";

type Signup = {
  name: string;
  email: string;
  password: string;
};

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const data: Signup = await request.json();
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { message: "Some fields are missing...", success: false },
        { status: 400 },
      );
    }

    const existingUser = await Admin.findOne({
      $or: [{ email: data.email }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", success: false },
        { status: 409 },
      );
    }

    const saltRounds = 10;

    const hashPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = await Admin.create({
      name: data.name,
      email: data.email,
      password: hashPassword,
    });

    console.log("step 2");

    return NextResponse.json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
