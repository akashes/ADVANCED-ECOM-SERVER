import BlogModel from "../models/blog.model.js";
import { v2 as cloudinary } from "cloudinary";
import { promises as fs } from "fs";

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true,
});



export async function getBlogsController(request, response) {
    try {
        const blogs = await BlogModel.find().sort({ createdAt: -1 }); // latest first
        response.status(200).json({
            message: "Blogs fetched successfully",
            success: true,
            error: false,
             blogs,
        });
    } catch (error) {
        console.error("Get Blogs Error:", error.message);
        response.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
}



export async function createBlogController(request, response) {
    try {
        const { title, description } = request.body;
        const image = request.file;

        if (!title || !description || !image) {
            return response.status(400).json({
                message: "All fields are required",
                success: false,
                error: true,
            });
        }

        // Uploading image to Cloudinary
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder: "blog",
        };

        const result = await cloudinary.uploader.upload(image.path, options);
        await fs.unlink(image.path); // remove local file after upload

        const blogImage = {
            url: result.secure_url,
            public_id: result.public_id,
        };

        const blog = await BlogModel.create({ title, description, blogImage });

        response.status(201).json({
            message: "Blog created successfully",
            success: true,
            error: false,
            blog,
        });
    } catch (error) {
        console.error("Create Blog Error:", error.message);
        response.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
}



export async function deleteBlogController(request, response) {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({
                message: "Blog id is required",
                success: false,
                error: true,
            });
        }

        const blog = await BlogModel.findById(id);
        if (!blog) {
            return response.status(404).json({
                message: "Blog not found",
                success: false,
                error: true,
            });
        }

        // Delete image from Cloudinary
        if (blog.blogImage?.public_id) {
            await cloudinary.uploader.destroy(blog.blogImage.public_id);
        }

        await blog.deleteOne();

        response.status(200).json({
            message: "Blog deleted successfully",
            success: true,
            error: false,
            id
        });
    } catch (error) {
        console.error("Delete Blog Error:", error.message);
        response.status(500).json({
            message: "Internal server error",
            success: false,
            error: true,
        });
    }
}


export async function updateBlogController(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    let updatedData = { title, description };

    // if new image  provided
    if (req.file) {
      //old blog
      const oldBlog = await BlogModel.findById(id);
      if (!oldBlog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }

      // delete old image from cloudinary
      if (oldBlog.blogImage?.public_id) {
        await cloudinary.uploader.destroy(oldBlog.blogImage.public_id);
      }

      //  upload new image
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "blogs",
      });

      // set new image data
      updatedData.blogImage = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      };

      // cleanup local temp file
      await fs.unlink(req.file.path);
    }

    // update db
    const updatedBlog = await BlogModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    return res.json({ success: true, message: "Blog updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating blog" });
  }
}


export async function getSingleBlog(request, response) {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({
                message: "Blog id is required",
                success: false,
                error: true,
            });
        }

        const blog = await BlogModel.findById(id);
        if (!blog) {
            return response.status(404).json({
                message: "Blog not found",
                success: false,
                error: true,
            });
        }

        response.status(200).json({
            message: "Blog fetched successfully",
            success: true,
            error: false,
             blog,
        });
    } catch (error) {
        console.error("Get Single Blog Error:", error.message);
        response.status(500).json({
            message: "Failed to fetch single blog",
            success: false,
            error: true,
        });
    }
}
