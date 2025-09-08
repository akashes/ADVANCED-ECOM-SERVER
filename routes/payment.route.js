

import express from 'express'
import { capturePayPalOrderAndCreateOrder, cashOnDelivery, createOrder, createPayPalOrder, getOrders, getPayPalClientKey, updateOrderStatus, verifyPaymentAndCreateOrder } from '../controllers/payment.controller.js'
import auth from '../middleware/auth.js'

const paymentRouter  = new express.Router()

paymentRouter.post('/create-order',auth,createOrder)
paymentRouter.post('/verify',auth,verifyPaymentAndCreateOrder)

paymentRouter.get('/get-orders',auth,getOrders)
// paymentRouter.get('/get-key',sendApiKey)

paymentRouter.post('/cash-on-delivery',auth,cashOnDelivery)


paymentRouter.get('/get-paypal-client-key',auth,getPayPalClientKey)
paymentRouter.post('/create-paypal-order',auth,createPayPalOrder)
paymentRouter.post('/capture-paypal-order/:orderId',auth,capturePayPalOrderAndCreateOrder)
paymentRouter.put('/update-order-status/:orderId',auth,updateOrderStatus)


export default paymentRouter