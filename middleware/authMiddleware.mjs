import AsyncHandler from "express-async-handler";
import User from "../models/user.model.mjs";
import { generateToken } from "../utils/index.mjs";
import jwt from 'jsonwebtoken'

export const Protect = AsyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            res.status(401)
                throw new Error ("Not authorized , Please Login first")
            
        }
            const verified = jwt.verify(token,process.env.JWT_SECRET_KEY)

            const user =  await User.findById(verified.id).select("-password")
       if(!user){
        res.status(404)
        throw new Error ("user not found")
       }
       if(user.role==="suspended"){
        res.status(400)
        throw new Error ("User is suspended please contact with the administrator")
       }

       req.user = user
       next()

        
    } catch (error) {
        res.status(401)
        throw new Error("Not authorized , Please Login first")
    }
})

