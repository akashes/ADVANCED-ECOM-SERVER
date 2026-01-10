import express from 'express';
import upload from '../middleware/multer.js';
import { addReview, createProduct, deleteMultipleProductsController, deleteProduct, deleteProductImageController, deleteProductImageDuringCreation, getAllProductsWithCatFilter, getFeaturedProducts, getLatestProducts, getPopularProductsByCategory, getProduct, getProductCount, getProductsByCategory, getProductsByCategoryName, getProductsByFilter, getProductsByPrice, getProductsByPriceController, getProductsByRating, getProductsBySubCategory, getProductsBySubCategoryName, getProductsByThirdSubCategory, getProductsByThirdSubCategoryName, getProductSuggestions, relatedProducts, updateProductController, uploadProductImages, uploadProductImagesDuringUpdation } from '../controllers/product.controller.js';
import auth from '../middleware/auth.js';
import { get } from 'http';
import { authorizeRoles } from '../middleware/authRoles.js';

const productRouter = express.Router();



productRouter.post('/upload-product-images',auth,upload.array('productImages',10), uploadProductImages);
productRouter.post('/create', auth, createProduct);
// productRouter.get('/get-all-products',getAllProducts)
productRouter.get('/get-all-products-admin',auth,getAllProductsWithCatFilter)

productRouter.get('/get-product-by-category/:categoryId', getProductsByCategory); 
productRouter.get('/get-product-by-category-name',auth, getProductsByCategoryName); 

productRouter.get('/get-product-by-sub-category/:categoryId', getProductsBySubCategory); 
productRouter.get('/get-product-by-sub-category-name',auth,getProductsBySubCategoryName); 


productRouter.get('/get-product-by-third-sub-category/:categoryId', getProductsByThirdSubCategory); 
productRouter.get('/get-product-by-third-sub-category-name',auth,getProductsByThirdSubCategoryName); 

productRouter.get('/get-product-by-price',auth,getProductsByPriceController) //feels wrong usinig pricecontroller
productRouter.get('/get-product-by-rating',getProductsByRating)

productRouter.get('/get-all-products-count',getProductCount)
productRouter.get('/get-all-featured-products',getFeaturedProducts)

productRouter.delete('/delete-product/:productId',auth,authorizeRoles('ADMIN'),deleteProduct)
productRouter.delete('/delete-multiple-products',auth,authorizeRoles('ADMIN'), deleteMultipleProductsController)

productRouter.get('/get-product/:productId',getProduct)

productRouter.delete('/delete-image',auth,authorizeRoles('ADMIN'), deleteProductImageController)
productRouter.delete('/delete-image-during-creation',auth,deleteProductImageDuringCreation)


productRouter.post('/upload-product-images-during-updation',auth,upload.array('productImages',10), uploadProductImagesDuringUpdation);
productRouter.put('/update-product/:productId',auth,updateProductController)

productRouter.get('/get-popular-products-by-category/:categoryId',getPopularProductsByCategory)
productRouter.get('/latest',getLatestProducts)

productRouter.get('/get-products-by-filter',getProductsByFilter)


productRouter.post('/add-review/:productId',auth,addReview)
productRouter.get('/related-products/:productId',auth,relatedProducts)
productRouter.get('/suggestions',getProductSuggestions)

export default productRouter