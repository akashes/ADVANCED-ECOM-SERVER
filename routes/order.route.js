import express from 'express';
import auth from '../middleware/auth.js';
import { getRevenue } from '../controllers/order.controller.js';
import { getAllOrdersAdmin } from '../controllers/payment.controller.js';


const orderRouter = express.Router()


orderRouter.get('/get-all-orders-admin',auth,getAllOrdersAdmin)
orderRouter.get('/revenue',auth,getRevenue)

export default orderRouter 