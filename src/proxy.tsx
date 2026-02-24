import { NextRequest }  from "next/server"
import { NextResponse } from "next/server"
import { tokenVerify } from "./app/_lib/jwt"


export function proxy(request : NextRequest){
    const token = request.cookies.get("token")?.value

    if(!token){
        return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
        tokenVerify(token)
        return NextResponse.next()
    } catch (error) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"],
};