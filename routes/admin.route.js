import { Router } from "express";
import auth from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const adminRouter = Router();

adminRouter.get("/dashboard-stats",auth,getDashboardStats );


export default adminRouter; 