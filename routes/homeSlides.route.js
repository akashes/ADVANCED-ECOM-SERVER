
import { Router } from "express";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import { createHomeSlidesController, deleteHomeSlide, getAllHomeSlidesController } from "../controllers/homeSlides.controller.js";
import { authorizeRoles } from "../middleware/authRoles.js";
const homeSlidesRouter = Router();


homeSlidesRouter.post('/create',auth,upload.single('image'),authorizeRoles('ADMIN','MODERATOR'), createHomeSlidesController)
homeSlidesRouter.get('/',getAllHomeSlidesController)
homeSlidesRouter.delete('/',auth,authorizeRoles('ADMIN','MODERATOR'),deleteHomeSlide)

export default homeSlidesRouter