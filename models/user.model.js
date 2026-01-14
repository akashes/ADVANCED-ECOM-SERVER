import mongoose, { mongo } from "mongoose";
import jwt from 'jsonwebtoken'
console.log('REFRESH_TOKEN_SECRET IN MODEL',process.env.REFRESH_TOKEN_SECRET)

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
        url:{
            type:String,
            default:""
        },
        public_id:{
            type:String,
            default:""
        }
    },
    mobile:{
        type:String,
        default:null
    },
    verify_email:{
        type:Boolean,

    },

    access_token:{
        type:String,
        default:""
    },
    refresh_token:{
        type:String,
        default:""
    },
    last_login_date:{
        type:Date,
        default:""
    },
    status:{
        type:String,
        enum:['active','inactive','suspended'],
        default:'active'
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
      type:String,
      select:false
    },
    otpExpires:{
        type:Date,
        select:false

    },
    otpAttempts:{
        type:Number,
        default:0,
        select:false
    },
     role:{
        type:[String],
        enum:['USER','ADMIN','MODERATOR','SUPER-ADMIN'],
        default:['USER']
     },
     signUpWithGoogle:{
            type:Boolean,
            default:false,
     },
     selected_address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
     },
     isDeleted:{
        type:Boolean,
        default:false
     }

},{timestamps:true})

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id:this._id,
        // name:this.name,
        // email:this.email,
        // role:this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRY})
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id: this._id,
        // name: this.name,
        // email: this.email,
        // role: this.role
    }, process.env.REFRESH_TOKEN_SECRET,
     {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

const UserModel = mongoose.model('User',userSchema)
export default UserModel 