
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import slugify from "slugify";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true
})


//upload product image
export const uploadProductImages = async (request, response) => {
  try {
    const images = request.files;

    if (!images || images.length === 0) {
      return response.status(400).json({
        message: "No images uploaded",
        success: false,
        error: true
      });
    }

    const options = {
      use_filename: true,
      unique_filename: true, 
      folder: 'product-images'
    };

    const imageLinks = [];

    for (const file of images) {
      try {
        const result = await cloudinary.uploader.upload(file.path, options);

        imageLinks.push({
          url: result.secure_url,
          public_id: result.public_id
        });

        fs.unlinkSync(file.path);

      } catch (uploadErr) {
        console.error(`Cloudinary upload failed for ${file.originalname}:`, uploadErr.message);

        //  Still delete the file even if upload fails
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        imageLinks.push({
          url: null,
          public_id: null,
          error: uploadErr.message,
          file: file.originalname
        });
      }
    }

    return response.status(200).json({
      message: "Product images upload process completed",
      success: true,
      error: false,
      data: imageLinks
    });

  } catch (error) {
    console.error("Upload controller error:", error);
    return response.status(500).json({
      message: "Server error during image upload",
      success: false,
      error: error.message
    });
  }
};
//delete product image
export const deleteProductImage=async(request,response)=>{
    try {
        const { public_id } = request.body;
        if(!public_id){
            return response.status(400).json({
                message: "Public ID is required",
                success: false,
                error: true
            });
        }

        await cloudinary.uploader.destroy(public_id);
        return response.status(200).json({
            message: "Product image deleted successfully",
            success: true,
            error: false
        });
        
    } catch (error) {
        return response.status(500).json({
            message: "Error deleting product image",
            success: false,
            error: error.message
        })
    }
}

//create product 

export const createProduct=async(request,response)=>{
    try {

        const productData = request.body
        if(!productData.category){
            return response.status(400).json({
                message: "Category not found",
                success: false,
                error: true
            });
        }
        if(!productData.name || !productData.description || !productData.price  ||!productData.catName || !productData.images || !productData.countInStock){
            return response.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        productData.slug =  slugify(productData.name, {
            lower: true,
        });

        const newProduct = new ProductModel(productData);
        await newProduct.save();



        return response.status(201).json({
            message: "Product created successfully",
            success: true,
            error: false,
            product: newProduct
        });
        
    } catch (error) {
        return response.status(500).json({
            message: "Error creating product",
            success: false,
            error: error.message
        })
    }

}

//get all products
export const getAllProducts = async (request, response) => {
    try {

        const page = Math.max(parseInt(request.query.page) || 1, 1);
    const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);

        const totalProducts = await ProductModel.countDocuments();
        const totalPages = Math.ceil(totalProducts / perPage);

        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }

            const products = await ProductModel.find()
                .populate('category')
                .skip((page - 1) * perPage)
                .limit(perPage)
                .sort({ createdAt: -1 })
                .exec();
            



        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
        
        return response.status(200).json({
        message: "Products fetched successfully",
        success: true,
        error: false,
        products,
        totalProducts,
        totalPages,
        currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
        message: "Server error while fetching products",
        success: false,
        error: error.message
        });
    }
}

//get product by categoryId
export const getProductsByCategory = async (request, response) => {
    try {
        const { categoryId } = request.params;
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
        const totalProducts = await ProductModel.countDocuments({ category: categoryId });
        const totalPages = Math.ceil(totalProducts / perPage);
        console.log(page, perPage, totalProducts, totalPages);
    
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ category: new mongoose.Types.ObjectId(categoryId) })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
    
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}

//get products by category name

export const getProductsByCategoryName = async (request, response) => {
    try {
        const  categoryName = request.query.categoryName
        console.log(categoryName)
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
      
        const totalProducts = await ProductModel.countDocuments({ catName:categoryName });
        const totalPages = Math.ceil(totalProducts / perPage);
    console.log(page,perPage,totalProducts,totalPages)
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ catName: { $regex: categoryName, $options: "i" } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        console.log(products)
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
    
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}
//get product by sub categoryId
export const getProductsBySubCategory = async (request, response) => {
    try {
        const { categoryId } = request.params;
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
        const totalProducts = await ProductModel.countDocuments({ subCatId: new mongoose.Types.ObjectId(categoryId) });
        const totalPages = Math.ceil(totalProducts / perPage);
        console.log(page, perPage, totalProducts, totalPages);
    
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ subCatId: new mongoose.Types.ObjectId(categoryId) })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
    
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}

//get products by sub category name

export const getProductsBySubCategoryName = async (request, response) => {
    try {
        const  {subCat} = request.query
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
      
        const totalProducts = await ProductModel.countDocuments({ subCat:subCat });
        const totalPages = Math.ceil(totalProducts / perPage);
    console.log(page,perPage,totalProducts,totalPages)
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ subCat: { $regex: subCat, $options: "i" } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        console.log(products)
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
     
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}




//get product by third sub categoryId

export const getProductsByThirdSubCategory = async (request, response) => {
    try {
        const { categoryId } = request.params;
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
        const totalProducts = await ProductModel.countDocuments({ thirdSubCatId: new mongoose.Types.ObjectId(categoryId) });
        const totalPages = Math.ceil(totalProducts / perPage);
        console.log(page, perPage, totalProducts, totalPages);
    
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ thirdSubCatId: new mongoose.Types.ObjectId(categoryId) })
            .populate('category')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
    
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}



//get products by third sub category name
export const getProductsByThirdSubCategoryName = async (request, response) => {
    try {
        const  {thirdSubCat} = request.query
        console.log(thirdSubCat)
        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);
    
      
        const totalProducts = await ProductModel.countDocuments({ thirdSubCat });
        const totalPages = Math.ceil(totalProducts / perPage);
    console.log(page,perPage,totalProducts,totalPages)
        if (totalPages>0 && page>totalPages) {
            return response.status(400).json({
                message: "Page number exceeds total pages",
                success: false,
                error: true
            });
        }
    
        const products = await ProductModel.find({ thirdSubCat: { $regex: thirdSubCat, $options: "i" } })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
            .exec();
    
        console.log(products)
        if (!products || products.length === 0) {
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
     
        return response.status(200).json({
            message: "Products fetched successfully",
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return response.status(500).json({
            message: "Server error while fetching products",
            success: false,
            error: error.message
        });
    }
}


//get products by price

export const getProductsByPrice = async (request, response) => {
    try {
        let productList=[];

    if(request.query.catId !=='' && request.query.catId !== undefined){
        const productListArr = await ProductModel.find({
            category:request.query.catId,
        }).populate('category');

        if(productListArr && productListArr.length>0){
            productList = productListArr;
        }
    }

    if(request.query.subCatId !=='' && request.query.subCatId !== undefined){
        const productListArr = await ProductModel.find({
            subCatId:request.query.subCatId,
        }).populate('category');

        if(productListArr && productListArr.length>0){
            productList = productListArr;
        }
    }

    if(request.query.thirdSubCatId !=='' && request.query.thirdSubCatId !== undefined){
        const productListArr = await ProductModel.find({
            thirdSubCatId:request.query.thirdSubCatId,
        }).populate('category');

        if(productListArr && productListArr.length>0){
            productList = productListArr;
        }
    }

    const filteredProducts = productList.filter((product)=>{
        if(request.query.minPrice && product.price<parseInt(+request.query.minPrice)){
            return false;
        }
        if(request.query.maxPrice && product.price>parseInt(+request.query.maxPrice)){
            return false;
        }
        return true
    })

    return response.status(200).json({
        error:false,
        success:true,
        products:filteredProducts,
        totalPages:0,
        page:0
    
    })
        
    } catch (error) {
        
    }
}


//filter by price controller
export const getProductsByPriceController = async (request, response) => {
    try {
        const { catId, subCatId, thirdSubCatId, minPrice, maxPrice } = request.query;

        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);

        const filter = {}

        if (catId) filter.category = catId;
        if (subCatId) filter.subCatId = subCatId;
        if (thirdSubCatId) filter.thirdSubCatId = thirdSubCatId;
        if (minPrice) filter.price = { ...(filter.price || {}), $gte: parseFloat(minPrice) };
        if (maxPrice) filter.price = { ...(filter.price || {}), $lte: parseFloat(maxPrice) };

        //  Count total products
        const totalProducts = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / perPage);

        if (totalPages > 0 && page > totalPages) {
            return response.status(400).json({
                message: `Page number exceeds total pages (${totalPages})`,
                success: false,
                error: true,
            });
        }

        //  Fetching paginated data
        const products = await ProductModel.find(filter)
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ price: 1, createdAt: -1 })
            .lean();

        return response.status(200).json({
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page,
        });

    } catch (error) {
        console.error("Error in getProductsByPrice:", error.message);
        return response.status(500).json({
            success: false,
            error: true,
            message: "Server error while fetching products by price",
        });
    }
};


//get products by rating
export const getProductsByRating=async(request,response)=>{
    try {
        const { rating,catId,subCatId,thirdSubCatId } = request.query;

        const page = Math.max(parseInt(request.query.page) || 1, 1);
        const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);

        const filter={}
        if(rating){
            filter.rating={$gte:parseFloat(rating)}
        }
          if (catId) filter.category = catId;
        if (subCatId) filter.subCatId = subCatId;
        if (thirdSubCatId) filter.thirdSubCatId = thirdSubCatId;


        const totalProducts = await ProductModel.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / perPage);

        if (totalPages > 0 && page > totalPages) {
            return response.status(400).json({
                message: `Page number exceeds total pages (${totalPages})`,
                success: false,
                error: true,
            });
        }

        const products = await ProductModel.find(filter)
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ rating: -1, createdAt: -1 })
            .lean();

        return response.status(200).json({
            success: true,
            error: false,
            products,
            totalProducts,
            totalPages,
            currentPage: page,
        });

    } catch (error) {
        console.error("Error in getProductsByRating:", error.message);
        return response.status(500).json({
            success: false,
            error: true,
            message: "Server error while fetching products by rating",
        });
    }
}

//get product Count
export const getProductCount=async(request,response)=>{
    try {
        const productCount = await ProductModel.countDocuments();
        if(!productCount){
            return response.status(404).json({
                message: "No products found",
                success: false,
                error: true
            });
        }
        return response.status(200).json({
            message: "Total products count fetched successfully",
            success: true,
            error: false,
            productCount
        });
        
    } catch (error) {
       return response.status(500).json({
            message: "Error fetching total products count",
            success: false,
            error: error.message
        })
    }
}

//get featured products
export const getFeaturedProducts = async (request, response) => {
    try {
        const featuredProducts = await ProductModel.find({ isFeatured: true })
        .populate('category')
            .sort({ createdAt: -1 })
        

        if(!featuredProducts || featuredProducts.length === 0) {
            return response.status(404).json({
                message: "No featured products found",
                success: false,
                error: true
            });
        }

        response.status(200).json({
            message: "Featured products fetched successfully",
            success: true,
            error: false,
            featuredProducts
        })
        
    } catch (error) {
        return response.status(500).json({
            message: "Error fetching featured products",
            success: false,
            error: error.message
        })
    }
}

//delete product
export const deleteProduct =async(request,response)=>{
    try {
        const { productId } = request.params;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }
        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }
        // Delete product images from Cloudinary using promise all

      if(product.images && product.images.length > 0) {
            const deletePromises = product.images.map(image => {
                return cloudinary.uploader.destroy(image.public_id);
            });

            await Promise.all(deletePromises);
        }

        // Delete product from database
        await ProductModel.findByIdAndDelete(productId);

        return response.status(200).json({
            message: "Product deleted successfully",
            success: true,
            error: false,
            product
        });
        
    } catch (error) {
        return response.status(500).json({
            message: "Error deleting product",
            success: false,
            error: error.message
        });
    }
}

//get single product
export const getProduct =async(request,response)=>{
    try {
        const { productId } = request.params;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }

        const product = await ProductModel.findById(productId).populate('category');

        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }

        return response.status(200).json({
            message: "Product fetched successfully",
            success: true,
            error: false,
            product
        });
        
    } catch (error) {
        return response.status(500).json({
            message: "Error fetching product",
            success: false,
            error: error.message
        })
        
    }
}

//delete product image
export async function deleteProductImageController(request, response) {
    try {
        const { public_id } = request.params;
        console.log("Deleting product image with public_id:", public_id);

        if (!public_id) {
            return response.status(400).json({
                message: "Image public_id is required",
                success: false,
                error: true
            });
        }

        // Find the product containing the image
       
        const product = await ProductModel.findOne({"images.public_id": public_id });

        if (!product) {
            return response.status(404).json({
                message: "Product with the image not found",
                success: false,
                error: true
            }); 
        } 

        // Locate image index in the product
        const imageIndex = product.images.findIndex(img => img.public_id === public_id);

        if (imageIndex === -1) {
            return response.status(404).json({
                message: "Image not found in product",
                success: false,
                error: true
            });
        }

        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(public_id);

        // Remove image from product document
        product.images.splice(imageIndex, 1);
        await product.save();

        return response.status(200).json({
            message: "Product image deleted successfully",
            success: true,
            error: false,
            data: product
        });

    } catch (error) {
        console.error("Error deleting product image:", error);
        return response.status(500).json({
            message: "Server error while deleting product image",
            success: false,
            error: true
        });
    }
}


//update product 

export async function updateProductController(request, response) {
    try {
        const { productId } = request.params;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                success: false,
                error: true
            });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }

        let images = [];
        if (Array.isArray(request.files)) {
            images = request.files;
        }

        const updates = {
            ...request.body
        };

        if (images.length > 0) {
            const imageLinks = [];
            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                folder: 'products'
            };

            try {
                for (let i = 0; i < images.length; i++) {
                    const filePath = images[i].path;
                    const result = await cloudinary.uploader.upload(filePath, options);
                    imageLinks.push({
                        url: result.secure_url,
                        public_id: result.public_id
                    });
                }
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                return response.status(500).json({
                    message: "Error uploading images",
                    success: false,
                    error: true
                });
            } finally {
                await Promise.all(images.map(file => fs.unlink(file.path)));
            }

            if (imageLinks.length > 0) {
                updates.images = [...product.images, ...imageLinks];
            }
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            updates,
            { new: true, runValidators: true }
        );

        return response.status(200).json({
            message: "Product updated successfully",
            success: true,
            error: false,
            data: updatedProduct
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}
