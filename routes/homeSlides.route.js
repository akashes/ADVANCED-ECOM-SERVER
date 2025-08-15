
import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { createHomeSlidesController, deleteHomeSlide, getAllHomeSlidesController } from "../controllers/homeSlides.controller.js";
const homeSlidesRouter = Router();


homeSlidesRouter.post('/create',auth,upload.single('image'),createHomeSlidesController)
homeSlidesRouter.get('/',getAllHomeSlidesController)
homeSlidesRouter.delete('/',auth,deleteHomeSlide)

export default homeSlidesRouter