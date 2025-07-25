import { Router } from "express";
import { loginUserController, logoutController, registerUserController, removeAvatarController, userAvatarController, verifyEmailController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();
console.log("userRouter: /register route loaded");

userRouter.post("/register", registerUserController);
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/user-avatar',auth,upload.array('avatar'),userAvatarController)
userRouter.delete('/delete-avatar',auth,removeAvatarController)



export default userRouter 