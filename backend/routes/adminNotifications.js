const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyUser } = require("../middleware/authMiddleware");

// Create a simple AdminNotification model inline if not already a separate file
const adminNotificationSchema = new mongoose.Schema({
  title: { type: String },
  message: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

const AdminNotification = mongoose.models.AdminNotification ||
  mongoose.model("AdminNotification", adminNotificationSchema);

/* =========================
   GET ALL NOTIFICATIONS
========================= */
router.get("/", verifyUser("admin"), async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ created_at: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    console.error("Notification fetch error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   UNREAD COUNT
========================= */
router.get("/count", verifyUser("admin"), async (req, res) => {
  try {
    const count = await AdminNotification.countDocuments({ is_read: false });
    res.json({ count });
  } catch (err) {
    console.error("NOTIFICATION COUNT ERROR:", err.message);
    res.status(500).json({ message: "Notification count failed" });
  }
});

/* =========================
   MARK AS READ
========================= */
router.put("/:id/read", verifyUser("admin"), async (req, res) => {
  try {
    await AdminNotification.findByIdAndUpdate(req.params.id, { is_read: true });
    res.json({ success: true });
  } catch (err) {
    console.error("Notification read error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
