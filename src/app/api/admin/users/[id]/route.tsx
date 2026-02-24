import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import User from "@/module/user";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  // ✅ Verify admin
  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      userId: deletedUser._id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}