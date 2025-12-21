import express from 'express';
import auth from '../middleware/auth.js';
import { approveCancelRequest, cancelOrder, getOrderTrackingDetails, getRevenue, markOrderAsPaid, markRefund } from '../controllers/order.controller.js';
import { getAllOrdersAdmin } from '../controllers/payment.controller.js';


const orderRouter = express.Router()


orderRouter.get('/get-all-orders-admin',auth,getAllOrdersAdmin)
orderRouter.get('/revenue',auth,getRevenue)
orderRouter.get('/:orderId',getOrderTrackingDetails)


orderRouter.put('/mark-paid/:id',markOrderAsPaid)
orderRouter.put('/mark-refund/:id',markRefund)

//cancel order by user
orderRouter.delete('/cancel-order/:orderId',cancelOrder)
orderRouter.put('/approve-cancel/:orderId',approveCancelRequest)

export default orderRouter 