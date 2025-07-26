import CategoryModel from "../models/category.model.js";
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs/promises'
import slugify from "slugify";

// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true
})

// Create Category 
export async function createCategoryController(request, response) {
    try {
        const{name,description,parentCatId,parentCatName} = request.body
        console.log(name,description)
        if(!name){
            return response.status(400).json({
                message: "Category name is required",
                success: false,
                error: true
            })
        }
        const existingCategory = await CategoryModel.findOne({name})
        if(existingCategory){
            //cleaning up uploaded files in uploads folder
            if(request.files && request.files.length>0){
                for(const file of request.files){
                    await fs.unlink(file.path);
                }
            }


            return response.status(400).json({
                message: "Category already exists",
                success: false,
                error: true
            })
        }
        const slug = slugify(name,{lower: true})
       
        let images=[]
        if(Array.isArray(request.files)){
            images= request.files
        }else if(request.files && request.files.length > 0) {
            images.push(request.files[0])
        }else{
            return response.status(400).json({
                message: "No images uploaded",
                success: false,
                error: true
            })
        }

        const imageLinks =[]
        
        // uploads to avatar folder
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'category'
        };

    
        //cloudinary upload
        try {
            
                for (let i = 0; i < images.length; i++) {
            const filePath = images[i].path;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, options);
            imageLinks.push({
                 url: result.secure_url,
                public_id: result.public_id
            });

        
            // non blocking deletion
            // await fs.unlink(filePath);
        }
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            return response.status(500).json({
                message: "Error uploading images",
                success: false,
                error: true
            });
            
        }finally{
            // clean up uploaded files in uploads folder
            if(request.files && request.files.length>0){
                for(const file of request.files){
                    await fs.unlink(file.path);
                }
            }
        }

    

        // save to database
        const category = new CategoryModel({
            name,
            slug,
            description,
            parentCatId,
            parentCatName,
            images: imageLinks  
        })
        try {
            const savedCategory = await category.save();
                 return response.status(201).json({
                message: "Category created successfully",
                success: true,
                error: false,
                data: savedCategory
        });

            
        } catch (dbError) {
            //cleanup uploaded files in cloudinary 
            for (const image of imageLinks) {
                await cloudinary.uploader.destroy(image.public_id);
            }
           

            console.error('Database error:', dbError);
            return response.status(500).json({
                message: "Error saving category to database",
                success: false,
                error: true
            });

            
        }
   




  

    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


//get categories
export async function getCategoryController(request, response) {
    try {
        const categories = await CategoryModel.find().sort({createdAt:-1})
        console.log(categories)
        //building category map of structure     id -> full_data + children
        const categoryMap ={}
        categories.forEach(cat=>{
            categoryMap[cat._id]={...cat._doc,children:[]} 
        })

        const rootCategories = []
        categories.forEach(cat=>{
            if(cat.parentCatId && categoryMap[cat.parentCatId]){
                categoryMap[cat.parentCatId].children.push(categoryMap[cat._id])
            }else{
                rootCategories.push(categoryMap[cat._id])
            }
        })

        return response.status(200).json({
            message: "Categories fetched successfully",
            success: true,
            error: false,
            data: rootCategories
        })
    } catch (error) {
        console.error('Error fetching categories:', error);
        return response.status(500).json({
            message: "Error fetching categories",
            success: false,
            error: true
        });
    }
}


//get category count
export async function getMainCategoryCountController(request, response) {
    try {
        const count = await CategoryModel.countDocuments({parentCatId: null});
        if(!count){
            return response.status(404).json({
                message: "Category count not found",
                success: false,
                error: true
            });
        }
        return response.status(200).json({
            message: "Main Category count fetched successfully",
            success: true,
            error: false,
            count
        });
    } catch (error) {
        console.error('Error fetching category count:', error);
        return response.status(500).json({
            message: "Error fetching Main category count",
            success: false,
            error: true
        });
    }
}

//get subCategories count
export async function getSubCategoryCountController(request, response) {
    try {
        const count = await CategoryModel.countDocuments({parentCatId: {$ne: null}});
       
        return response.status(200).json({
            message: "Sub Category count fetched successfully",
            success: true,
            error: false,
            count
        });
    } catch (error) {
        console.error('Error fetching category count:', error);
        return response.status(500).json({
            message: "Error fetching Sub category count",
            success: false,
            error: true
        });
    }
}