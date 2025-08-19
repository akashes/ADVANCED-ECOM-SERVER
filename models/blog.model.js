import mongoose from "mongoose";


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    blogImage: {
        url:{
            type:String,
            required:true
        },
        public_id: {
            type: String,
            required: true
        }
    }
},{timestamps:true  })

const BlogModel = mongoose.model('Blog', blogSchema)

export default BlogModel