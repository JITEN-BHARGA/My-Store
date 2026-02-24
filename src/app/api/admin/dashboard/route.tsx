import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import User from "@/module/user";
import Product from "@/module/product";
import Order from "@/module/order";
import { verifyAdmin } from "@/app/lib/middleware/adminAuth";

export async function GET(req: NextRequest) {
  await connectDB();

  const admin = await verifyAdmin(req);
  if (!admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    // ✅ Monthly Sales
    const monthlySalesAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          sales: { $sum: "$total" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthlySales = monthlySalesAgg.map((m) => ({
      name: `M${m._id}`,
      sales: m.sales,
    }));

    // ✅ Yearly Sales
    const yearlySalesAgg = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
          sales: { $sum: "$total" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const yearlySales = yearlySalesAgg.map((y) => ({
      name: y._id.toString(),
      sales: y.sales,
    }));

    return NextResponse.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlySales,
      yearlySales,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { message: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}