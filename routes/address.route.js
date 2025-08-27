
import express from 'express'
import auth from '../middleware/auth.js'
import { addAddress, deleteAddress, getAddressController, updateAddress } from '../controllers/address.controller.js'

const addressRouter = express.Router()

addressRouter.post('/add-address',auth,addAddress)
addressRouter.get('/get-address',auth,getAddressController)
// addressRouter.put('/select-address/:addressId',auth,selectAddressController)
addressRouter.delete('/delete-address/:addressId',auth,deleteAddress)
addressRouter.put('/:id',auth,updateAddress)




export default addressRouter