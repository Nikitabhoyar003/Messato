const express = require("express");
const router = express.Router();
const UserNotification = require("../models/UserNotification");
const verifyToken = require("../middleware/verifytoken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.id;
    if (!userId) return res.json([]);

    const notifications = await UserNotification.find({ user_id: userId }).sort({ created_at: -1 });

    const formatted = notifications.map(n => ({
      id: n._id,
      order_id: n.order_id,
      message: n.message,
      is_read: n.is_read ? 1 : 0,
      created_at: n.created_at
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ Notification fetch error:", err);
    res.json([]);
  }
});

router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.auth?.id;
    const { id } = req.params;

    await UserNotification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_read: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Mark read error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
