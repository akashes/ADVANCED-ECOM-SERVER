
import BannerV1Model from '../models/bannerV1.model.js';
import {v2 as cloudinary} from 'cloudinary'
import { promises as fs } from "fs";
import ProductModel from '../models/product.model.js';

// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true
})


export async function createBannerV1Controller(request,response){
    try {
        const{title,price,alignInfo,category,subCatId,thirdSubCatId,product}=request.body
        console.log(title,price,alignInfo,category)
        console.log(request.file)
        const image=request.file
        console.log(image)

        const existingBanners = await BannerV1Model.find()
           if(existingBanners.length>=8){
            return response.status(400).json({
                  message:"Maximum of 8 Banners are allowed",
                success:false,
                error:true,

            })
        } 
 

        if(!title||!price||!alignInfo||!category||!image){
            return response.status(400).json({
                message:"All fields are required",
                success:false,
                error:true
            })
        }
        //uploading image to cloudinary
            const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'bannerV1'
        };
        const result = await cloudinary.uploader.upload(image.path, options);
        const bannerImage={
            url:result.secure_url,
            public_id:result.public_id
        }
        const banner=await BannerV1Model.create({
            title,
            price,
            alignInfo,
            category,
            subCatId,
            thirdSubCatId,
            bannerImage,
            product
        })
        //deleting image from local storage
        await fs.unlink(image.path)
        return response.status(201).json({
            message:"Banner created successfully",
            success:true,
            error:false,
            banner
        })
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message:"Something went wrong",
            success:false,
            error:true
        })
    }
}

export async function getBannerV1Controller(request,response){
    try {
        const banners=await BannerV1Model.find()
        if(!banners){
            return response.status(404).json({
                message:"Banners not found",
                success:false,
                error:true
            })
        }
        return response.status(200).json({
            message:"Banner fetched successfully",
            success:true,
            error:false,
            banners
        })
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message:"Something went wrong",
            success:false,
            error:true
        })
    }
}

export async function deleteBannerV1Controller(request,response){
    try {
        const{id}=request.query
        if(!id){
            return response.status(400).json({
                message:"Banner id is required",
                success:false,
                error:true
            })
        }
        const existingBanners = await BannerV1Model.find()
        if(existingBanners.length<=4){
            return response.status(400).json({
                  message:"Minimum of 4 Banners are required",
                success:false,
                error:true,

            })
        }
        const banner=await BannerV1Model.findByIdAndDelete(id)
        if(!banner){
            return response.status(404).json({
                message:"Banner not found",
                success:false,
                error:true,
                
            })
        }
        return response.status(200).json({
            message:"Banner deleted successfully",
            success:true,
            error:false,
            id
        })
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message:"Something went wrong",
            success:false,
            error:true
        })
    }
}



export async function getProductByCategory(request,response){
      const { category, subCatId, thirdSubCatId } = request.body;
      console.log(category,subCatId,thirdSubCatId)
  const filter = {};

  if (category) filter.category = category;
  if (subCatId) filter.subCatId = subCatId;
  if (thirdSubCatId) filter.thirdSubCatId = thirdSubCatId;

  try {
    const products = await ProductModel.find(filter)
    if(!products){
        return response.status(404).json({
            message:"Products not found",
            success:false,
            error:true
        })
    }
    response.json({ success: true, products,error:false });
  } catch (err) {
    response.status(500).json({ success: false, message: err.message ,error:true});
  }

}