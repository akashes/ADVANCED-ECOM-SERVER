import OrderModel from "../models/order.model.js";
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";

export const getRevenue = async (req, res) => {
  try {
    const { view } = req.query;
    console.log(view);

    let groupStage = {};
    let projectStage = {};

    if (view === "week") {
      groupStage = {
        _id: { $dayOfWeek: "$createdAt" }, 
        totalRevenue: { $sum: "$total" }
      };
      console.log(groupStage)

      projectStage = {
        name: {
          $arrayElemAt: [
            [
              "", // index 0 dummy because days start at 1
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            "$_id"
          ]
        },
        revenue: "$totalRevenue"
      };
    }  else if (view === "month") {
  groupStage = {
    _id: {
      month: { $month: "$createdAt" },
      weekOfMonth: {
        $ceil: { $divide: [{ $subtract: [{ $dayOfMonth: "$createdAt" }, 1] }, 7] }
      }
    },
    totalRevenue: { $sum: "$total" }
  };

  projectStage = {
    name: {
      $concat: [
        "Week ",
        { $toString: "$_id.weekOfMonth" },
        " (",
        {
          $arrayElemAt: [
            [
              "",
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ],
            "$_id.month"
          ]
        },
        ")"
      ]
    },
    revenue: "$totalRevenue"
  };
}
 else {
      // Default (yearly → month names)
      groupStage = {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$total" }
      };

      projectStage = {
        name: {
          $arrayElemAt: [
            [
              "",
              "Jan","Feb","Mar","Apr","May","Jun",
              "Jul","Aug","Sep","Oct","Nov","Dec"
            ],
            "$_id"
          ]
        },
        revenue: "$totalRevenue"
      };
    }

    const data = await OrderModel.aggregate([
      { $match: { payment_status: "paid" } }, // only paid orders count
      { $group: groupStage },
      { $project: projectStage },
      { $sort: { _id: 1 } }
    ]);

    console.log(data);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Revenue fetch failed" });
  }
};


export const getOrderTrackingDetails=async(req,res)=>{
  console.log('inside order trackingg')
   try {
    const { orderId } = req.params;
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
     order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}


export const markOrderAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only COD 
    if (order.payment_method !== "cod") {
      return res.status(400).json({ success: false, message: "Only COD orders can be marked as paid" });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({ success: false, message: "Order already marked as paid" });
    }

    if(order.order_status==='cancel-requested'){
            return res.status(400).json({ success: false, message: "Order is already requested for cancellation" });


    }
    if(order.order_status==='cancelled'){
            return res.status(400).json({ success: false, message: "Order is already cancelled" });


    }

    order.payment_status = "paid";
    await order.save();

    res.json({ 
      success: true, message: "Order marked as paid", order });
  } catch (error) {
    res.status(500).json({ 
      success: false, message: "Server error", error: error.message });
  }
};
export const markRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderModel.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Only COD 
    if (order.payment_method !== "cod") {
      return res.status(400).json({ success: false, message: "Only COD orders can be marked as paid" });
    }

    // if (order.payment_status === "paid") {
    //   return res.status(400).json({ success: false, message: "Order already marked as paid" });
    // }

    order.order_status = "refunded";
    await order.save();

    res.json({ 
      success: true, message: "Order marked as paid", order });
  } catch (error) {
    res.status(500).json({ 
      success: false, message: "Server error", error: error.message });
  }
};


//cancel request from user
export const cancelOrder = async (req, res) => {
  console.log(req.params)
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "OrderId is required" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // if (order.order_status === "delivered") {
    //   return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
    // }

    // Only allow for Cod
    if (order.payment_method !== "cod") {
      return;
      // restore reserved stock
      // for (let item of order.products) {
      //   const product = await ProductModel.findById(item.productId);
      //   if (product) {
      //     product.reservedStock -= item.quantity;
      //     if (product.reservedStock < 0) product.reservedStock = 0;
      //     product.countInStock += item.quantity; // return stock to old state
      //     await product.save();
      //   }
      // }
    }

    // mark order cancelled
    order.order_status = "cancel-requested";
    // if (order.payment_method === "cod") order.payment_status = "refunded"; 
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancel request send successfully",order, id:order._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};




export  const approveCancelRequest=async(req,res)=>{
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "OrderId is required" });
    }

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // if (order.order_status === "delivered") {
    //   return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });
    // }

    // Only allow for Cod
    if (order.payment_method === "cod") {
      // restore reserved stock
      for (let item of order.products) {
        const product = await ProductModel.findById(item.productId);
        if (product) {
          product.reservedStock -= item.quantity;
          if (product.reservedStock < 0) product.reservedStock = 0;
          product.countInStock += item.quantity; // return stock to old state
          await product.save();
        }
      }
    }

    // mark order cancelled
    order.order_status = "cancelled";
    // if (order.payment_method === "cod") order.payment_status = "refunded"; 
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled successfully",order, id:order._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
}