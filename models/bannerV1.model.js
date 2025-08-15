import mongoose from "mongoose";


const bannerV1Schema = new mongoose.Schema({
    title:{
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxLength: [100, 'Title should not exceed 100 characters']
    },
    bannerImage:{
        url:{
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }

    },
    category:{
        type:String,
        default:'',
        required:true
    },
    subCatId:{
        type:String,
        default:'',
        
    },
    thirdSubCatId:{
           type:String,
        default:'',

    },
    product:{
        type:String,
        default:'',
    },
    price:{
        type:Number,
        required:true
    },
    alignInfo:{
        type:String,
        required:true
    }
   
}, { timestamps: true });


const BannerV1Model = mongoose.model('BannerV1', bannerV1Schema);
export default BannerV1Model