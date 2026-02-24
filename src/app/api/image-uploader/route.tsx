export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import cloudinary from "@/app/_lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { message: "No files uploaded", success: false },
        { status: 400 }
      )
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "ecommerce" },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )

        uploadStream.end(buffer)
      })

      return {
        url: result.secure_url,
        public_id: result.public_id,
      }
    })

    const uploadedImages = await Promise.all(uploadPromises)

    return NextResponse.json(
      {
        success: true,
        images: uploadedImages,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Upload failed", success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const public_id = searchParams.get("public_id")

    if (!public_id) {
      return NextResponse.json(
        { message: "Missing public_id", success: false },
        { status: 400 }
      )
    }

    const result = await cloudinary.uploader.destroy(public_id)

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { message: "Failed to delete image", success: false, result },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Image deleted successfully", success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { message: "Delete failed", success: false },
      { status: 500 }
    )
  }
}