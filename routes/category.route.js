import express from "express";
import upload from "../middleware/multer.js";
import { createCategoryController, deleteCategoryController, deleteCategoryImageDuringCreation, getCategoryMapController, getMainCategoryCountController, getSingleCategoryController, getSubCategoryCountController, updateCategoryController, updateSubCategoryController, uploadCategoryImage } from "../controllers/category.controller.js";
import auth from "../middleware/auth.js";

const categoryRouter = express.Router();

categoryRouter.get('/',getCategoryMapController)
// categoryRouter.post('/create-category',auth,upload.array('categoryImage'),createCategoryController)
categoryRouter.post('/create-category',auth,createCategoryController)
categoryRouter.get('/get-count',auth,getMainCategoryCountController)
categoryRouter.get('/get-subcategory-count',getSubCategoryCountController)
categoryRouter.get('/get-subcategory-count',getSubCategoryCountController)
categoryRouter.get('/:id',getSingleCategoryController)
// categoryRouter.delete('/delete-category-image/:public_id',auth,deleteCategoryImageController)
categoryRouter.delete('/delete-category/:id',auth,deleteCategoryController)
// categoryRouter.put('/update-category/:id',auth,upload.array('categoryImage'),updateCategoryController) 
categoryRouter.put('/update-category/:id',auth,updateCategoryController) 
categoryRouter.put('/update-sub-category/:id',auth,updateSubCategoryController) 

categoryRouter.put('/upload-category-image',auth,upload.array('categoryImages'),uploadCategoryImage)
categoryRouter.delete('/delete-category-image',auth,deleteCategoryImageDuringCreation)
// categoryRouter.delete('/delete-category-image-edit',auth,deleteCategoryImageDuringEdit)


export default categoryRouter;    