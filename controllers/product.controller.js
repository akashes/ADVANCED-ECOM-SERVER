
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import slugify from "slugify";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import { response } from "express";
import CartProductModel from "../models/cartProduct.model.js";

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

        // imageLinks.push({
        //   url: null,
        //   public_id: null,
        //   error: uploadErr.message,
        //   file: file.originalname
        // });
        return response.status(500).json({
          message: "Error uploading images",
          success: false,
          error: uploadErr.message
        })
      }
    }

    return response.status(200).json({
      message: "Product images upload process completed",
      success: true,
      error: false,
      productImages: imageLinks
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

        const userId=request.userId
        const productData = request.body
        //checking for duplicate name
        const existingProduct = await ProductModel.findOne({ name: productData.name });
        if (existingProduct) {
            return response.status(400).json({
                message: "Product with the same name already exists",
                success: false,
                error: true
            });
        }
        if(!productData.category){
            return response.status(400).json({
                message: "Category not found",
                success: false,
                error: true
            });
        }
        if(!productData.name || !productData.description || !productData.price  ||!productData.catName ||
              !productData.countInStock){
            return response.status(400).json({
                message: "All fields are required",
                success: false,
                error: true
            });
        }
        productData.slug =  slugify(productData.name, {
            lower: true,
        });
        //calculating discount using old and new Price
        if(productData.oldPrice && productData.price){
            if(Number(productData.price) < Number(productData.oldPrice)){
                
            const discount = ((Number(productData.oldPrice) - Number(productData.price)) / Number(productData.oldPrice)) * 100;
           productData.discount = Math.floor(discount);


                console.log(discount)
            }
        }
        console.log(productData)


        const newProduct = new ProductModel({ ...productData, createdBy: userId });
        await newProduct.save();



        return response.status(201).json({
            message: "Product created successfully",
            success: true,
            error: false,
            product: newProduct
        });
        
    } catch (error) {
        console.log(error) 
        return response.status(500).json({
            message: "Error creating product",
            success: false,
            error: error.message
        })
    }

}

//get all products
// export const getAllProducts = async (request, response) => {
//     try {

//         const page = Math.max(parseInt(request.query.page) || 1, 1);
//     const perPage = Math.max(parseInt(request.query.perPage) || 10, 1);

//         const totalProducts = await ProductModel.countDocuments();
//         const totalPages = Math.ceil(totalProducts / perPage);

//         if (totalPages>0 && page>totalPages) {
//             return response.status(400).json({
//                 message: "Page number exceeds total pages",
//                 success: false,
//                 error: true
//             });
//         }

//             const products = await ProductModel.find()
//                 .populate('category')
//                 .skip((page - 1) * perPage)
//                 .limit(perPage)
//                 .sort({ createdAt: -1 })
//                 .exec();
            



//         if (!products || products.length === 0) {
//             return response.status(404).json({
//                 message: "No products found",
//                 success: false,
//                 error: true
//             });
//         }
        
//         return response.status(200).json({
//         message: "Products fetched successfully",
//         success: true,
//         error: false,
//         products,
//         totalProducts,
//         totalPages,
//         currentPage: page
//         });
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         return response.status(500).json({
//         message: "Server error while fetching products",
//         success: false,
//         error: error.message
//         });
//     }
// }


//get all products with category filter
export const getAllProductsWithCatFilter = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = Math.max(parseInt(req.query.perPage) || 10, 1);
    const { category, subCatId, thirdSubCatId,minRating, search ,isFeatured,discount} = req.query;

    const filter = {};

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    if (subCatId && mongoose.Types.ObjectId.isValid(subCatId)) {
      filter.subCatId = new mongoose.Types.ObjectId(subCatId);
    }
    if (thirdSubCatId && mongoose.Types.ObjectId.isValid(thirdSubCatId)) {
      filter.thirdSubCatId = new mongoose.Types.ObjectId(thirdSubCatId);
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if(minRating){
        filter.rating = { $gte: Number(minRating) };
    }
    if(isFeatured){
        filter.isFeatured = isFeatured
    }
    if(discount){
        filter.discount = { $gte: Number(discount) };
    }

    console.log("Applied filter:", filter);

    const skip = (page - 1) * perPage;

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter)
        .skip(skip)
        .limit(Number(perPage))
        .populate("category subCatId thirdSubCatId")
        .sort({ updatedAt: -1 }),
      ProductModel.countDocuments(filter)
    ]);

    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      error: false,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / perPage),
      currentPage: Number(page)
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Server error while fetching products",
      success: false,
      error: error.message
    });
  }
};

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
            .limit(15)
        

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

        //delete products from all carts
        await CartProductModel.deleteMany({productId})

        // Delete product from database
        await ProductModel.findByIdAndDelete(productId);

        return response.status(200).json({
            message: "Product deleted successfully",
            success: true,
            error: false,
            id: productId
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

        const product = await ProductModel.findById(productId)
        .populate('category')
        .populate("reviews.user",'name avatar.url ')

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

//delete product image during creation
export async function deleteProductImageDuringCreation(request, response) {
    try {
        const { public_id } = request.query;
        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(public_id);
        return response.status(200).json({
            message: "Image deleted successfully",
            success: true,
            error: false,
            id: public_id
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}

//delete product image
export async function deleteProductImageController(request, response) {
    try {
        const { public_id } = request.query;
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
        console.log(product)

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
            id:public_id
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
        

        // let images = [];
        // if (Array.isArray(request.files)) {
        //     images = request.files;
        // }

        const updates = {
            ...request.body
        };
        const {oldPrice,price} = request.body;  
            //calculating discount using old and new Price
     if(oldPrice && price){
            if(Number(price) < Number(oldPrice)){
                
            const discount = ((Number(oldPrice) - Number(price)) / Number(oldPrice)) * 100;
           updates.discount = Math.floor(discount);


            }
        }
        console.log(updates)

        // if (images.length > 0) {
        //     const imageLinks = [];
        //     const options = {
        //         use_filename: true,
        //         unique_filename: false,
        //         overwrite: true,
        //         folder: 'product-images'
        //     };

        //     try {
        //         for (let i = 0; i < images.length; i++) {
        //             const filePath = images[i].path;
        //             const result = await cloudinary.uploader.upload(filePath, options);
        //             imageLinks.push({
        //                 url: result.secure_url,
        //                 public_id: result.public_id
        //             });
        //         }
        //     } catch (error) {
        //         console.error('Error uploading to Cloudinary:', error);
        //         return response.status(500).json({
        //             message: "Error uploading images",
        //             success: false,
        //             error: true
        //         });
        //     } finally {
        //         await Promise.all(images.map(file => fs.unlink(file.path)));
        //     }

        //     if (imageLinks.length > 0) {
        //         updates.images = [...product.images, ...imageLinks];
        //     }
        // }

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


export async function deleteMultipleProductsController(request,response){
    try {
        const ids = request.body.ids
        if(!ids || !Array.isArray(ids) || ids.length === 0){
            return response.status(400).json({
                message: "Product IDs are required",
                success: false,
                error: true
            });
        }
        //deleting images
        try {
            const products = await ProductModel.find({_id: {$in:ids}});
            for (const product of products) {
                for (const image of product.images) {
                    await cloudinary.uploader.destroy(image.public_id);
                }
            }
            
        } catch (error) {
            console.error("Error deleting images:", error);
            return response.status(500).json({
                message: "Error deleting images",
                success: false,
                error: true
            });
            
        }
            await CartProductModel.deleteMany({ productId: { $in: ids } })

        const deletedProducts = await ProductModel.deleteMany({_id: {$in:ids}});
        return response.status(200).json({
            message: "Products deleted successfully",
            success: true,
            error: false,
            ids
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false,
            error: true
        });
    }
}


export const uploadProductImagesDuringUpdation = async (request, response) => {
  try {
    const images = request.files;
    const{productId} = request.query

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

        // imageLinks.push({
        //   url: null,
        //   public_id: null,
        //   error: uploadErr.message,
        //   file: file.originalname
        // });
        return response.status(500).json({
          message: "Error uploading images",
          success: false,
          error: uploadErr.message
        })
      }
    }

    //updating images in products collection
    product.images = [...product.images, ...imageLinks];
    await product.save();

    return response.status(200).json({
      message: "Product images upload process completed",
      success: true,
      error: false,
      productImages: imageLinks
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

export const getPopularProductsByCategory=async(request,response)=>{
    console.log('here')
    try {
    const { categoryId } = request.params;
    const products = await ProductModel.find({ category:categoryId })
      .sort({ sale: -1 }) // or any metric like salesCount
      .limit(6);
      
      if(!products){
        return response.status(404).json({
          message: "No products found",
          success: false,
          error: true
        });
      }
      console.log(products)

    response.json({
      success: true,
      error:false,
      products,
      categoryId
    });
  } catch (err) {
    response.status(500).json({ success: false, message: 'Server error' });
  }
}


export const getLatestProducts = async (req, res) => {
  try {
    // const limit = parseInt(req.query.limit) || 10;

    const products = await ProductModel.find()
      .sort({ createdAt: -1 }) 
      .limit(15);

    res.status(200).json({
      message: "Latest products fetched successfully",
      success: true,
      error: false,
      products
    });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    res.status(500).json({ message: "Server error while fetching latest products",success:false,error:true });
  }
};



//filter products
export const getProductsByFilter = async (req, res) => {
    console.log(req.query)
    
  try {
    console.log('inside filter products ')
    console.log(req.query)
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = Math.max(parseInt(req.query.perPage) || 10, 1);
    const { category, subCatId, thirdSubCatId, rating, search,
         isFeatured, sort,minPrice,maxPrice,discount } = req.query;

    const filter = {};

if (category) {
  let categories = [];
  if (Array.isArray(category)) {
    categories = category;
  } else if (typeof category === "string") {
    categories = category.split(","); // handle "id1,id2"
  }

  filter.category = {
    $in: categories
      .filter(mongoose.Types.ObjectId.isValid)
      .map(id => new mongoose.Types.ObjectId(id))
  };
}

    if (subCatId) {
      const subCategories = Array.isArray(subCatId) ? subCatId : [subCatId];
      filter.subCatId = { $in: subCategories.filter(mongoose.Types.ObjectId.isValid).map(id => new mongoose.Types.ObjectId(id)) };
    }

    if (thirdSubCatId) {
      const thirdSubCategories = Array.isArray(thirdSubCatId) ? thirdSubCatId : [thirdSubCatId];
      filter.thirdSubCatId = { $in: thirdSubCategories.filter(mongoose.Types.ObjectId.isValid).map(id => new mongoose.Types.ObjectId(id)) };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }
    if (isFeatured) {
      filter.isFeatured = isFeatured;
    }
    if(discount){
        filter.discount = { $gte: Number(discount) };
    }

    if(minPrice || maxPrice){
        filter.price = {};
        if(minPrice) filter.price.$gte= Number(minPrice);
        if(maxPrice) filter.price.$lte= Number(maxPrice);
    
    }

    console.log("Applied filter:", filter);

    const skip = (page - 1) * perPage;

    let sortOption = { updatedAt: -1 }; // default
    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };
    if(sort==='sales_desc') sortOption = { sale: -1 };
    if(sort==="newest") sortOption = { createdAt: -1 };
    if(sort==="rating_desc") sortOption = { rating: -1 };
    if(sort==="discount_desc") sortOption = { discount: -1 };
   

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter)
        .skip(skip)
        .limit(Number(perPage))
        .populate("category subCatId thirdSubCatId")
        .sort(sortOption),
      ProductModel.countDocuments(filter),
    ]);


    
//     let grouped=[]
// if (category) {
//   let categories = [];
//   if (Array.isArray(category)) {
//     categories = category;
//   } else if (typeof category === "string") {
//     categories = category.split(","); // handle "id1,id2"
//   }
//   categories = [...categories].reverse()
//   categories.forEach(catId=>{
//       const catProducts = products.filter(p => p.category.equals(catId));
//   grouped.push(...catProducts);
//   })
// }
 

    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      error: false,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / perPage),
      currentPage: Number(page), 
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      message: "Server error while fetching products",
      success: false,
      error: error.message,
    });
  }
};



//product review



export const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // check if user already reviewed
    const existingReview = product.reviews.find(
      r => r.user.toString() === req.userId.toString()
    );

    if (existingReview) {
        console.log('existing review')
      existingReview.rating = Number(rating);
      existingReview.comment = comment;
    } else {
      //  create new review
      console.log( 'new review')
      const review = {
        user: req.userId,
        rating: Number(rating),
        comment
      };
      product.reviews.push(review);
    }

    // recalc numReviews & avg rating
    product.numReviews = product.reviews.length; 
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

  const updatedProduct=  await product.save();
  await updatedProduct.populate("reviews.user","name avatar")

    console.log(product)

    res.status(201).json({
      success: true,
      message: existingReview ? "Review updated" : "Review added",
      product:updatedProduct
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: error.message });
  }
};


export const relatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await ProductModel.findById(productId);
    if(!product) return res.status(404).json({success:false,message:"Product not found"})

        let related = [];

        if(product.thirdSubCatId){
            related = await ProductModel.find(
                {
                    thirdSubCatId:product.thirdSubCatId,
                    _id:{$ne:product._id},

                }
            ).limit(6)
        }

          if (related.length < 6 && product.subCatId) {
      const subCatProducts = await ProductModel.find({
        subCatId: product.subCatId,
        _id: { $ne: product._id },
      })
        .limit(6 - related.length);

      related = [...related, ...subCatProducts];
    }
     if (related.length < 6 && product.category) {
      const catProducts = await ProductModel.find({
        category: product.category,
        _id: { $ne: product._id },
      })
        .limit(6 - related.length);

      related = [...related, ...catProducts];
    }
        const uniqueRelated = Array.from(
      new Map(related.map((p) => [p._id.toString(), p])).values()
    );




    res.json({
        success:true,
        products:uniqueRelated.slice(0,6)
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getProductSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

 const suggestions = await ProductModel.aggregate([
  { $match: { name: { $regex: query, $options: "i" } } },
  { $project: {
      name: 1,
      slug: 1,
      _id:1,
      image: { $arrayElemAt: ["$images.url", 0] },
      price:1
    }
  },
  { $limit: 5 }
]);

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
