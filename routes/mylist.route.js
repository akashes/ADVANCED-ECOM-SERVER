import express from 'express'
import { addToMyListController, deleteFromMyListController, getMyListController, getProductsByIds, getWishlistIds, mergeWishlist } from '../controllers/mylist.controller.js'
import auth from '../middleware/auth.js'

const myListRouter = express.Router()


myListRouter.post('/add-to-mylist/:productId',auth,addToMyListController)
myListRouter.delete('/remove-wishlist-item/:myListId',auth,deleteFromMyListController)
myListRouter.get('/',auth, getMyListController);
myListRouter.get('/ids',auth,getWishlistIds)
myListRouter.post('/by-ids',getProductsByIds)

myListRouter.post('/merge',auth,mergeWishlist)
export default myListRouter