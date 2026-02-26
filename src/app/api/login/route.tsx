export const dynamic = "force-dynamic"

import { NextRequest , NextResponse } from "next/server"
import bcrypt from 'bcryptjs'
import User from "@/module/user"
import { connectDB } from "@/app/_lib/databaseConnection"
import { jwtGeneration } from "@/app/_lib/jwt"

type Login = {
    email : string
    role : string
    password : string
}

export async function POST(request : NextRequest){
    try {
        await connectDB();

        const data : Login = await request.json()

        if(!data.email || !data.password || !data.role){
            return NextResponse.json({
                message : "some field are missing...",
                success : false
            },{
                status:401
            })
        }

        const existUser = await User.findOne({$and : [{email : data.email, role : data.role, isVerified : true}]})

        if(!existUser){
            return NextResponse.json({
                message : "user not found...",
                success : false
            },{
                status:404
            })
        }

        const isValidPassword :boolean = await bcrypt.compare(data.password , existUser.password)

        if(!isValidPassword){
            return NextResponse.json({
                message : "invalid password",
                success : false
            })
        }

        const token = jwtGeneration(existUser._id.toString() , existUser.role);



        const response = NextResponse.json({
            success : true
        })

        response.cookies.set("token",token ,{
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : "strict",
            maxAge : 60 * 60 * 24 * 7,
            path : "/",
        })

        return response

    } catch (error) {
        return NextResponse.json({
            message : "internal server error..."
        },{
            status : 500
        })
    }
}


