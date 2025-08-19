import { Router } from "express";
import { createBlogController, deleteBlogController, getBlogsController, getSingleBlog, updateBlogController } from "../controllers/blog.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";


const blogRouter = Router();

blogRouter.get('/get-all-blogs',getBlogsController)
blogRouter.get('/:id',getSingleBlog)
blogRouter.put('/:id',auth,upload.single('image'),updateBlogController)
blogRouter.delete('/:id',deleteBlogController)
blogRouter.post('/',auth,upload.single('image'),createBlogController)



export default blogRouter