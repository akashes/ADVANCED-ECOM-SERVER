import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI is not defined')
}
export const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('DB connected')
    } catch (error) {
        console.log('DB connection failed',error)
        process.exit(1)
    }
}