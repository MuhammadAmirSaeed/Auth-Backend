import mongoose from "mongoose";


const tokenSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.ObjectId,
        ref:"user",
        require:true,
    },
    verificationToken:{
        type:String,
        default:""
    },
    loginToken:{
        type:String,
        default:''
    },
    resetToken:{
        type:String,
        default:""
    },
    createdAt:{
        type:String,
        require:true
    },
    expiresAt:{
        type:String,
        require:true
    },
})

 const Token = mongoose.model("token",tokenSchema)
 export default Token;