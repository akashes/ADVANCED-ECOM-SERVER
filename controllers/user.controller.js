import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmailTemplate from "../utils/verifyEmailTemplate.js";
import dotenv from "dotenv";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
dotenv.config()

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
         const verifyEmail = await sendEmailFun(email,'Verify Your Email for Shopify Ecommerce App',"",verificationEmailTemplate(email,verifyCode))
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


        if(!isCodeValid){
            user.otpAttempts+=1
            await user.save()
            return response.status(400).json({
                message:"Invalid OTP",
                success:false,
                error:true
            })
          
        }
        if(isCodeExpired){
            return response.status(400).json({
                message:"OTP expired",
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

    // if(!user.verify_email){
    //     return response.status(400).json({
    //         message:"Please verify your email",
    //         success:false,
    //         error:true
    //     })
    // }

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
 

        response.clearCookie('accessToken')
        response.clearCookie('refreshToken')

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