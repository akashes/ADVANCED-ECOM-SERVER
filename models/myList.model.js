import mongoose from "mongoose";

const myListSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'Product is required'],
        ref: 'Product'
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        required: [true, 'User is required'],
        ref: 'User'
    },
    productTitle: {
        type: String,
        required: [true, 'Product title is required']
    },
    productImage: {
        type: String,
        required: [true, 'Product image is required']
    },

    productRating:{
        type: Number,
        default: 0,
        min: 0,
        max: 5

    },
    brand:{
        type: String,
        
    },
    price:{
        type: Number,
        required: [true, 'Product price is required']
    },
    oldPrice:{
        type: Number,
        required: [true, 'Old price is required']
    },
    discount:{
        type: Number,
        
    }

},{timestamps:true})

const MyListModel = mongoose.model('MyList', myListSchema);
export default MyListModel;