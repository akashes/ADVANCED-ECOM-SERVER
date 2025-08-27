import express from "express";
import auth from "../middleware/auth.js";
import {
  addToCartController,
  clearCartController,
  deleteCartItemController,
  getCartItemsController,
  updateCartItemController,
} from "../controllers/cart.controller.js";

const cartRouter = express.Router();

cartRouter.get("/", auth, getCartItemsController);
cartRouter.post("/add-to-cart/:productId", auth, addToCartController);
cartRouter.put("/update-cart", auth, updateCartItemController);
cartRouter.delete('/remove-cart-item/:cartItemId',auth,deleteCartItemController)
cartRouter.delete('/clear-cart',auth,clearCartController)
//another optional route to clean entire cart
export default cartRouter;
