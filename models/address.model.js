import mongoose from "mongoose";


const addressSchema= new mongoose.Schema({
    address_line:{
        type:String,
        required:[true,'Address is required'],
        trim:true,
        maxLength:100,
    },
    city:{
        type:String,
        default:''
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
         validate: {
      validator:  (v)=> {
        return /^[0-9]{4,10}$/.test(v); //  pin/zip validation
      },
      message: 'Please enter a valid pinCode'
    }
    }, 
    mobile:{
        type:String,
        default:null,
        validate:{
            validator: (v) => {
                return /^\+?[0-9]{10,15}$/.test(v); 
                },

            message:'Please enter a valid mobile number'
        }
    },
    status:{

        type:Boolean,
        default:true
    },
    default:{
        type:Boolean,
        default:false
    },
    selected:{
        type:Boolean,
        default:false
    },
    landmark:{
        type:String,
        default:null
    },
    address_type:{
        type:String,
        enum:['home','work','other'],
        default:'HOME'
    },

    userId:{
        type:mongoose.Schema.ObjectId,
        default:'',
        ref:'User',
        required:[true,'User is required']
    }
},{timestamps:true})

const AddressModel = mongoose.model('Address',addressSchema)
export default AddressModel