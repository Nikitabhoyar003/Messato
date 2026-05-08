const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const VendorProfile = require("../models/VendorProfile");
const Menu = require("../models/Menu");
const Order = require("../models/Order");
const VendorNotification = require("../models/VendorNotification");
const { verifyUser } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");
console.log("🛠️ adminVendors.js loaded");

/* =========================
   GET ALL VENDORS (SEARCH)
========================= */
router.get("/", verifyUser("admin"), async (req, res) => {
  try {
    const q = req.query.q || "";
    
    // Find vendor profiles matching search
    const profiles = await VendorProfile.find({
      $or: [
        { shop_name: new RegExp(q, "i") },
        { owner_name: new RegExp(q, "i") },
        { location: new RegExp(q, "i") }
      ]
    });

    const vendorIds = profiles.map(p => p.vendor_id);

    // Find vendors
    const vendors = await Vendor.find({ _id: { $in: vendorIds } }).sort({ _id: -1 });

    // Aggregate counts (Menu & Orders)
    const result = await Promise.all(vendors.map(async (v) => {
      const profile = profiles.find(p => p.vendor_id.toString() === v._id.toString());
      const menuCount = await Menu.countDocuments({ vendor_id: v._id });
      const orderCount = await Order.countDocuments({ 
        vendor_id: v._id, 
        $or: [
          { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
          { status: "Delivered" }
        ]
      });

      return {
        id: v._id,
        shop_name: profile?.shop_name || "N/A",
        owner_name: profile?.owner_name || "N/A",
        phone: profile?.mobile || "N/A",
        location: profile?.location || "N/A",
        status: v.status,
        reject_reason: v.reject_reason,
        menu_count: menuCount,
        paid_orders: orderCount
      };
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Vendor fetch error:", err);
    res.status(500).json({ message: "Vendor fetch failed" });
  }
});

/* =========================
   VENDOR DROPDOWN
========================= */
router.get("/list/simple", verifyUser("admin"), async (req, res) => {
  try {
    const profiles = await VendorProfile.find({}, "vendor_id shop_name").sort({ shop_name: 1 });
    const result = profiles.map(p => ({ id: p.vendor_id, shop_name: p.shop_name }));
    res.json(result);
  } catch (err) {
    console.error("❌ Vendor dropdown error:", err);
    res.status(500).json([]);
  }
});

/* =========================
   APPROVE VENDOR
========================= */
router.post("/:id/approve", verifyUser("admin"), async (req, res) => {
  try {
    const vendorId = req.params.id;

    await Vendor.findByIdAndUpdate(vendorId, {
      status: "approved",
      reject_reason: null,
      resubmitted: false
    });

    await VendorNotification.create({
      vendor_id: vendorId,
      title: "Profile Approved ✅",
      message: "Congratulations! Your shop profile has been approved."
    });

    res.json({ message: "Vendor approved & notified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approve failed" });
  }
});

/* =========================
   UPDATE STATUS
========================= */
router.put("/:id/status", verifyUser("admin"), async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await Vendor.findByIdAndUpdate(req.params.id, {
      status,
      reject_reason: status === "rejected" ? reason || "Not specified" : null
    });

    await VendorNotification.create({
      vendor_id: req.params.id,
      title: status === "approved" ? "Vendor Approved 🎉" : "Vendor Rejected ❌",
      message: status === "approved" ? "Your vendor account has been approved." : `Rejected. Reason: ${reason}`
    });

    res.json({ success: true, status });
  } catch (err) {
    console.error("❌ Vendor status update error:", err);
    res.status(500).json({ message: "Vendor update failed" });
  }
});

/* =========================
   REJECT VENDOR
========================= */
router.post("/:id/reject", verifyUser("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reject reason required" });

    await Vendor.findByIdAndUpdate(req.params.id, {
      status: "rejected",
      reject_reason: reason,
      resubmitted: false
    });

    await VendorNotification.create({
      vendor_id: req.params.id,
      title: "Profile Rejected ❌",
      message: `Your profile was rejected. Reason: ${reason}`
    });

    res.json({ message: "Vendor rejected & notified" });
  } catch (err) {
    console.error("Reject vendor error:", err);
    res.status(500).json({ message: "Reject failed" });
  }
});

/* =========================================
   GET VENDOR MENUS
========================================= */
router.get("/:vendorId/menus", verifyUser("admin"), async (req, res) => {
  console.log("📥 FETCH VENDOR MENUS HIT:", req.params.vendorId);
  try {
    const menus = await Menu.find({ vendor_id: req.params.vendorId }).sort({ created_at: -1 });
    
    // Compatibility mapping: convert image array to string for frontend
    const formatted = menus.map(m => {
      const menuObj = m.toObject();
      const imgs = Array.isArray(menuObj.image) ? menuObj.image : (menuObj.image ? [menuObj.image] : []);
      return {
        ...menuObj,
        image: imgs[0] || "",
        images: imgs
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ ADMIN VENDOR MENUS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch menus" });
  }
});

/* =========================
   FINAL FULL VENDOR PROFILE
========================= */
router.get("/:id", verifyUser("admin"), async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    const profile = await VendorProfile.findOne({ vendor_id: req.params.id });

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const result = {
      ...vendor.toObject(),
      ...profile?.toObject(),
      id: vendor._id
    };

    res.json(result);
  } catch (err) {
    console.error("❌ Vendor detail error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =========================
   VENDOR REVENUE STATS
========================= */
router.get("/:id/stats", verifyUser("admin"), async (req, res) => {
  try {
    const vendorId = req.params.id;
    const stats = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId), 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ]
        } 
      },
      { $group: { _id: null, total_orders: { $sum: 1 }, total_revenue: { $sum: "$total_amount" } } }
    ]);

    res.json(stats[0] || { total_orders: 0, total_revenue: 0 });
  } catch (err) {
    console.error("❌ Vendor stats error:", err);
    res.status(500).json({ message: "Failed to fetch vendor stats" });
  }
});

module.exports = router;
