import mongoose from "mongoose";

const homeSlideSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    },
    { timestamps: true }
);

const HomeSlidesModel  = mongoose.model('HomeSlides', homeSlideSchema);

export default HomeSlidesModel 