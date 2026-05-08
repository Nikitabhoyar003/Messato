const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const VendorProfile = require("../models/VendorProfile");
const mongoose = require("mongoose");

/* ===============================
   📦 GET ORDERS (ADMIN DASHBOARD)
=============================== */
router.get("/", async (req, res) => {
  try {
    let { status, from, to, search, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = {
      payment_status: { $in: ["Paid", "paid", "Success", "success"] },
      status: { $in: ["Pending", "Accepted", "Preparing", "Out for Delivery", "Arriving", "Delivered", "Cancelled"] }
    };

    if (status) {
      filter.status = status;
    }

    if (from && to) {
      filter.created_at = { $gte: new Date(from), $lte: new Date(to) };
    }

    if (search) {
      // For MongoDB, searching by name requires a join (populate) and then filtering, 
      // or using aggregations. Here we'll search by order ID or simplified name search if possible.
      // Since order ID in Mongoose is a string, we can do a partial match.
      filter.$or = [
        { _id: mongoose.isValidObjectId(search) ? search : undefined },
      ].filter(Boolean);
      
      if (filter.$or.length === 0) delete filter.$or;
    }

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const orders = await Order.find(filter)
      .populate("user_id", "name")
      .populate("vendor_id", "shop_name") // This joins with Vendor model, but shop_name is in VendorProfile
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    // If shop_name is missing (because it's in VendorProfile), we might need to fetch it separately or update the populate
    const result = await Promise.all(orders.map(async (o) => {
      const orderObj = o.toObject();
      const profile = await VendorProfile.findOne({ vendor_id: o.vendor_id });
      return {
        ...orderObj,
        id: o._id,
        user_name: o.user_id?.name || "N/A",
        vendor_name: profile?.shop_name || "N/A"
      };
    }));

    res.json({
      data: result,
      pagination: { total, page, limit, totalPages }
    });
  } catch (err) {
    console.error("❌ Orders fetch error:", err);
    res.status(500).json({ message: "Orders fetch failed" });
  }
});

/* ===============================
   ✅ VENDOR ACCEPT ORDER
=============================== */
router.put("/:id/accept", async (req, res) => {
  try {
    await Order.findOneAndUpdate(
      { _id: req.params.id, payment_status: { $in: ["Paid", "paid"] } },
      { status: "Accepted" }
    );
    res.json({ message: "Order accepted by vendor" });
  } catch (err) {
    res.status(500).json({ message: "Accept failed" });
  }
});

/* ===============================
   🚚 DELIVER ORDER
=============================== */
router.put("/:id/deliver", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: "Delivered" });
    res.json({ message: "Order delivered" });
  } catch (err) {
    res.status(500).json({ message: "Deliver failed" });
  }
});

/* ===============================
   ❌ CANCEL ORDER
=============================== */
router.put("/:id/cancel", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || reason.trim().length < 3) {
      return res.status(400).json({ message: "Cancel reason required" });
    }

    await Order.findByIdAndUpdate(req.params.id, {
      status: "Cancelled",
      cancel_reason: reason.trim()
    });
    res.json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed" });
  }
});

module.exports = router;
