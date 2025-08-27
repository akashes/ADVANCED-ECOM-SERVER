

import { instance } from "../index.js";
import OrderModel from "../models/order.model.js";
import crypto from "crypto";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";





export const createOrder=async(request,response)=>{
    try {
        const{amount,name,products}=request.body

            for (let item of products) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        console.log('product not found in db')
        return response.status(400).json({
          success: false,
          message: `Product ${  item.productId} not found`,
        });
      }
      if(product.countInStock < item.quantity){
        return response.status(400).json({
            success: false,
          message: `Not enough stock for ${product.name.substr(0,20)+'...'} ---- Available Stock: ${product.countInStock}`,
          });
      }
    }


        const options={
            amount:Number(amount)*100,
            currency:'INR',
            receipt:`receipt_order_${Math.random() * 1000}`,
            notes:{
                name,
                userId:request.userId,
              

            }
            
        }
      const order =   await instance.orders.create(options)
      console.log(order)
      response.status(200).json({
        success:true,
        error:false,
        order
      })
    } catch (error) {
        console.log(error)
        
    }
}
// export const sendApiKey=async(request,response)=>{
//     try {
//         response.status(200).json({
//             success:true,
//             error:false,
//             key:process.env.RAZORPAY_API_KEY
//         })
//     } catch (error) {
//         console.log(error)
//         response.status(500).json({
//             success:false,
//             error:true,
//             message:error.message||error
//         })
        
//     }
  
// }


export const verifyPaymentAndCreateOrder = async (req, res) => {
        const session = await mongoose.startSession();
    session.startTransaction();
  try {
 const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      name,
      products,
      delivery_address,
      total,
      payment_id,
      payment_status,
      date
    } = req.body;
    console.log(req.body)
    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !name || !products || !delivery_address || !total || !payment_id || !payment_status || !date){
        return res.status(400).json({ success: false, message: "All fields are required" });
    }


    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    console.log('signature matches !!')
    console.log('payment verification successfull')

    //checking stock before creating order
    for (let item of products) {
        const product = await ProductModel.findById(item.productId).session(session);
    
        if (!product) {
            console.log('product not found in db, cannot create order')
            throw new Error(`Product ${item.productId} not found`);
        }
        if(product.countInStock < item.quantity){
          throw new Error(`Not enough stock for ${product.name.substr(0,20)+'...'}  . Available: ${product.countInStock}`);
        }
        //decrement stock
        product.countInStock -= item.quantity;
        await product.save({ session });
        }



    // for(let item of products){
    //     await ProductModel.findByIdAndUpdate(
    //         item.productId,
    //         {$inc:{countInStock:-item.quantity}},
    //         {new:true,session}
    //     )
    // }
   const order = await OrderModel.create([
    {
      userId:req.userId,
      name,
      email,
      razorpay_order_id,
      razorpay_payment_id,
      products,
      payment_id,
      payment_status,
      order_status: "confirmed",
      delivery_address,
      total,
      date,
      receipt: `rcpt_${Date.now()}`,
      notes: { verified: "true", method: "Razorpay" },
      
    }
   ],{ session });
    console.log(order)

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, order:order[0],message:"Order Placed" });
  } catch (error) {
    console.log(error)
    await session.abortTransaction();
    session.endSession();
     if (req.body.razorpay_payment_id) {
      try {
        await instance.payments.refund(req.body.razorpay_payment_id, {
          amount: req.body.total * 100, //amount to  refund
          speed: "optimum",
        });
        console.log("Auto-refund initiated");
      } catch (refundError) {
        console.error("Refund failed:", refundError.message);
      }
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

export const cashOnDelivery = async (req, res) => {
        const session = await mongoose.startSession();
    session.startTransaction();
  try {
 const {
 
      email,
      name,
      products,
      delivery_address,
      total,
      payment_status,
      payment_method,
      date
    } = req.body;
    console.log(req.body)
    if(!email || !name || !products || !delivery_address || !total || !payment_status || !payment_method|| !date){
        return res.status(400).json({ success: false, message: "All fields are required" });
    }




    //checking stock before creating order
    for (let item of products) {
        const product = await ProductModel.findById(item.productId).session(session);
    
        if (!product) {
            console.log('product not found in db, cannot create order')
            throw new Error(`Product ${item.productId} not found`);
        }
        if(product.countInStock < item.quantity){
          throw new Error(`Not enough stock for ${product.name.substr(0,20)+'...'}  . Available: ${product.countInStock}`);
        }



        //decrement stock
        product.countInStock -= item.quantity;
        await product.save({ session });

                //incrementing reserved stock 
        product.reservedStock += item.quantity;
        await product.save({ session });
        }






   const order = await OrderModel.create([
    {
      userId:req.userId,
      name,
      email,

      products,
      payment_status,
      order_status: "pending",
      delivery_address,
      total,
      date,
      receipt: `rcpt_${Date.now()}`,
      notes: { verified: "true", method: "cod" },
      
    }
   ],{ session });
    console.log(order)

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, order:order[0],message:"Order Placed" });
  } catch (error) {
    console.log(error) 
    await session.abortTransaction();
    session.endSession();
   

    res.status(500).json({ success: false, message: error.message });
  }
};


export const getOrders = async(request,response)=>{
    try {
        const userId = request.userId
        if(!userId){
            return response.status(400).json({
                success:false,
                error:true,
                message:"User not found"
            })
        }
        const orders = await OrderModel.find({userId}).populate('delivery_address').sort({createdAt:-1})
        return response.status(200).json({
            success:true,
            error:false,
            orders
        })
        
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            success:false,
            error:true,
            message:error.message||error
        })
        
    }
}