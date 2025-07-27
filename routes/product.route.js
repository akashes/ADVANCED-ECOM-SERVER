import express from 'express';
import upload from '../middleware/multer.js';
import { createProduct, deleteProduct, deleteProductImageController, getAllProducts, getFeaturedProducts, getProduct, getProductCount, getProductsByCategory, getProductsByCategoryName, getProductsByPrice, getProductsByPriceController, getProductsByRating, getProductsBySubCategory, getProductsBySubCategoryName, getProductsByThirdSubCategory, getProductsByThirdSubCategoryName, updateProductController, uploadProductImages } from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';

const productRouter = express.Router();



productRouter.post('/uploadImages',auth,upload.array('images',10), uploadProductImages);
productRouter.post('/create', auth, createProduct);
productRouter.get('/get-all-products',getAllProducts)
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

productRouter.delete('/delete-image/:public_id',deleteProductImageController)
productRouter.put('/update-product/:productId',auth,upload.array('images',10),updateProductController)

export default productRouter