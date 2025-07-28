import CartProductModel from "../models/cartProduct.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

//add item to cart
export const addToCartController = async (request, response) => {
  try {
    const { productId, quantity = 1 } = request.body;
    const userId = request.userId;

    // Validate required fields
    if (!productId || !userId) {
      return response.status(400).json({
        success: false,
        message: "Product ID and User ID are required",
      });
    }

    // Optionally check if product exists in DB
    const productExists = await ProductModel.findById(productId);
    if (!productExists) {
      return response.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    //check if that much stock is available
    if (productExists.countInStock < quantity) {
      return response.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Check if the product is already in the cart for this user
    // const existingCartItem = await CartProductModel.findOne({ productId, userId });

    // if (existingCartItem) {
    //     // Update quantity
    //     existingCartItem.quantity += quantity;
    //     await existingCartItem.save();
    //     return response.status(200).json({
    //         success: true,
    //         message: "Product quantity updated in cart",
    //         cartItem: existingCartItem,
    //     });
    // }
  

    // Add new item to cart
    const newCartItem = await CartProductModel.create({
      productId,
      quantity,
      userId,
    });
    //also update the user's shopping cart
    const updateUserCart = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { shopping_cart: newCartItem._id } },
      // { $push: { shopping_cart: productId } },
      { new: true }
    );

    return response.status(201).json({
      success: true,
      message: "Product added to cart",
      cartItem: newCartItem,
      userCart: updateUserCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//get cart items
export const getCartItemsController = async (request, response) => {
  try {
    const userId = request.userId;

    // Validate user ID
    if (!userId) {
      return response.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch cart items for the user
    const cartItems = await CartProductModel.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 })
      .lean();

    return response.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      cartItems,
    });
  } catch (error) {
    console.error("Get cart items error:", error);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//update cart item
export const updateCartItemController = async (request, response) => {
  try {
    const { cartItemId, quantity } = request.body;
    const userId = request.userId;

    // Validate required fields
    if (!cartItemId || !quantity || !userId) {
      return response.status(400).json({
        success: false,
        message: "Cart item ID, quantity, and User ID are required",
      });
    }

    // Find the cart item
    const cartItem = await CartProductModel.findOne({
      _id: cartItemId,
      userId,
    });
    if (!cartItem) {
      return response.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    //check if stock is available
    const product = await ProductModel.findById(cartItem.productId);
    if (product.countInStock < quantity) {
      return response.status(400).json({
        success: false,
        message: "Not enough stock available",
      });
    }

    // Update the quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    return response.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cartItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

//delete cart item
export const deleteCartItemController = async (request, response) => {
  try {
    const { cartItemId } = request.body;
    const userId = request.userId;

    // Validate required fields
    if (!cartItemId || !userId) {
      return response.status(400).json({
        success: false,
        message: "Cart item ID and User ID are required",
      });
    }

    // Find the cart item
    const cartItem = await CartProductModel.findOne({
      _id: cartItemId,
      userId,
    });
    if (!cartItem) {
      return response.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Delete the cart item
    await cartItem.deleteOne();
    //removing cart item from user's shopping cart
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { shopping_cart: cartItemId },
    });

    return response.status(200).json({
      success: true,
      message: "Cart item deleted successfully",
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return response.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};
