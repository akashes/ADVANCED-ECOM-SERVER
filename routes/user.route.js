import { Router } from "express";
import { registerUserController, verifyEmailController } from "../controllers/user.controller.js";

const userRouter = Router();
console.log("userRouter: /register route loaded");

userRouter.post("/register", registerUserController);
userRouter.post('/verify-email',verifyEmailController)



export default userRouter 