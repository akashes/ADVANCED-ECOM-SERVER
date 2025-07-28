import mongoose from "mongoose";

const cartProductSchema= new mongoose.Schema({
    productId:{
        type:mongoose.Schema.ObjectId,
        required:[true,'Product is required'],
        ref:'Product'
    },
 
    quantity:{
        type:Number,
        default:1
    },
       userId:{
        type:mongoose.Schema.ObjectId,
        required:[true,'User is required'],
        ref:'User'
    }

},{timestamps:true})
// cartProductSchema.index({ productId: 1, userId: 1 }, { unique: true });

const CartProductModel = mongoose.model('CartProduct',cartProductSchema)
export default CartProductModel