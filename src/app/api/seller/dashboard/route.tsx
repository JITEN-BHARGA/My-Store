import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/app/_lib/databaseConnection"
import Order from "@/module/order"
import Product from "@/module/product"
import { getUserIdFromToken } from "@/app/_lib/getUser"
import mongoose from "mongoose"

export async function GET(req: NextRequest) {
  await connectDB()

  const sellerId = await getUserIdFromToken(req)
  if (!sellerId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const sellerObjectId = new mongoose.Types.ObjectId(sellerId._id)

  // 1️⃣ Get all product IDs for this seller
  const products = await Product.find({ sellerId: sellerObjectId }).select("_id")
  const productIds = products.map(p => p._id)

  // 2️⃣ Aggregate all orders containing these products
  const orders = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.productId": { $in: productIds } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        totalOrders: { $sum: 1 },
        totalProductsSold: { $sum: "$items.qty" },
        deliveredOrders: { $sum: { $cond: [{ $eq: ["$items.status", "Delivered"] }, 1, 0] } },
        pendingOrders: { $sum: { $cond: [{ $in: ["$items.status", ["Placed","Shipped"]] }, 1, 0] } },
      },
    },
  ])

  const summary = orders[0] || {
    totalRevenue: 0,
    totalOrders: 0,
    totalProductsSold: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
  }

  // 3️⃣ Monthly Sales
  const monthlyAgg = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.productId": { $in: productIds } } },
    {
      $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        sales: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ])
  const monthlySales = monthlyAgg.map(m => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString("default", { month: "short" }),
    sales: m.sales,
  }))

  // 4️⃣ Yearly Sales
  const yearlyAgg = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.productId": { $in: productIds } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" } },
        sales: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
      },
    },
    { $sort: { "_id.year": 1 } },
  ])
  const yearlySales = yearlyAgg.map(y => ({ name: y._id.year.toString(), sales: y.sales }))

  // 5️⃣ Top Products
  const topProductsAgg = await Order.aggregate([
    { $unwind: "$items" },
    { $match: { "items.productId": { $in: productIds } } },
    {
      $group: {
        _id: "$items.productId",
        sold: { $sum: "$items.qty" },
      },
    },
    { $sort: { sold: -1 } },
    { $limit: 5 },
  ])

  const topProductsData = await Product.find({ _id: { $in: topProductsAgg.map(p => p._id) } }).select("name")
  const topProducts = topProductsAgg.map(p => ({
    name: topProductsData.find(prod => prod._id.equals(p._id))?.name || "Unknown",
    sold: p.sold,
  }))

  return NextResponse.json({
    monthlySales,
    yearlySales,
    totalRevenue: summary.totalRevenue,
    totalOrders: summary.totalOrders,
    totalProductsSold: summary.totalProductsSold,
    deliveredOrders: summary.deliveredOrders,
    pendingOrders: summary.pendingOrders,
    topProducts,
  })
}