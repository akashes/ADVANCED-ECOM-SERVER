import express from "express";
import auth from "../middleware/auth.js";
import {
  addToCartController,
  deleteCartItemController,
  getCartItemsController,
  updateCartItemController,
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.get("/", auth, getCartItemsController);
cartRouter.post("/add-to-cart", auth, addToCartController);
cartRouter.put("/update-qty", auth, updateCartItemController);
cartRouter.delete('/delete',auth,deleteCartItemController)
//another optional route to clean entire cart
export default cartRouter;
