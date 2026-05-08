const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  entity: { type: String },
  entity_id: { type: String },
  action: { type: String },
  description: { type: String },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
