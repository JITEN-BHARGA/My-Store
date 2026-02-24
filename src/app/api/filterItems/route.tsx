import { connectDB } from "@/app/_lib/databaseConnection"
import product from "@/module/product"
import { NextRequest , NextResponse } from "next/server"

export async function GET(request : NextRequest){
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams

        const name = searchParams.get("name")
        const maxprice = searchParams.get("maxprice")
        const minprice = searchParams.get("minprice")
        const company = searchParams.get("company")
        const gender = searchParams.get("gender")
        const discount = searchParams.get("discount")

        const filter :any = {} 

        if(name){
            filter.name = { $regex: new RegExp(name, "i") }
        }

        if(company){
            filter.companyName = { $regex: new RegExp(company, "i") }
        }

        if(gender){
            filter.gender = gender
        }

        if(maxprice || minprice){
            filter.currentPrice = {}

            if(maxprice) filter.currentPrice.$lte = Number(maxprice)
            if(minprice) filter.currentPrice.$gte = Number(minprice)
        }
        
        if(discount){
            filter.discount = {}

            filter.discount.$gte = Number(discount)
        }

        const data = await product.find(filter)

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