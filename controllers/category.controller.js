import CategoryModel from "../models/category.model.js";
import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs/promises'
import slugify from "slugify";
import mongoose from "mongoose";

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
export async function getCategoryMapController(request, response) {
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


//get single category
export async function getSingleCategoryController(request, response) {
    try {
        const {id} = request.params
        if(!id){
            return response.status(400).json({
                message: "Category id is required",
                success: false,
                error: true
            })
        }
        const category = await CategoryModel.findById(id)
        if(!category){
            return response.status(404).json({
                message: "Category not found",
                success: false,
                error: true
            })
        }
        return response.status(200).json({
            message: "Category fetched successfully",
            success: true,
            error: false,
            category
        })
    } catch (error) {
        console.error('Error fetching category:', error);
        return response.status(500).json({
            message: "Error fetching category",
            success: false,
            error: true
        });
    }
}

//delete category image 
export async function deleteCategoryImageController(request, response) {
    try {
        const {public_id} = request.params
        console.log(public_id)
        if( !public_id){
            return response.status(400).json({
                message: " image id is required",
                success: false,
                error: true
            })
        }
        const category = await CategoryModel.findOne({ "images.public_id": public_id });
          if (!category) {
            return response.status(404).json({
                message: "Category with the image not found",
                success: false,
                error: true
            });
        }

        // find image index in the category
        const imageIndex = category.images.findIndex(img => img.public_id === public_id);
        if(imageIndex === -1){
            return response.status(404).json({
                message: "Image not found in category",
                success: false,
                error: true
            })
        }
        
        //delete from cloudinary
        await cloudinary.uploader.destroy(public_id);
        
        //remove from category images
        category.images.splice(imageIndex, 1);
        await category.save();

        return response.status(200).json({
            message: "Image deleted successfully",
            success: true,
            error: false,
            data: category
        })
    } catch (error) {
        console.error('Error deleting category image:', error);
        return response.status(500).json({
            message: "Error deleting category image",
            success: false,
            error: true
        });
    }
}

//delete category
// export async function deleteCategoryController(request, response) {
//     try {
//         const {id} = request.params
//         if(!id){
//             return response.status(400).json({
//                 message: "Category id is required",
//                 success: false,
//                 error: true
//             })
//         }
//         const category = await CategoryModel.findById(id)
//         if(!category){
//             return response.status(404).json({
//                 message: "Category not found",
//                 success: false,
//                 error: true
//             })
//         }
//         //delete images from cloudinary
//        try {
//          await Promise.all(category.images.map( (image) =>   cloudinary.uploader.destroy(image.public_id)
//          ));
//        } catch (error) {
//         console.log('Error deleting images from cloudinary:', error);
//         return response.status(500).json({
//             message: "Error deleting images from cloudinary",
//             success: false,
//             error: true
//         });
//        }

//        //recursively delete subcategories
//        async function deleteSubCategories(categoryId) {
//             const subCategories = await CategoryModel.find({parentCatId: categoryId});
//             for (const subCategory of subCategories) {
//                 //delete images from cloudinary
//                 await Promise.all(subCategory.images.map( (image) =>   cloudinary.uploader.destroy(image.public_id)
//                 ));
//                 //delete subcategory
//                 await CategoryModel.findByIdAndDelete(subCategory._id);
//                 //recursively delete subcategories
//                 await deleteSubCategories(subCategory._id);
//             }
//         }

//         //delete category from database
//         await CategoryModel.findByIdAndDelete(id);

//         return response.status(200).json({
//             message: "Category deleted successfully",
//             success: true,
//             error: false
//         })
//     } catch (error) {
//         console.error('Error deleting category:', error);
//         return response.status(500).json({
//             message: "Error deleting category",
//             success: false,
//             error: true
//         });
//     }
// }


//delete category
export async function deleteCategoryController(request, response) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = request.params;

    if (!id) {
      await session.abortTransaction();
      session.endSession();
      return response.status(400).json({
        message: "Category id is required",
        success: false,
        error: true,
      });
    }

    const category = await CategoryModel.findById(id).session(session);
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return response.status(404).json({
        message: "Category not found",
        success: false,
        error: true,
      });
    }

    //deleting main category images
    if (category.images?.length > 0) {
      try {
        await Promise.all(
          category.images.map((image) =>
            cloudinary.uploader.destroy(image.public_id)
          )
        );
      } catch (cloudErr) {
        await session.abortTransaction();
        session.endSession();
        return response.status(500).json({
          message: "Failed to delete images from Cloudinary",
          success: false,
          error: true,
        });
      }
    }

    // Recursion to delete subcategories and their images
    async function deleteSubCategories(categoryId) {
      const subCategories = await CategoryModel.find({ parentCatId: categoryId }).session(session);

      for (const subCategory of subCategories) {
        // Deleting images from Cloudinary
        if (subCategory.images?.length > 0) {
          try {
            await Promise.all(
              subCategory.images.map((image) =>
                cloudinary.uploader.destroy(image.public_id)
              )
            );
          } catch (cloudErr) {
            throw new Error("Cloudinary deletion failed");
          }
        }

        // 🗑 Delete subcategory from DB
        await CategoryModel.findByIdAndDelete(subCategory._id).session(session);

        // Recursive deletion of deeper levels
        await deleteSubCategories(subCategory._id);
      }
    }

    //Delete all subcategories
    await deleteSubCategories(id);

    // finally deleting root category
    await CategoryModel.findByIdAndDelete(id).session(session);

    // COMMIT  transaction
    await session.commitTransaction();
    session.endSession();

    return response.status(200).json({
      message: "Category and subcategories deleted successfully",
      success: true,
      error: false,
      deletedCategory: category,
    });

  } catch (error) {
    console.error("Error in transaction:", error);
    await session.abortTransaction();
    session.endSession();

    return response.status(500).json({
      message: "Error deleting category",
      success: false,
      error: true,
    });
  }
}


//update category
//logic to add if user removes and adds images at same time
export async function updateCategoryController(request, response) {
    try {
        const {id} = request.params
     console.log(request.files)

        if(!id){
            return response.status(400).json({
                message: "Category id is required",
                success: false,
                error: true
            }) 
        }
        const category = await CategoryModel.findById(id)
        if(!category){
            return response.status(404).json({
                message: "Category not found",
                success: false,
                error: true
            })
        }
   
        

        let images=[]
        if(Array.isArray(request.files)){
            images= request.files
        }

                 //update object to update
                 const updates ={
            ...request.body
        }

        if(images.length > 0){
        
        //if images are uploaded then upload to cloudinary and update in category
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
                   await Promise.all(images.map(file => fs.unlink(file.path)));
            }

            
            
            
                 if(imageLinks.length > 0){
                     updates.images = [...category.images, ...imageLinks ]
                 }
            
        }
            //updating category document
            const updatedCategory = await CategoryModel.findByIdAndUpdate(id,updates, { new: true, runValidators: true });
            return response.status(200).json({
                message: "Category updated successfully",
                success: true,
                error: false,
                data: updatedCategory
            })



        
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true,
        });
    }

}
  