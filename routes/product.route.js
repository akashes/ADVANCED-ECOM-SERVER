import express from 'express';
import upload from '../middleware/multer.js';
import { createProduct, deleteMultipleProductsController, deleteProduct, deleteProductImageController, deleteProductImageDuringCreation, getAllProductsWithCatFilter, getFeaturedProducts, getPopularProductsByCategory, getProduct, getProductCount, getProductsByCategory, getProductsByCategoryName, getProductsByPrice, getProductsByPriceController, getProductsByRating, getProductsBySubCategory, getProductsBySubCategoryName, getProductsByThirdSubCategory, getProductsByThirdSubCategoryName, updateProductController, uploadProductImages, uploadProductImagesDuringUpdation } from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';
import { get } from 'http';

const productRouter = express.Router();



productRouter.post('/upload-product-images',auth,upload.array('productImages',10), uploadProductImages);
productRouter.post('/create', auth, createProduct);
// productRouter.get('/get-all-products',getAllProducts)
productRouter.get('/get-all-products-admin',getAllProductsWithCatFilter)
productRouter.get('/get-product-by-category/:categoryId', getProductsByCategory); 
productRouter.get('/get-product-by-category-name', getProductsByCategoryName); 

productRouter.get('/get-product-by-sub-category/:categoryId', getProductsBySubCategory); 
productRouter.get('/get-product-by-sub-category-name',getProductsBySubCategoryName); 


productRouter.get('/get-product-by-third-sub-category/:categoryId', getProductsByThirdSubCategory); 
productRouter.get('/get-product-by-third-sub-category-name',getProductsByThirdSubCategoryName); 

productRouter.get('/get-product-by-price',getProductsByPriceController) //feels wrong usinig pricecontroller
productRouter.get('/get-product-by-rating',getProductsByRating)

productRouter.get('/get-all-products-count',getProductCount)
productRouter.get('/get-all-featured-products',getFeaturedProducts)

productRouter.delete('/delete-product/:productId',auth,deleteProduct)
productRouter.get('/get-product/:productId',getProduct)

productRouter.delete('/delete-image',deleteProductImageController)
productRouter.delete('/delete-image-during-creation',deleteProductImageDuringCreation)
productRouter.delete('/delete-multiple-products',deleteMultipleProductsController)


productRouter.post('/upload-product-images-during-updation',auth,upload.array('productImages',10), uploadProductImagesDuringUpdation);
productRouter.put('/update-product/:productId',auth,updateProductController)

productRouter.get('/get-popular-products-by-category/:categoryId',getPopularProductsByCategory)

export default productRouter