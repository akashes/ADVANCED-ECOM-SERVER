import { Router } from "express";
import { registerUserController } from "../controllers/user.controller.js";

const userRouter = Router();
console.log("userRouter: /register route loaded");

userRouter.post("/register", registerUserController);



export default userRouter 