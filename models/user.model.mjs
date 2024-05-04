
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,'name is required'],
        minlength:3,
        maxlength:255
    },
    password:{
        type:String,
        required:[true,"email is required"],
        minlength:6,
        maxlength:104,
    },
    email:{
     type:String,
     required:true,
     maxlength:255,
     unique:true,
     validate(value){
         if(!validator.isEmail(value)){
             throw new Error("Email is invalid")
         }
     }

    },
    phone:{
        type:Number,
        minlength:10,
        
        
        validate(value){
            if(!validator.isMobilePhone(value)){
                throw new Error("Phone number is invalid")
            }
        }
    },
    avatar:{
            type:String,
            default:"url",

    },
   bio: {
        type:String,
        default:"no bio",
    },
    role: {
        type:String,
        require:true,
        default:"subscriber",
    },
    isVarified: {
        type:Boolean,
        default:false,
    },
    userAgent:{
           type:Array,
           default:[],
           require:true,
    }
}, {timestamp:true})

userSchema.pre("save",async function (next){
    if(!this.isModified("password")){
        return next()
    }
    // hash password
    const salt = await bcrypt.genSalt(10)
    const hashPassword =  await bcrypt.hash(this.password,salt)
    this.password = hashPassword
})

const User = mongoose.model("User",userSchema)
export default User;
