import multer from "multer";
import fs from 'fs'

const storage = multer.diskStorage({
    destination:function(req,file,cb){

        cb(null,'uploads')
    },
    filename:function(req,file,cb){
        console.log(file.originalname)
       cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};
console.log('FINISHED multer configuration');


const upload = multer({storage,fileFilter})

export default upload