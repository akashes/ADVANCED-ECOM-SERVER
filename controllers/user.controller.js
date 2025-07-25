import UserModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmailFun from "../config/sendEmail.js";
import verificationEmailTemplate from "../utils/verifyEmailTemplate.js";
import dotenv from "dotenv";
dotenv.config()

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