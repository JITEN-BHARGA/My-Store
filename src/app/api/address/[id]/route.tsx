import { NextRequest, NextResponse } from "next/server";
import address from "@/module/address";
import { getUserIdFromToken } from "@/app/_lib/getUser";
import { connectDB } from "@/app/_lib/databaseConnection";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ params is Promise
) {
  try {
    await connectDB();

    const user = await getUserIdFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ unwrap params correctly
    const { id } = await context.params;

    const body = await req.json();

    const updatedAddress = await address.findOneAndUpdate(
      { _id: id, userId: user._id },
      body,
      { returnDocument: "after" } // ✅ mongoose v7+
    );

    if (!updatedAddress) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ address: updatedAddress });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getUserIdFromToken(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await address.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!deleted) {
      return NextResponse.json(
        { message: "Address not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}