import express from "express";
const router = express.Router()
import { Protect } from "../middleware/authMiddleware.mjs";
import { Register,Login,Logout,getUser, updataUser, deleteUser, adminOnly, getAllUsers, authorOnly, loginStatus, upgradeRole, forgotPassword, sendAutoEmail, verificationMail, verifyToken, resetPassword, changePassword } from "../controllers/user.controller.mjs";

router.post("/register",Register)
router.post("/login",Login)
router.get("/logout",Logout)
router.get("/getuser",Protect,getUser)
router.patch("/update-user",Protect,updataUser)
router.delete("/:id",Protect,adminOnly, deleteUser)
router.get("/all-users",Protect,adminOnly,authorOnly,getAllUsers)
router.get("/login-status",loginStatus)
router.post("/upgrade-role",Protect,adminOnly,upgradeRole)
router.post("/send-email",sendAutoEmail)
router.post("/send-verification-email",Protect,verificationMail)
router.patch("/verify-email/:verificationToken",Protect,verifyToken)
router.post("/forgot-password",forgotPassword)
router.patch("/reset-password/:ResetToken",resetPassword)
router.patch("/change-password/",Protect,changePassword)





export default router;