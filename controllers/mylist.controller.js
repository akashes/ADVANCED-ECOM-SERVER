import MyListModel from "../models/myList.model.js";
import ProductModel from "../models/product.model.js";



//add to myList
export const addToMyListController = async (request, response) => {

    try {
        console.log('add to myList controller called');
        const userId = request.userId;
        const productId=request.params.productId
        
   

        // Validate required fields
        if (!productId)   {
            return response.status(400).json({
                success: false,
                message: "Product Id is required",
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

        const existingMyList = await MyListModel.findOne({ productId, userId });
        if (existingMyList) {
            return response.status(400).json({
                success: false,
                message: "Item already in  myList",
            });
        }

        // Create a new myList entry
    
        const myList= await MyListModel.create({
            productId,userId
        })
        let updatedMyList = await myList.populate('productId')

        return response.status(200).json({
            success: true,
            message: "Product added to myList successfully",
            item:updatedMyList
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
        console.log('inside')
        console.log(myListId)
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
            itemId:myListId
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
        const myListItems = await MyListModel.find({ userId }).populate('productId')


        return response.status(200).json({
            success: true,
            message: "MyList items fetched successfully",
            items:myListItems,
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



export const getWishlistIds = async (req, res) => {
  try {
    const userId = req.userId 
    if(!userId){
        return res.status(400).json({
            success:false,
            error:true,
            message:"User not found"
        })
    }

    const wishlist = await MyListModel.findOne({ userId }).select("productId");
    console.log(wishlist)

    if (!wishlist) {
      return res.json(

        {
            success:false,
            error:true,
             productIds: [] 

        }
    ); 
    }

    res.json({
         productIds: wishlist.productId
         });
  } catch (error) {
    res.status(500).json({ 
        success:false,
        error:true,
        message: "Server error"
     });
  }
};



export const mergeWishlist = async (req, res) => {
  try {
    const userId = req.userId
    const { productIds } = req.body; 

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "No product IDs provided" });
    }

    // Get existing wishlist productIds for this user
    const existingItems = await MyListModel.find({ userId }).select("productId");
    console.log(existingItems)
    const existingProductIds = existingItems.map(item => item.productId.toString());
    console.log(existingProductIds)

    // Filter out already existing products
    const newProductIds = productIds.filter(
      pid => !existingProductIds.includes(pid.toString())
    );
 console.log(newProductIds)
    // Create new docs for the remaining productIds
    if (newProductIds.length > 0) {
      const newDocs = newProductIds.map(pid => ({ userId, productId: pid }));
      console.log(newDocs)
      await MyListModel.insertMany(newDocs);
    }

    // Return full merged wishlist with populated products
    const mergedWishlist = await MyListModel.find({ userId }).populate("productId");
    console.log(mergedWishlist)

    res.json({
      success: true,
      items: mergedWishlist
    });

  } catch (error) {
    console.error("Merge wishlist error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body; // array of productIds
    const products = await ProductModel.find({ _id: { $in: ids } })
      .select("name price oldPrice discount brand  images");

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
