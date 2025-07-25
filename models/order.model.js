import mongoose, { mongo } from "mongoose";


const orderModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    orderId:{
        type:String,
        required:[true,'Order id is required'],
        unique:true
    },
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:'Product'
    },
    product_details:{
        name:String,
        image:Array
    },
    paymentId:{
        type:String,
        default:""
    },
    payment_status:{
        type:String,
        default:""
    },
    delivery_address:{
        type:mongoose.Schema.ObjectId,
        ref:'Address'

    },
    subTotalAmt:{
        type:Number,
        default:0
    },
    totalAmt:{
        type:Number,
        default:0
    },
  
  

},{timestamps:true})


const OrderModel = mongoose.model('Order',orderModel)
export default OrderModel