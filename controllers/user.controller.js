import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmailTemplate from "../utils/verifyEmailTemplate.js";
import dotenv from "dotenv";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
dotenv.config()

import fs from 'fs/promises'
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import forgotPasswordEmailTemplate from "../utils/forgotPasswordEmailTemplate.js";


// configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    secure: true
})


// register user
export async function registerUserController(request,response){
    console.log('inside user controller')
    try {
        let user;
        const {name,email,password}=request.body

        // input validation
        if(!name||!email||!password){
            return response.status(400).json({
                message:"All fields are required",
                error:true,
                success:false 
            })
        }
        // duplicate checking
         user=await UserModel.findOne({email})
        // user already exists
        if(user){
            return response.status(400).json({
                message:"User already exists",
                error:true,
                success:false
            })
        }

        // otp creation and expiration
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        const hashPassword=await bcrypt.hash(password,10)
     
        user=new UserModel({
            name,
            email,
            password:hashPassword,
            otp:verifyCode,
            otpExpires:Date.now()+15*60*1000 //15 minutes
        })

         //send verification mail
         console.log('sending email to ',email)
         const verifyEmail = await sendEmailFun(
            email,
            'Verify Email OTP : '+verifyCode+' for Shopify Ecommerce App',
            "",
            verificationEmailTemplate(user.name,verifyCode))
          console.log(verifyEmail)
        //checking for email sending
        if(!verifyEmail){
            return response.status(500).json({
                message:"Error sending verification email",
                error:true,
                success:false
            })
        }

        //save user // saving user only if email is sent
        await user.save() 

        //create jwt token
        const token = jwt.sign(
             {email:user.email, id:user._id},process.env.JWT_SECRET_KEY
            )
        
  

        return response.status(201).json({
               success:true,
               error:false,
               message:"User registered successfully! Please verify your email",
               token
        })
      
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
}

// verify email
export async function verifyEmailController(request,response) {
    try {
        const{email,otp}=request.body

        // input validation
        if(!email||!otp){
            return response.status(400).json({
                message:"All fields are required",
                success:false,
                error:true
            })
        }

        const user = await UserModel.findOne({email}).select('+otp +otpExpires +otpAttempts')
        
        //user not found
        if(!user){
            return response.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }
        if(user.verify_email){
            return response.status(400).json({
                message:"Email already verified",
                success:false,
                error:true
            })
        }
        if(user.otpAttempts>=5){
            return response.status(400).json({
                message:"Too many failed attempts. Please request a new OTP",
                success:false,
                error:true
            })
        }

        const isCodeValid = user.otp===otp 
        const isCodeExpired = user.otpExpires< Date.now()


            if(isCodeExpired){
            return response.status(400).json({
                message:"OTP expired",
                success:false,
                error:true
            })
        }

        if(!isCodeValid){
            user.otpAttempts+=1
            await user.save()
            return response.status(400).json({
                message:"Invalid OTP",
                success:false,
                error:true
            })
          
        }
    

            user.verify_email=true
            user.otp=null
            user.otpExpires=null
            user.otpAttempts=0
            await user.save()
            return response.status(200).json({
                success:true,
                error:false,
                message:"Email verified successfully"
            })
            

    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
    
}

// login user
export async function loginUserController(request,response) {

   try {
     const{email,password}=request.body

    if(!email||!password){
        return response.status(400).json({
            message:"All fields are required",
            success:false,
            error:true
        })
    }

    const user = await UserModel.findOne({email}).select('+password')

    if(!user){
        return response.status(400).json({
            message:"User not found",
            success:false,
            error:true
        })
    }
    if(user.status!=='Active'){
        return response.status(400).json({
            message:"User is not active,Contact Admin",
            success:false,
            error:true
        })
    }

    if(!user.verify_email){
        return response.status(400).json({
            message:"Please verify your email",
            success:false,
            error:true
        })
    }

    const isPasswordValid = await bcrypt.compare(password,user.password)

    if(!isPasswordValid){
        return response.status(400).json({
            message:"Invalid password",
            success:false,
            error:true
        })
    }

    const accessToken = await generateAccessToken(user._id)
    const refreshToken = await generateRefreshToken(user._id)

    const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
        last_login_date:new Date()
    })
    const cookiesOption={
        httpOnly:true,
        secure:true,
        sameSite:'none'
    }
    response.cookie('accessToken',accessToken,cookiesOption)
    response.cookie('refreshToken',refreshToken,cookiesOption)

    return response.status(200).json({
        message:"Login successful",
        success:true,
        error:false,
        data:{
            accessToken,
            refreshToken
        }
    })
   } catch (error) {
    console.log(error)
    return response.status(500).json({
        message:error.message||error,
        error:true,
        success:false
    })
    
   }


    
}

//logout controller

export async function logoutController(request,response) {
    try {

        const userId = request.userId
        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:'none'
        }
 

        response.clearCookie('accessToken',cookiesOption)
        response.clearCookie('refreshToken',cookiesOption)

               await UserModel.findByIdAndUpdate(userId,{
            refresh_token:""
        })
        return response.status(200).json({
            message:"Logout successful",
            success:true,
            error:false
        })
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}


//image upload cloudinary
export async function userAvatarController(request, response) {
    try {
        const userId = request.userId;
        const images = request.files;

        if (!images || images.length === 0) {
            return response.status(400).json({ message: "No files uploaded" });
        }

        const user = await UserModel.findById(userId)
        if(!user){
            return res.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }
        
        // uploads to avatar folder
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            folder:'avatars'
        };

        const imageUrls = [];

        for (let i = 0; i < images.length; i++) {
            const filePath = images[i].path;

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(filePath, options);
            imageUrls.push(result.secure_url);

        
            // non blocking deletion
            await fs.unlink(filePath);
        }

        //deleting previous avatar from cloudinary
        if(user.avatar){
            const parts = user.avatar.split('/');
            const fileName = parts.pop().split('.')[0]; // 'user123'
            const folder = parts.pop(); // 'avatar'
            const publicId= `${folder}/${fileName}`; 
            await cloudinary.uploader.destroy(publicId)
        }

           //update user avatar
            user.avatar = imageUrls[0]
            await user.save()


        return response.status(200).json({
            _id: userId,
            avatar: imageUrls[0] // return only first image URL
        });

    } catch (error) {
        console.log(error)
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


// remove cloudinary images
export async function removeAvatarController(request,response){
    try {
        const imgUrl = request.query?.img
        if(!imgUrl){
            return response.status(400).json({
                message:"Image url is required",
                success:false,
                error:true
            })
        }
        //assuming avatar is in the avatar folder in cloudinary3
        const parts = imgUrl.split('/');
            const fileName = parts.pop().split('.')[0]; // 'user123'
            const folder = parts.pop(); // 'upload'
            const publicId= `${folder}/${fileName}`; 

            console.log(publicId)

            // result would be in {result:'ok'/'not found'}
       const result= await cloudinary.uploader.destroy(publicId)

       if(result.result==='ok'){
        return response.status(200).json(res)
       }else if(result.result==='not found'){
        return response.status(400).json({
            message:"Image not found",
            success:false,
            error:true
        })
       }else{
        return response.status(500).json({
            message:"Something went wrong",
            success:false,
            error:true
        })
       }
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}



//update user details
export async function updateUserDetails(request,response) {
    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        const userId = request.userId
        const{name,email,phone,password}=request.body

        //atleast one field must be there
        if(!name && !email && !phone && !password){
            return response.status(400).json({
                message:"Atleast one field is required",
                success:false,
                error:true
            })
        }

        const user = await UserModel.findById(userId)
        .session(session)
        .select('+password +otp +otpExpires +otpAttempts +verify_email')

        //user not found
        if(!user){
            await session.abortTransaction()
            return response.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }
        
        const isEmailChanged =email  &&  email !== user.email

     
        //if email changes email verification will be required
        let verifyCode
       if(isEmailChanged){
                 verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
  
                
       }


       let hashedPassword;
        if(typeof password === 'string' && password.trim()){
             hashedPassword=await bcrypt.hash(password,10)
        }else{
            hashedPassword = user.password
        }
        const updatedUser = await UserModel.findByIdAndUpdate(userId,
            {
                name:name||user.name,
                email:email||user.email,
                mobile:phone||user.mobile,
                password:hashedPassword,
                verify_email:isEmailChanged?false:user.verify_email,
                otp:isEmailChanged?verifyCode:user.otp,
                otpExpires:isEmailChanged?Date.now()+600000:user.otpExpires,
                otpAttempts:isEmailChanged?0:user.otpAttempts
            },
            {
                new:true,
                session
            }
        )
        if(isEmailChanged){
         const verifyEmail = await sendEmailFun(
            email,
            'Verify Your Email for Shopify Ecommerce App',
            "",
            verificationEmailTemplate(updatedUser.name,verifyCode)
        
        )
        if(!verifyEmail){
            await session.abortTransaction()
            console.log('could not send verification email')
            return response.status(500).json({
                message:"Error sending verification email,Changes were not saved",
                error:true,
                success:false
            })
        }
        }

        await session.commitTransaction()

        return response.status(200).json({
            message:"User updated successfully",
            success:true,
            error:false,
            user:updatedUser
        })
 
    } catch (error) {
        console.log(error)

               await session.abortTransaction()

        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
    finally{
        await session.endSession()
    }
    
}


//forgot password
export async function forgotPasswordController(request,response){
    try {
        const{email}=request.body
        const user = await UserModel.findOne({email}).select('+otp +otpExpires +otpAttempts')

        if(!user){
            return response.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()
   


        //send email first
        const forgotPasswordEmail = await sendEmailFun(
            email,
            'Reset Password OTP : '+verifyCode+' for Shopify Ecommerce App',
            "",
            forgotPasswordEmailTemplate(user.name,verifyCode)
         
        )
        if(!forgotPasswordEmail){
            console.log('could not send forgot password email')
            return response.status(500).json({
                message:"Error sending forgot password email",
                error:true,
                success:false
            })
        }
        //update only when email is sent
             user.otp = verifyCode
            user.otpExpires = Date.now() + 15*60*1000 // 15 minutes
            user.otpAttempts = 0
            await user.save()

        return response.status(200).json({
            message:"OTP sent successfully,check your email",
            success:true,
            error:false
        })
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }

}

//verify forgot password otp
export async function verifyForgotPasswordOtpController(request,response){
    try {
        const{email,otp}=request.body

        if(!email||!otp){
            return response.status(400).json({
                message:"All fields are required",
                success:false,
                error:true
            })
        }

        const user = await UserModel.findOne({email}).select('+otp +otpExpires +otpAttempts')

        if(!user){
            return response.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }
        if(user.otpAttempts>=5){
            return response.status(400).json({
                message:"Too many failed attempts. Please request a new OTP",
                success:false,
                error:true
            })
        }

        const isCodeValid = user.otp===otp 
        const isCodeExpired = user.otpExpires< Date.now()

             if(isCodeExpired){
            return response.status(400).json({
                message:"OTP expired, please request a new one",
                success:false,
                error:true
            })
            }

            if(!isCodeValid){
                user.otpAttempts+=1
                await user.save()
                return response.status(400).json({
                    message:"Invalid OTP",
                    success:false,
                    error:true
                })
            
            }
   

        //reset otp and otpExpires
        user.otp=null
        user.otpExpires=null
        user.otpAttempts=0
        // user.password = await bcrypt.hash(password, 10) 
        await user.save()

        return response.status(200).json({
            message:"OTP verified successfully",
            success:true,
            error:false
        })

    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}




// reset password 
export async function resetPasswordController(request,response){
    try {
        const{email,newPassword,confirmPassword}=request.body
        if(!email||!newPassword||!confirmPassword){
            return response.status(400).json({
                message:"All fields are required",
                success:false,
                error:true
            })
        }
        if(newPassword!==confirmPassword){
            return response.status(400).json({
                message:"Passwords do not match",
                success:false,
                error:true
            })
        }
        const user = await UserModel.findOne({email}).select('+password +verify_email')
        console.log(user)

        if(!user){
            return response.status(400).json({
                message:"User not found",
                success:false,
                error:true
            })
        }
        if(!user.verify_email){
            return response.status(400).json({
                message:"Please verify your email first",
                success:false,
                error:true
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword
        await user.save()

        return response.status(200).json({
            message:"Password reset successfully",
            success:true,
            error:false
        })
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
} 


//refresh token controller
export async function refreshTokenController(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(' ')[1] 

        if(!refreshToken){
            return response.status(401).json({
                message:"Provide refresh token",
                success:false,
                error:true
            })
        }

        const decoded = jwt.verify(refreshToken,process.env.REFRESH_SECRET)

        if(!decoded){
            return response.status(401).json({
                message:"Unauthorized access",
                success:false,
                error:true
            })
        }

        const user = await UserModel.findById(decoded.id)

        if(!user){
            return response.status(404).json({
                message:"User not found",
                success:false,
                error:true
            })
        }

        // if(user.refresh_token!== refreshToken){
        //     return response.status(403).json({
        //         message:"Refresh token mismatch",
        //         success:false,
        //         error:true
        //     })
        // }

        const newAccessToken = await generateAccessToken(user._id)
        // const newRefreshToken = await generateRefreshToken(user._id)

 

        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:'none'
        }
        
        response.cookie('accessToken',newAccessToken,cookiesOption)
        // response.cookie('refreshToken',newRefreshToken,cookiesOption)

        return response.status(200).json({
            message:"New Access Token generated successfully",
            success:true,
            error:false,
            data:{
                accessToken:newAccessToken,
                // refreshToken:newRefreshToken

            }
        })

    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}



//get user details
export async function getUserDetailsController(request,response){
    try {
        const userId = request.userId

        
        const user = await UserModel.findById(userId).select('-refresh_token')
 

        if(!user){
            return response.status(404).json({
                message:"User not found",
                success:false,
                error:true
            })
        }

        return response.status(200).json({
            message:"User details fetched successfully",
            success:true,
            error:false,
            data:user
        })
        
    } catch (error) {
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
        
    }
}