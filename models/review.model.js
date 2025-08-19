import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    image:{
        type:String,
        default:""
    }
}, {
    timestamps: true
})

const ReviewModel = mongoose.model('Review', reviewSchema)

export default ReviewModel