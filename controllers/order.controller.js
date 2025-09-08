import OrderModel from "../models/order.model.js";
import mongoose from "mongoose";

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
