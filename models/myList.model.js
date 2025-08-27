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


},{timestamps:true})

const MyListModel = mongoose.model('MyList', myListSchema);
export default MyListModel;