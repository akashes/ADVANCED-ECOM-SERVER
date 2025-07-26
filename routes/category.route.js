import express from "express";
import upload from "../middleware/multer.js";
import { createCategoryController, getCategoryController, getMainCategoryCountController, getSubCategoryCountController } from "../controllers/category.controller.js";
import auth from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.get('/',auth,getCategoryController)
categoryRouter.post('/create-category',auth,upload.array('categoryImage'),createCategoryController)
categoryRouter.get('/get-count',auth,getMainCategoryCountController)
categoryRouter.get('/get-subcategory-count',auth,getSubCategoryCountController)

export default categoryRouter;  