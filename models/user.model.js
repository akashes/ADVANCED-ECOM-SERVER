import mongoose, { mongo } from "mongoose";

const userSchema =new  mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],
        trim:true,
        maxLength:50
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        trim:true,
        minLength:6,
        select:false
    },
    avatar:{
        type:String,
        default:''
    },
    mobile:{
        type:Number,
        default:null
    },
    verify_email:{
        type:Boolean,
        default:false

    },
    last_login_date:{
        type:Date,
        default:""
    },
    status:{
        type:String,
        enum:['Active','Inactive','Suspended'],
        default:'Active'
    },
    address_details:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
            }, 
     ],
     shopping_cart:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'CartProduct'
        }
     ],
     orderHistory:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Order'
        }
     ],
    otp:{
      type:String
    },
    otpExpires:{
        type:Date

    },
     role:{
        type:String,
        enum:['USER','ADMIN'],
        default:'USER'
     }

},{timestamps:true})

const UserModel = mongoose.model('User',userSchema)
export default UserModel