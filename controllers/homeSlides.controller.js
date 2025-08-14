import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import HomeSlidesModel from "../models/homeSlides.model.js";
import { request } from "http";
// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true
})

export const createHomeSlidesController=async(request,response)=>{
    try {
        if(!request.file){
            return response.status(400).json({
                message:"Image is required",
                success:false,
                error:true
            })
        }

        try {
               //uploading image to cloudinary
          const options = {
      use_filename: true,
      unique_filename: true, 
      folder: 'home-slides'
    };
        const result = await cloudinary.uploader.upload(request.file.path,options );
        const homeSlide=new HomeSlidesModel ({
            url:result.secure_url,
            public_id:result.public_id
        })
        await homeSlide.save();
        //removing from local storage
        fs.unlinkSync(request.file.path);
        return response.status(200).json({
            message:"Home slide created successfully",
            success:true,
            error:false,
            homeSlide
        })

            
        } catch (error) {
            console.log(error)
            //removing from local storage
            fs.unlinkSync(request.file.path);
            return response.status(500).json({
                message:"Something went wrong",
                success:false,
                error:true
            })
            
        }

     
        
    } catch (error) {
        console.log(error)
        //removing from local storage
        fs.unlinkSync(request.file.path);
        return response.status(500).json({
            message:"Something went wrong", 
            success:false,
            error:true
        })
         
    }

}

export const getAllHomeSlidesController=async(request,response)=>{
    console.log('inide ')
    try {
        const homeSlides=await HomeSlidesModel.find({});
        return response.status(200).json({
            message:"Home slides fetched successfully",
            success:true,
            error:false,
            homeSlides
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

export const deleteHomeSlide=async(request,response)=>{
    try {
        const{id}=request.query;
        if(!id){
            return response.status(400).json({
                message:"Home slide id is required",
                success:false,
                error:true
            })

        }
        await HomeSlidesModel.findByIdAndDelete(id);
        

    
        return response.status(200).json({
            message:"Home slide deleted successfully",
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