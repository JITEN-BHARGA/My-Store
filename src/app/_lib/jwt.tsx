import jwt from "jsonwebtoken"

const secret= process.env.JWT_SECRET as string

export const jwtGeneration = (userId:string) => {
        
        const token = jwt.sign({id : userId},secret,{expiresIn : '7d'});
        return token
}

export const tokenVerify = (token : string) => {
    const isValid = jwt.verify(token ,secret)
    return isValid
}