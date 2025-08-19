import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from './config/connectDB.js'
connectDB()
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import userRouter from './routes/user.route.js'
import categoryRouter from './routes/category.route.js'
import productRouter from './routes/product.route.js'
import cartRouter from './routes/cart.route.js'
import myListRouter from './routes/mylist.route.js'
import addressRouter from './routes/address.route.js'
import homeSlidesRouter from './routes/homeSlides.route.js'
import bannerV1Router from './routes/bannerV1.route.js'
import blogRouter from './routes/blog.route.js'


 
const app = express()
app.use(cors({
    origin:['http://localhost:5174','http://localhost:5173','http://localhost:5175'],
    credentials:true
}))
// app.options('/*',cors())  // cors will manage this by default, but  if any cors errors occurs try uncommenting this 
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy:false

}))

const PORT = process.env.PORT || 8080


app.get('/',(req,res)=>{
    res.send('hai how are you')
})

app.use('/api/user',userRouter)
app.use('/api/category',categoryRouter)
app.use('/api/product', productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/myList',myListRouter)
app.use('/api/address',addressRouter)
app.use('/api/homeSlides',homeSlidesRouter) 
app.use('/api/bannerV1',bannerV1Router) 
app.use('/api/blog',blogRouter) 

 

app.use((err, req, res, next) => {
  console.error("Error middleware:", err);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})
