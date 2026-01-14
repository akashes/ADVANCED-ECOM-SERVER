import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { createBannerV1Controller, deleteBannerV1Controller, getBannerV1Controller, getProductByCategory } from "../controllers/bannerV1.controller.js";
import { authorizeRoles } from "../middleware/authRoles.js";

const bannerV1Router = Router();

bannerV1Router.get("/", getBannerV1Controller);
bannerV1Router.post("/", auth, upload.single('image'),authorizeRoles('ADMIN','MODERATOR'), createBannerV1Controller);
bannerV1Router.delete("/",auth,authorizeRoles('ADMIN','MODERATOR'),deleteBannerV1Controller);
bannerV1Router.post('/get-products-by-category',auth,getProductByCategory)

export default bannerV1Router; 