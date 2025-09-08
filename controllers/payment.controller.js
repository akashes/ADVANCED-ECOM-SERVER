

import { instance } from "../index.js";
import OrderModel from "../models/order.model.js";
import crypto from "crypto";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";

import paypal from '@paypal/checkout-server-sdk'

import { client } from "../index.js";  //paypal client

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
      payment_method:'razorpay'
      
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
            return res.status(400).json({
                message:`Product ${item.productId} not found`,
                success:false,
                error:true
            })
        }
        if(product.countInStock < item.quantity){
          return res.status(400).json({
            message:  `Not enough stock for ${product.name.substr(0,20)+'...'}  . Available: ${product.countInStock}`,
            success:false,
            error:true
          })
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
      payment_method:'cod'
      
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





export const getPayPalClientKey=async(req,res)=>{
    try {
        res.status(200).json({
            success:true,
            error:false,
            clientId:process.env.PAYPAL_CLIENT_ID
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:true,
            message:'Couldnt fetch paypal client key'
        })
    }

}

// Create paypal order
export const createPayPalOrder=async(req,res)=>    {
    console.log('inside createPayPalOrder controller')
    console.log(req.body.amount)
    console.log(client)
    const {amount,products} = req.body
    if(!amount || amount<=0){
        return res.status(400).json({
            success:false,
            error:true,
            message:"Invalid amount"
        })
    }

    

       for (let item of products) {
      const product = await ProductModel.findById(item.productId);

      if (!product) {
        console.log('product not found in db')
        return res.status(400).json({
          success: false,
          message: `Product ${  item.productId} not found`,
        });
      }
      if(product.countInStock < item.quantity){
        return res.status(400).json({
            success: false,
          message: `Not enough stock for ${product.name.substr(0,20)+'...'} ---- Available Stock: ${product.countInStock}`,
          });
      }
    }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: { currency_code: "USD", value: amount },
      },
    ],
  });

  try {
    const order = await client.execute(request);

    res.status(200).json({
        success:true,
        error:null,
         id: order.result.id 
        });
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
}

// Capture order after approval
    export const capturePayPalOrderAndCreateOrder=async(req,res)=>    {
const session = await mongoose.startSession();
    session.startTransaction();
        const userId = req.userId
        if(!userId){
            return res.status(400).json({
                success:false,
                error:true,
                message:"User not found"
            }) 
        }
        const {
  
      email,
      name,
      products,
      delivery_address,
      total,
      payment_status,
      date
    } = req.body;

        if(!email || !name ||!Array.isArray(products) || products.length === 0 || !delivery_address || !total ||  !payment_status || !date){
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

  const { orderId } = req.params;
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    const captureResult = capture.result;
    console.log("paypal capture:",captureResult)

    //create order in db 
    if(captureResult.status !== "COMPLETED"){
        return res.status(400).json({
            success:false,
            error:true,
            message:"Payment not completed"
        }) 
    }

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




const paypalAmount = captureResult.purchase_units[0].payments.captures[0].amount.value;
console.log('paypal amt',paypalAmount)



        //creating order 
           const order = await OrderModel.create([
    {
      userId:req.userId,
      name,
      email,
      payment_id:captureResult.id,
      products,
      payment_status,
      order_status: "confirmed",
      delivery_address,
      total,
      date,
      receipt: `rcpt_${Date.now()}`,
      notes: { verified: "true", method: "paypal" },
      payment_method:'paypal'
      
    }
   ],{ session });
    console.log(order)

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ success: true, order:order[0],message:"Order placed successfully via PayPal" });


    

  } catch (err) {
    console.log(err)
    await session.abortTransaction();
    session.endSession();    console.log(err)
    res.status(500).send(err);
  }
}



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

export const getAllOrdersAdmin = async(request,response)=>{
    try {
        const userId = request.userId
        if(!userId){ 
            return response.status(400).json({
                success:false,
                error:true,
                message:"User not found"
            })
        }

            const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;

        const { search, payment_method, payment_status, order_status,dateRange } = request.query;

           let filter = {};

    if (search) {
      filter.$or = [
        { payment_id: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (payment_method) filter.payment_method = payment_method;
    if (payment_status) filter.payment_status = payment_status;
    if (order_status) filter.order_status = order_status;


    if (dateRange) {
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case "today":
                startDate = new Date(now.setHours(0, 0, 0, 0));
                filter.createdAt = { $gte: startDate };
                break;

                case "lastweek":
                    startDate = new Date();
                    startDate.setDate(startDate.getDate() - 7);
                    filter.createdAt = { $gte: startDate };
                    break;
                    
                    case "lastmonth":
                        startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      filter.createdAt = { $gte: startDate };
      break;
      
      case "thisyear":
          startDate = new Date(now.getFullYear(), 0, 1); // Jan 1 of this year
          filter.createdAt = { $gte: startDate };
          break;
          
          default:
              break;
            }
        }
        const totalOrders = await OrderModel.countDocuments(filter);
        
    // Fetch paginated orders
    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
     

        return response.status(200).json({
      success: true,
      error: false,
      orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        pageSize: limit,
      },
    });
        
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            success:false,
            error:true,
            message:error.message||error
        })
        
    }
}



export const updateOrderStatus=async(req,res)=>{
    try {
        const {orderId} = req.params
        const {status} = req.body
        if(!orderId || !status){
            return res.status(400).json({
                success:false,
                error:true,
                message:"OrderId and status are required"  
            })
        }  

 

        const order = await OrderModel.findById(orderId)
        if(!order){
            return res.status(400).json({
                success:false,
                error:true,
                message:"Order not found"
            })  
        }
        order.order_status = status
        await order.save()
        return res.status(200).json({
            success:true,
            error:false,
            message:"Order status updated successfully",
            order,
            orderId
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            error:true,
            message:error.message||error
        })
        
    }
}