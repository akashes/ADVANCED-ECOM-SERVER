import { Router } from "express";
import { authWithGoogle, deleteMultipleUsersController, deleteUser, forgotPasswordController, getAllUsers, getUserDetailsController, loginUserController, logoutController, refreshTokenController, registerUserController, removeAvatarController, resetPasswordController, updatePassword, updateUserDetails, userAvatarController, verifyEmailController, verifyForgotPasswordOtpController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUserController);
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.post('/google-auth',authWithGoogle)
userRouter.post('/logout',auth,logoutController)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),userAvatarController)
userRouter.delete('/delete-avatar',auth,removeAvatarController)

userRouter.post('/forgot-password',forgotPasswordController)
userRouter.post('/verify-forgot-password-otp',verifyForgotPasswordOtpController) // This route is used to verify the OTP sent to the user's email
userRouter.put('/reset-password',resetPasswordController)

userRouter.put('/update-user-details',auth,updateUserDetails) //ROUTE FEELS wrong
userRouter.post('/refresh-token',refreshTokenController) 
userRouter.get('/user-details',auth,getUserDetailsController)
userRouter.put('/update-password',auth,updatePassword)
userRouter.get('/get-all-users',auth,getAllUsers)

userRouter.delete('/delete-user/:userId',auth,deleteUser)
userRouter.delete('/delete-multiple-users',auth,deleteMultipleUsersController)

export default userRouter  