const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const UserSubscription = require("../models/UserSubscription");
const { verifyUser } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

/* =============================
   GET USER STATS
============================= */
router.get("/stats", verifyUser("admin"), async (req, res) => {
  try {
    const total = await User.countDocuments({});
    const active = await User.countDocuments({ status: "active" });
    const blocked = await User.countDocuments({ status: "blocked" });
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newWeek = await User.countDocuments({ created_at: { $gte: sevenDaysAgo } });

    res.json({ total, active, blocked, newWeek });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =============================
   GET USERS (SEARCH + PAGINATION)
============================= */
router.get("/", verifyUser("admin"), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { user_number: new RegExp(search, "i") }
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const result = await Promise.all(users.map(async (u) => {
      const orderCount = await Order.countDocuments({ user_id: u._id });
      const subCount = await UserSubscription.countDocuments({ user_id: u._id, status: "active" });

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        user_number: u.user_number,
        status: u.status,
        block_reason: u.block_reason,
        created_at: u.created_at,
        orders: orderCount,
        subscriptions: subCount
      };
    }));

    res.json({ users: result, total });

  } catch (err) {
    console.error("Users fetch error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =============================
   BLOCK / UNBLOCK USER
============================ */
router.put("/:id/status", verifyUser("admin"), async (req, res) => {
  try {
    const { status, reason } = req.body;
    const update = { status };
    if (status === "blocked") update.block_reason = reason;
    else update.block_reason = null;

    await User.findByIdAndUpdate(req.params.id, update);
    res.json({ message: "User status updated" });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

/* =============================
   USERS DROPDOWN
============================= */
router.get("/list/simple", verifyUser("admin"), async (req, res) => {
  try {
    const users = await User.find({ status: "active" }, "name").sort({ name: 1 });
    const result = users.map(u => ({ id: u._id, name: u.name }));
    res.json(result);
  } catch (err) {
    console.error("User dropdown error:", err);
    res.status(500).json([]);
  }
});

/* =========================
   DELETE USER
========================= */
router.delete("/:id", verifyUser("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "DB error" });
  }
});

module.exports = router;
