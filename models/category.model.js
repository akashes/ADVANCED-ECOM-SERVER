import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Category name is required'],
        trim:true,
        maxLength:[50,'Category name should not exceed 50 characters'],
        unique:true
    },
    slug:{
        type:String,
        unique:true,
        lowercase:true,
    },
    description:{
        type:String,
        trim:true,
        maxLength:[500,'Description should not exceed 500 characters']
    },
    images:[
        {
            url:{
                type:String,
            },
            public_id:{
                type:String,
            }
        }
    ],
    parentCatName:{
        type:String
    },
    parentCatId:{
        type:mongoose.Schema.ObjectId,
        ref:'Category',
        default:null
    },
    isActive:{
        type:Boolean,
        default:true
    }

},{timestamps:true});

const CategoryModel = mongoose.model('Category', categorySchema);
export default CategoryModel;