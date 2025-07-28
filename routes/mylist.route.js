import express from 'express'
import { addToMyListController, deleteFromMyListController, getMyListController } from '../controllers/mylist.controller.js'
import auth from '../middleware/auth.js'

const myListRouter = express.Router()


myListRouter.post('/add-to-mylist',auth,addToMyListController)
myListRouter.delete('/delete-item/:myListId',auth,deleteFromMyListController)
myListRouter.get('/', auth, getMyListController);
export default myListRouter