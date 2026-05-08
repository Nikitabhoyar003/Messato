const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyUser } = require("../middleware/authMiddleware");

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId },
  entity: { type: String },
  action: { type: String },
  description: { type: String },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

router.get("/", verifyUser("admin"), async (req, res) => {
  const { entity } = req.query;
  const allowedEntities = ["admin", "user", "vendor"];

  if (!allowedEntities.includes(entity)) {
    return res.status(400).json({ message: "Invalid entity type" });
  }

  try {
    const logs = await AuditLog.find({ entity })
      .sort({ created_at: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    console.error("AUDIT ERROR:", err);
    res.status(500).json({ message: "Audit fetch failed" });
  }
});

module.exports = router;
