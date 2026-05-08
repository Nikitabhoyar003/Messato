const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId },
  entity: { type: String },
  action: { type: String },
  description: { type: String },
  ip_address: { type: String },
  created_at: { type: Date, default: Date.now }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);

const adminAuditLogger = (entityName = "admin", actionName = "access") => {
  return (req, res, next) => {
    res.on("finish", async () => {
      try {
        if (res.statusCode < 200 || res.statusCode >= 400) return;
        if (!req.user || req.user.role !== "admin") return;

        const adminId = req.user.id;
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
        const description = `${req.method} ${req.originalUrl}`;

        await AuditLog.create({ admin_id: adminId, entity: entityName, action: actionName, description, ip_address: ip });
      } catch (err) {
        console.error("❌ AUDIT LOG FAIL:", err.message);
      }
    });
    next();
  };
};

module.exports = adminAuditLogger;
