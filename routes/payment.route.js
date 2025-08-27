

import express from 'express'
import { cashOnDelivery, createOrder, getOrders, verifyPaymentAndCreateOrder } from '../controllers/payment.controller.js'
import auth from '../middleware/auth.js'

const paymentRouter  = new express.Router()

paymentRouter.post('/create-order',auth,createOrder)
paymentRouter.post('/verify',auth,verifyPaymentAndCreateOrder)

paymentRouter.get('/get-orders',auth,getOrders)
// paymentRouter.get('/get-key',sendApiKey)

paymentRouter.post('/cash-on-delivery',auth,cashOnDelivery)

export default paymentRouter