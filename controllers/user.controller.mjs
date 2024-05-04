import asyncHandler from "express-async-handler";
import User from "../models/user.model.mjs";
import { generateToken, hashToken } from "../utils/index.mjs";
import bcrypt from "bcryptjs";
import parser from "ua-parser-js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.mjs";
import ejs from "ejs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Token from "../models/token.model.mjs";
import crypto from "crypto"
// Register new user function
export const Register = asyncHandler(async (req, res) => {
  const { name, password, email } = req.body;
  // validation

  if (!name || !password || !email) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }
  const ExistUser = await User.findOne({ email: email });
  if (ExistUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const ua = parser(req.headers["user-agent"]);
  const agent = [ua.ua];
  const newUser = await User.create({
    name,
    email,
    password,
    userAgent: agent,
  });

  // Generate token
  const token = generateToken(newUser._id);

  //send http-only cookies
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1day

    sameSite: "none",
    secure: true,
  });
  if (newUser) {
    const { _id, name, email, phone, avatar, bio, role, isVarified } = newUser;

    res.status(201).json({
      _id,
      name,
      email,
      phone,
      avatar,
      bio,
      role,
      isVarified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("User already exists");
  }
});
// login  user function
export const Login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter the credentials");
  }

  const loginUser = await User.findOne({ email: email });
  if (!loginUser) {
    res.status(404);
    throw new Error("Please SignUP first");
  }

  const passwordCorrect = await bcrypt.compare(password, loginUser.password);
  if (!passwordCorrect) {
    res.status(400);
    throw new Error("Invalid credentials");
  }
  // Generate token
  const token = generateToken(loginUser._id);

  if (loginUser && passwordCorrect) {
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), //1day

      sameSite: "none",
      secure: true,
    });
    const { _id, name, email, phone, avatar, bio, role, isVarified } =
      loginUser;

    res.status(201).json({
      _id,
      name,
      email,
      phone,
      avatar,
      bio,
      role,
      isVarified,
      token,
    });
  } else {
    res.status(500);
    throw new Error("something wrong please try again later");
  }
});
// logout  function

export const Logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "logout successfully",
  });
});

//  Get user

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { _id, name, email, phone, avatar, bio, role, isVarified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      avatar,
      bio,
      role,
      isVarified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//updat user
export const updataUser = asyncHandler(async (req, res) => {
  const updateUser = await User.findById(req.user._id);
  console.log("updating user>>", updateUser);
  if (updateUser) {
    const { name, email, phone, avatar, bio, role, isVarified } = updateUser;
    updateUser.name = req.body.name || name;
    updateUser.email = req.body.email || email;
    updateUser.phone = req.body.phone || phone;
    updateUser.avatar = req.body.avatar || avatar;
    updateUser.bio = req.body.bio || bio;
    updateUser.role = req.body.role || role;

    const updatedUser = await updateUser.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      role: updatedUser.role,
      isVarified: updatedUser.isVarified,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//  delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  await user.remove();
  res.status(200).json({
    message: "User deleted successfully",
  });
});

//  get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const user = await User.find().sort("-createdAt").select("-password");
  if (!user) {
    res.status(404).send("No user found");
    throw new Error("No user found");
  }
  res.status(200).json(user);
});

// login status
export const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  const verified = await jwt.verify(token, process.env.JWT_SECRET_KEY);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

//  upgrade role
export const upgradeRole = asyncHandler(async (req, res) => {
  const { role, id } = req.body;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.role = role;
  await user.save();
  res.status(200).json({
    message: `Role updated successfully with ${role}`,
  });
});

export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("You are not authorized to access.");
  }
});
export const authorOnly = asyncHandler(async (req, res, next) => {
  if ((req.user.role = "author" || req.user.role === "admin")) {
    next();
  } else {
    res.status(401);
    throw new Error("Invalid authorization");
  }
});
export const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVarified) {
    next();
  } else {
    res.status(401);
    throw new Error("Invalid authorization or verified ");
  }
});

// send automated Email
export const sendAutoEmail = asyncHandler(async (req, res) => {
  const { sent_to, subject, url } = req.body;
  if (!sent_to || !subject) {
    res.status(400);
    throw new Error("Please add all fields");
  }
  const user = await User.findOne({ email: sent_to });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const send_from = process.env.NODMAILER_USER;
  const name = user.name;
  const link = `${process.env.FRONT_END_LINK}${url}`;
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const htmlTemplate = await ejs.renderFile(
    path.join(__dirname, "../utils/verifyEmail.ejs"),
    { name, link, subject }
  );
  // console.log("htmlTemplate>>", htmlTemplate);
  try {
    await sendEmail(send_from, sent_to, htmlTemplate, subject);
    res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//send verification mail
export const verificationMail = asyncHandler(async(req,res)=>{
      
  const user = await User.findById(req.user._id)
  if(!user){
    res.status(404);
    throw new Error("User not found");
  }
  if(user.isVarified){
    res.status(400)
    throw new Error("User already verified");
  }
  const token =  await Token.findOne({userId:user._id})
  if(token){
    await token.deleteOne()
  }
  const verificationToken = crypto.randomBytes(32).toString("hex")+ user._id 
  // console.log(verificationMail);
  const hashedtoken = hashToken(verificationToken)
  await new Token({
    userId:user._id,
    verificationToken:hashedtoken,
    createdAt:Date.now(),
    expiresAt:Date.now() + 60 * (60*1000 ) //1 houre

  }).save()

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

 
  // construct the verification token
  const verificationUrl = `${process.env.FRONT_END_LINK}/verify/${verificationToken}`
  const link = verificationUrl;
     const subject = "verify Your Account";
  const send_from = process.env.NODMAILER_USER ;
 const  sent_to = user.email;
  const name = user.name;

  const htmlTemplate = await ejs.renderFile(
    path.join(__dirname, "../utils/verifyEmail.ejs"),
    { name, link, subject })
 
    try {
      await sendEmail(send_from, sent_to, htmlTemplate, subject);
      res.status(200).json({
        message: "Email sent successfully",
      });
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
})

// verify token
export const verifyToken = asyncHandler(async(req,res)=>{
  const {verificationToken} = req.params
  if(!verificationToken){
    res.status(400)
    throw new Error("Invalid token")
  }
  const hashedToken = hashToken(verificationToken)
  const token = await Token.findOne({verificationToken:hashedToken,
    expiresAt:{$gt:Date.now()}})
  
  
  if(!token){
    res.status(400)
    throw new Error("Invalid token")
  }
  const user = await User.findById(token.userId)
  if(!user){
    res.status(400)
    throw new Error("Invalid token")
  }
  if(user.isVarified){
    res.status(400)
    throw new Error("User already verified")
  }
  user.isVarified = true
  await user.save()
  res.status(200).json({
    message:"User verified successfully"
  })
})



// forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const {email} = req.body;
    const  user  =  await User.findOne({email})
    if(!user){
      res.status(404)
      throw new Error("User not found")
    }
    const token =  await Token.findOne({userId:user._id})
    if(token){
      await token.deleteOne()
    }
    const ResetToken = crypto.randomBytes(32).toString("hex")+ user._id 
    // console.log(verificationMail);
    const hashedtoken = hashToken(ResetToken)
    await new Token({
      userId:user._id,
      resetToken:hashedtoken,
      createdAt:Date.now(),
      expiresAt:Date.now() + 60 * (60*1000 ) //1 houre
  
    }).save()
  
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
  
   
    // construct the reset token
    const ResetUrl = `${process.env.FRONT_END_LINK}/reset/${ResetToken}`
    const link = ResetUrl;
       const subject = "Reset your password";
    const send_from = process.env.NODMAILER_USER ;
   const  sent_to = user.email;
    const name = user.name;
  
    const htmlTemplate = await ejs.renderFile(
      path.join(__dirname, "../utils/verifyEmail.ejs"),
      { name, link, subject })
   
      try {
        await sendEmail(send_from, sent_to, htmlTemplate, subject);
        res.status(200).json({
          message: "Email sent successfully",
        });
      } catch (error) {
        res.status(500);
        throw new Error(error.message);
      }
   
    
  } catch (error) {
    res.status(500)
    throw new Error(error.message)
  }
});

// reset password

export const resetPassword = asyncHandler(async(req,res)=>{
 const {ResetToken} = req.params;
 const {password} = req.body;
 if(!ResetToken){
   res.status(400)
   throw new Error("token is not exist")
 }
 if(!password){
  res.status(400)
  throw new Error("Please enter a password")

}
 const hashedToken = hashToken(ResetToken)
 const token = await Token.findOne({resetToken:hashedToken,
   expiresAt:{$gt:Date.now()}}) 
   if(!token) {
    res.status(404)
    throw new Error("Invalid token")
   }
   const user = await User.findById(token.userId) 
   if(!user){
    res.status(404)
    throw new Error("Invalid token")
   }
   user.password = password
   await user.save()
   res.status(200).json({
    message: "Password reset successful, please login"
   })

})

// change password 

export const changePassword =  asyncHandler(async(req,res)=>{
  try {
    const {oldPassword,newPassword}= req.body;
    if(!oldPassword || !newPassword) {
      res.status(400)
      throw new Error ("please fill the credentials")
    }
  
    const user = await User.findOne(req.user._id)
    if(!user){
      res.status(404)
      throw new Error("User not found")
    }
    const isMatch = await bcrypt.compare(oldPassword,user.password)
    if(user && isMatch){
      user.password =newPassword
      await user.save()
    }
    else{
      res.status(400)
      throw new Error("Invalid password")
    }
    res.status(200).json({
      message: "Password changed successfully"
    })
    
  } catch (error) {
    res.status(500)
    throw new Error(error.message)
  }
 

})
