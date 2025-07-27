import express from "express";
import upload from "../middleware/multer.js";
import { createCategoryController, deleteCategoryController, deleteCategoryImageController, getCategoryMapController, getMainCategoryCountController, getSingleCategoryController, getSubCategoryCountController, updateCategoryController } from "../controllers/category.controller.js";
import auth from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.get('/',getCategoryMapController)
categoryRouter.post('/create-category',auth,upload.array('categoryImage'),createCategoryController)
categoryRouter.get('/get-count',auth,getMainCategoryCountController)
categoryRouter.get('/get-subcategory-count',getSubCategoryCountController)
categoryRouter.get('/get-subcategory-count',getSubCategoryCountController)
categoryRouter.get('/:id',getSingleCategoryController)
categoryRouter.delete('/delete-category-image/:public_id',auth,deleteCategoryImageController)
categoryRouter.delete('/delete-category/:id',auth,deleteCategoryController)
categoryRouter.put('/update-category/:id',auth,upload.array('categoryImage'),updateCategoryController) 

export default categoryRouter;   