const AuditLog = require("../models/AuditLog");

const auditLog = ({ entity, action, description = "", getEntityId }) => {
  return (req, res, next) => {
    res.on("finish", async () => {
      if (!req.user) return;
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      try {
        const entityId = getEntityId ? getEntityId(req) : null;

        await AuditLog.create({
          admin_id: req.user.id,
          entity,
          entity_id: entityId,
          action,
          description,
          ip_address: req.ip
        });
      } catch (err) {
        console.error("❌ Audit Log Error:", err);
      }
    });

    next();
  };
};

module.exports = auditLog;
