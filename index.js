import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import http from 'http'
import { Server } from 'socket.io'

import { connectDB } from './config/connectDB.js'
// connectDB()
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
 
import paypal from '@paypal/checkout-server-sdk'
 
 import Razorpay from 'razorpay'
import paymentRouter from './routes/payment.route.js'
import orderRouter from './routes/order.route.js'
import adminRouter from './routes/admin.route.js'



 export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,

}); 


let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_SECRET);
export const client = new paypal.core.PayPalHttpClient(environment);
const allowedOrigins = [
  process.env.USER_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175"
];

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: [
      process.env.USER_FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175"
    ],
    credentials: true
  }
});

connectDB(io)

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
// }));
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
app.use('/api/payment',paymentRouter) 
app.use('/api/order',orderRouter) 
app.use('/api/admin',adminRouter) 

 

app.use((err, req, res, next) => {
  console.error("Error middleware:", err);
  res.status(500).json({ error: "Something went wrong" });
});

// app.listen(PORT,()=>{
//     console.log(`server is running on ${PORT}`)
// }) 
server.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
}) 
