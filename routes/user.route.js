import { Router } from "express";
import { forgotPasswordController, getUserDetailsController, loginUserController, logoutController, refreshTokenController, registerUserController, removeAvatarController, resetPasswordController, updateUserDetails, userAvatarController, verifyEmailController, verifyForgotPasswordOtpController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController)
userRouter.delete('/delete-avatar',auth,removeAvatarController)
userRouter.post('/forgot-password',auth,forgotPasswordController)
userRouter.post('/verify-forgot-password-otp',auth,verifyForgotPasswordOtpController) // This route is used to verify the OTP sent to the user's email
userRouter.put('/reset-password',auth,resetPasswordController)
userRouter.put('/:id',auth,updateUserDetails) //ROUTE FEELS wrong
userRouter.post('/refresh-token',auth,refreshTokenController) 
userRouter.get('/user-details',auth,getUserDetailsController)

export default userRouter 