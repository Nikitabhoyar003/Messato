const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const Order = require("../models/Order");
const { verifyUser } = require("../middleware/authMiddleware");

/* =============================
   📊 DASHBOARD STATS (ADMIN)
============================= */
router.get("/stats", verifyUser("admin"), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalVendors = await Vendor.countDocuments({});
    const totalOrders = await Order.countDocuments({ 
      $or: [
        { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
        { status: "Delivered" }
      ]
    });

    const revenueData = await Order.aggregate([
      { 
        $match: { 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ] 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);

    res.json({
      users: totalUsers,
      vendors: totalVendors,
      orders: totalOrders,
      revenue: revenueData[0]?.total || 0
    });
  } catch (err) {
    console.error("❌ Admin dashboard error:", err);
    res.status(500).json({ message: "Dashboard error" });
  }
});

/* =============================
   📈 MONTHLY REVENUE (CHART)
============================= */
router.get("/revenue-chart", verifyUser("admin"), async (req, res) => {
  try {
    const revenueByMonth = await Order.aggregate([
      { 
        $match: { 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ] 
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          value: { $sum: "$total_amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formatted = revenueByMonth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      label: monthNames[item._id.month - 1],
      value: item.value
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Monthly revenue error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

module.exports = router;
