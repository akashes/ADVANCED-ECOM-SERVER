import { Router } from "express";
import { loginUserController, logoutController, registerUserController, verifyEmailController } from "../controllers/user.controller.js";
import auth from "../middleware/auth.js";

const userRouter = Router();
console.log("userRouter: /register route loaded");

userRouter.post("/register", registerUserController);
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginUserController)
userRouter.get('/logout',auth,logoutController)



export default userRouter 