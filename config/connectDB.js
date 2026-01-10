import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

import OrderModel from "../models/order.model.js";


if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI is not defined')
}
export const connectDB=async(io)=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('DB connected')
        //watching DB
        const changeStream = OrderModel.watch()

        console.log('watching for changes in orders collection')
        changeStream.on('change',(next)=>{
            console.log('a change happened',next.operationType)
            if(next.operationType==='insert'){
                const doc = next.fullDocument;
                console.log('NEW ORDER',doc._id)
                io.emit('new-order-notification',{
                    message:`New Order Placed!`,
                    orderId:next.fullDocument._id.toString(),
                    total:doc.total,
                    customer:doc.name
                })
                
            }

        })
        changeStream.on('error', (err) => {
            console.error('Change Stream Error:', err);
        });
    } catch (error) {
        console.log('DB connection failed',error)
        process.exit(1)
    }
}