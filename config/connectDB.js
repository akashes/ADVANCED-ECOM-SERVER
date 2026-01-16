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
        const changeStream = OrderModel.watch([],{fullDocument:'updateLookup'})

        console.log('watching for changes in orders collection')
        changeStream.on('change',(next)=>{
            //for new orders creation by client
            if(next.operationType==='insert'){
                const doc = next.fullDocument;
                //send to admin room 

                io.to('admin_room').emit('new-order-notification',{
                    message:`New Order Placed!`,
                    orderId:doc._id.toString(),
                    total:doc.total,
                    customer:doc.name
                })
                
            }
            if(next.operationType==='update'){
                const doc = next.fullDocument;

const updatedFields = next.updateDescription.updatedFields;            
console.log(updatedFields)

if(updatedFields.order_status){
    console.log(`Order ${doc._id} updated for User ${doc.name}`);

    //targeted emit
    io.to(`user_${doc.userId}`).emit('order-updated',{
        orderId:doc._id,
        order_status:doc.order_status,


    })

}
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