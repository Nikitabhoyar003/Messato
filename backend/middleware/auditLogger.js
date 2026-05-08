const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId },
  entity: { type: String },
  entity_id: { type: String },
  action: { type: String },
  description: { type: String },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

module.exports = (options) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      try {
        if (res.statusCode >= 400) return;
        const adminId = req.user?.id;
        if (!adminId) return;

        const entity = options.entity || null;
        const action = options.action || null;
        const description = options.description || null;
        let entityId = null;
        if (typeof options.getEntityId === "function") {
          entityId = options.getEntityId(req) ?? null;
        }

        await AuditLog.create({ admin_id: adminId, entity, entity_id: entityId, action, description, ip_address: req.ip });
      } catch (err) {
        console.error("❌ AUDIT LOG ERROR:", err.message);
      }
    });
    next();
  };
};
