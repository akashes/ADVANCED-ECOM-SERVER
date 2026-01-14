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
 

import {razorpayInstance,paypalClient} from './config/payment.config.js'
import paymentRouter from './routes/payment.route.js'
import orderRouter from './routes/order.route.js'
import adminRouter from './routes/admin.route.js'
import errorHandler from './middleware/error.js'




const allowedOrigins = [
  process.env.USER_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
 
].filter(Boolean)

const app = express()
const server = http.createServer(app)

//socket setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

connectDB(io)


app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin 
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// app.options('/*',cors())  // cors will manage this by default, but  if any cors errors occurs try uncommenting this  
app.use(express.json())
app.use(cookieParser())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet({
    crossOriginResourcePolicy:false

}))

const PORT = process.env.PORT || 8080


app.get('/',(req,res)=>{
    res.send('ecom app working fine')
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

 

// app.use((err, req, res, next) => {
// logger.error(`${req.method} ${req.url} - ${err.message} \nStack: ${err.stack}`);  res.status(500).json({ error: "Something went wrong" });
// const status = err.statusCode || 500;
//     res.status(status).json({
//         success: false,
//         message: err.message || "Internal Server Error",
//     });});

//404 handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, error: "Route not found" });
});
app.use(errorHandler)


process.on('unhandledRejection', (err) => {
    console.error(` ${err.message}`);
    // server.close(() => process.exit(1)); // 
});

process.on('uncaughtException', (err) => {
    console.error(` ${err.message}`);
    process.exit(1); 
});
// app.listen(PORT,()=>{
//     console.log(`server is running on ${PORT}`)
// }) 
server.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
}) 
