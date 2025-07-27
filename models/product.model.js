import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxLength: [100, 'Product name should not exceed 100 characters']
    },
    description:{
        type: String,
        required: [true, 'Product description is required'],
        trim: true,
        maxLength: [500, 'Product description should not exceed 500 characters']
    },
    slug:{
        type: String,
        unique: true,
        lowercase: true,
    },
    images:[
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    brand:{
        type: String,
        trim: true,
        maxLength: [50, 'Brand name should not exceed 50 characters'],
        default: ''
    },
    price:{
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    oldPrice:{
        type: Number,
        default: 0,
        min: [0, 'Old price cannot be negative']
    },
    catName:{
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
    },
    category:{
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'Category ID is required']
    },
    subCat:{
        type: String,
        trim: true,
    },
    subCatId:{
        type: mongoose.Schema.ObjectId,
        default:null
    },
    thirdSubCat:{
        type: String,
        trim: true,
    },
    thirdSubCatId:{
        type: mongoose.Schema.ObjectId,
        default:null
    },

    countInStock:{
        type: Number,
        required: [true, 'Count in stock is required'],
        min: [0, 'Count in stock cannot be negative'],
        default: 0
    },
    rating:{
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    isFeatured:{
        type: Boolean,
        default: false
    },
      isDeleted:{
        type: Boolean,
        default: false
    },
    discount:{
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100']
    },

    createdBy:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Created by user ID is required']
    },
    sizes:[String],
    colors:[String],
    attributes:{
        type:Map,
        of:mongoose.Schema.Types.Mixed,
        default:{}



    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
  




})

const ProductModel = mongoose.model('Product', productSchema);
export default ProductModel;