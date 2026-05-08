const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Order = require("../models/Order");
const User = require("../models/User");
const { generateBill } = require("../controllers/billController");

/* =========================
   📄 GET ALL BILLS (ADMIN)
========================= */
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: "order_id",
        populate: [
          { path: "user_id", select: "user_number phone" },
          { path: "vendor_id", select: "phone" }
        ]
      })
      .sort({ created_at: -1 });

    const Vendor = require("../models/Vendor"); // Ensure Vendor model is available

    const formatted = await Promise.all(bills.map(async b => {
      const order = b.order_id;
      let user = order?.user_id;
      const vendor = order?.vendor_id;
      
      // 🕵️ EXTRA CHECK: If user is null but user_id exists, it might be a Vendor ID
      if (!user && order?.user_id) {
        // We can't use population easily if ref is fixed, so we fetch manually
        try {
          const vendorAsUser = await Vendor.findById(order.user_id).select("phone");
          if (vendorAsUser) {
             user = { user_number: vendorAsUser.phone };
          }
        } catch (e) {}
      }

      const phoneNumber = user?.user_number || user?.phone || vendor?.phone || "N/A";

      return {
        id: b._id,
        order_id: order?._id,
        total_amount: order?.total_amount,
        bill_url: b.bill_url,
        phone: phoneNumber
      };
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch Bills Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   🧾 GENERATE BILL
========================= */
router.post("/generate/:orderId", generateBill);

/* =========================
   📊 BILL SUMMARY
========================= */
router.get("/summary", async (req, res) => {
  try {
    const revenueData = await Order.aggregate([
      { $match: { payment_status: { $in: ["Paid", "paid", "Completed", "Success"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total_amount" } } }
    ]);

    const totalBills = await Bill.countDocuments({});

    res.json({
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      totalBills
    });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
