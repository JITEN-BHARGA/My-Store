export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/_lib/databaseConnection";
import Product from "@/module/product";
import { getUserIdFromToken } from "@/app/_lib/getUser";


export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // ✅ params is Promise
) {
  try {
    await connectDB();

    const { id } = await context.params; // ✅ await params

    const user = await getUserIdFromToken(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const product = await Product.findOne({
      $and : [{_id: id},{sellerId: user._id}]
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await context.params; // ✅ await params

  const userId = await getUserIdFromToken(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  /* ✅ Allow only editable fields */
  const allowedFields = [
    "name",
    "currentPrice",
    "discount",
    "itemInfo",
    "category",
    "companyName",
    "stock",
    "imageURL",
    "attributes",
  ];

  const updateData: any = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updateData[key] = body[key];
    }
  }

  /* ✅ Ensure numbers are stored as numbers */
  if (updateData.currentPrice !== undefined)
    updateData.currentPrice = Number(updateData.currentPrice);

  if (updateData.discount !== undefined)
    updateData.discount = Number(updateData.discount);

  if (updateData.stock !== undefined)
    updateData.stock = Number(updateData.stock);


  const product = await Product.findOneAndUpdate(
    {$or : [{ _id: id}, {sellerId: userId }]},
    updateData,
    { new: true },
  );

  if (!product) {
    return NextResponse.json(
      { message: "Product not found or not yours" },
      { status: 404 },
    );
  }
  return NextResponse.json({ product });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const params = await context.params;
  const userId = await getUserIdFromToken(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const deleted = await Product.findOneAndDelete({
    $or : [{_id: params.id},{sellerId: userId}]
  });

  if (!deleted) {
    return NextResponse.json(
      { message: "Product not found or not yours" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
