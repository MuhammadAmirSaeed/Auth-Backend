import bodyparser from "body-parser"
import cookieParser from "cookie-parser";
import mongoose from "mongoose"
import express from "express"
import connectDB from "./db/database.mjs";
import dotenv from "dotenv";
import cors from "cors";
import userRouter from "./routes/user.router.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
dotenv.config()
const app =  express ()
app.use(cors({
    origin:[ "http://localhost:3000"],
    credentials:true
}))
app.use(cookieParser())

app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json())
app.use('/api/user',userRouter)
app.get("/",(req, res) =>{
    res.send("hello world")
} )


const port = process.env.PORT || 8000
app.use(errorHandler)
connectDB()
.then(()=>{
    app.listen(port, ()=>{
        console.log(`server is running on port ${port}`)
    })  
    console.log("database connected")
})
.catch((error)=>{
    console.log("server error",error.message)
    process.exit(1)
})

