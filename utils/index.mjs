import expressAsyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
export const generateToken = (id)=>{
    return  jwt.sign({id},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
    
}

export const hashToken = (token) =>{
    return crypto.createHash("sha256").update(token.toString()).digest("hex")
}
