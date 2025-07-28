import MyListModel from "../models/myList.model.js";
import ProductModel from "../models/product.model.js";



//add to myList
export const addToMyListController = async (request, response) => {

    try {
        console.log('add to myList controller called');
        const userId = request.userId;
        
        const { productId,productTitle,productImage,
            productRating,brand,price,oldPrice,discount } = request.body;

        // Validate required fields
        if (!productId || !userId || !productTitle || !productImage || !price || !oldPrice || !productRating)   {
            return response.status(400).json({
                success: false,
                message: "All fields are required",
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

        // Check if the product is already in the user's myList
        console.log('userId:', userId);
        console.log('productId:', productId);
        const existingMyList = await MyListModel.findOne({ productId, userId });
        if (existingMyList) {
            return response.status(400).json({
                success: false,
                message: "Item already in  myList",
            });
        }

        // Create a new myList entry
        const myListEntry = new MyListModel({
            productId,
            userId,
            productTitle,
            productImage,
            productRating,
            brand,
            price,
            oldPrice,
            discount
        });
        await myListEntry.save();

        return response.status(200).json({
            success: true,
            message: "Product added to myList successfully",
        }); 

        
    } catch (error) {
        console.log(error)
        return response.status(500).json({
            success: false,
            message: "Something went wrong",
            error: true
        })
    }
}

//delete from myList

export const deleteFromMyListController = async (request, response) => {
    try {
        const { myListId } = request.params;
        const userId = request.userId;

        // Validate required fields
        if (!myListId || !userId) {
            return response.status(400).json({
                success: false,
                message: "MyList ID and User ID are required",
            });
        }

        // Find the myList item
        const myListItem = await MyListModel.findOne({ _id: myListId, userId });
        if (!myListItem) {
            return response.status(404).json({
                success: false,
                message: "item not found",
            });
        }

        // Delete the myList item
        await myListItem.deleteOne();

        return response.status(200).json({
            success: true,
            message: "MyList item deleted successfully",
        });
    } catch (error) {
        console.error("Delete from myList error:", error);
        return response.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
}

export const getMyListController = async (request, response) => {
    try {
        const userId = request.userId;

        // Validate user ID
        if (!userId) {
            return response.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        // Fetch the user's myList items
        const myListItems = await MyListModel.find({ userId })

        return response.status(200).json({
            success: true,
            message: "MyList items fetched successfully",
            myListItems,
        });
    } catch (error) {
        console.error("Get myList error:", error);
        return response.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
}