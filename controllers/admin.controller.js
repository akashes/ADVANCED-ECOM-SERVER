import CategoryModel from "../models/category.model.js";
import OrderModel from "../models/order.model.js";
import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

const getDateRange = (period) => {
  const now = new Date();
  let start;

  switch (period) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "lastWeek":
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case "lastMonth":
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "thisYear":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = null;
  }
  return start;
};

export const getDashboardStats = async (req, res) => {
  try {
    const ranges = ["today", "lastWeek", "lastMonth", "thisYear"];

    // Orders
    const orderStats = {};
    for (let r of ranges) {
      const start = getDateRange(r);
      orderStats[r] = await OrderModel.countDocuments(
        start ? { createdAt: { $gte: start } } : {}
      );
    }

    // Users
    const userStats = {};
    for (let r of ranges) {
      const start = getDateRange(r);
      userStats[r] = await UserModel.countDocuments(
        start ? { createdAt: { $gte: start } } : {}
      );
    }

    // Products
    const productStats = {};
    for (let r of ranges) {
      const start = getDateRange(r);
      productStats[r] = await ProductModel.countDocuments(
        start ? { createdAt: { $gte: start } } : {}
      );
    }

    // Categories
    const categoryStats = {};
    for (let r of ranges) {
      const start = getDateRange(r);
      categoryStats[r] = await CategoryModel.countDocuments(
        start ? { createdAt: { $gte: start } } : {}
      );
    }

    res.json({
      success: true,
      data: { 
        orders: orderStats,
        users: userStats,
        products: productStats,
        categories: categoryStats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 