import mongoose, { mongo } from "mongoose";


const orderModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },

    razorpay_order_id:{
        type:String,
        unique:true
    },
    razorpay_payment_id:String,

   products: [
        {
            productId: { type: mongoose.Schema.ObjectId, ref: 'Product' },
            name: String,
            image: [String],
            price: Number,
            quantity: Number,
            subtotal: Number
        }
        ],
    payment_id:{  //razorpay payment id
        type:String,
        default:""
    },
    payment_status:{ 
        type:String,
        default:""
    },
    order_status: {
  type: String,
  enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
  default: "Pending"
},
    delivery_address:{
        address_line1:{
            type:String,
            default:''
        },
        city:{
            type:String,
            default:'',

        },
       state:{
        type:String,
        default:''
    },
    country:{
        type:String,
        default:''
    },
    pincode:{
        type:String,
        
    },
    mobile:{
        type:String,
        required:true
    },
    landmark:{
        type:String,
    
    },
    address_type:{
        type:String,
         enum:['home','work','other'],
        default:'home'
    }
        
      

    },

    total:{
        type:Number,
        default:0
    },
    receipt:String,
    notes:{
        type:Map ,
        of:String
    },
    payment_method:{
        type:String,
        enum:['cod','razorpay','paypal']
    }

  

},{timestamps:true})


const OrderModel = mongoose.model('Order',orderModel)
export default OrderModel