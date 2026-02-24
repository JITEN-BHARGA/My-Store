import { connectDB } from "@/app/_lib/databaseConnection"
import product from "@/module/product"

import { NextRequest , NextResponse } from "next/server"

export async function GET(request : NextRequest){
    try {
        await connectDB()

        const data = await product.find()

        if(data.length === 0){
            return NextResponse.json({
                message : "item is not here in database...",
                success : false
            })
        }

        return NextResponse.json({
            success : true,
            data : data
        },{
            status : 200
        })
    } catch (error) {
        return NextResponse.json({
                message : "internal server error...",
                success : false
            },{
                status : 500
            })
    }
}