const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { verifyUser } = require("../middleware/authMiddleware");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* =========================
   REVENUE CHART
========================= */
router.get("/revenue", verifyUser("admin"), async (req, res) => {
  try {
    const { type } = req.query;
    const paidFilter = { payment_status: { $in: ["paid", "Paid"] } };

    if (type === "weekly") {
      const data = await Order.aggregate([
        { $match: paidFilter },
        { $group: { _id: { dayOfWeek: { $dayOfWeek: "$created_at" } }, value: { $sum: "$total_amount" } } }
      ]);

      const result = DAYS.map((label, i) => {
        const found = data.find(d => d._id.dayOfWeek === i + 1);
        return { ord: i + 1, label, value: found?.value || 0 };
      });
      return res.json(result);
    }

    if (type === "monthly") {
      const data = await Order.aggregate([
        { $match: paidFilter },
        { $group: { _id: { month: { $month: "$created_at" } }, value: { $sum: "$total_amount" } } }
      ]);

      const result = MONTHS.map((label, i) => {
        const found = data.find(d => d._id.month === i + 1);
        return { ord: i + 1, label, value: found?.value || 0 };
      });
      return res.json(result);
    }

    if (type === "daily") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const data = await Order.aggregate([
        { $match: { ...paidFilter, created_at: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            value: { $sum: "$total_amount" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      const result = data.map(d => ({ label: d._id, value: d.value }));
      return res.json(result);
    }

    res.status(400).json({ error: "Invalid chart type. Use weekly, monthly, or daily." });

  } catch (err) {
    console.error("Chart revenue error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================
   ORDERS CHART (WEEKLY)
========================= */
router.get("/orders", verifyUser("admin"), async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: { dayOfWeek: { $dayOfWeek: "$created_at" } }, value: { $sum: 1 } } }
    ]);

    const result = DAYS.map((label, i) => {
      const found = data.find(d => d._id.dayOfWeek === i + 1);
      return { ord: i + 1, label, value: found?.value || 0 };
    });

    res.json(result);
  } catch (err) {
    console.error("Chart orders error:", err);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
