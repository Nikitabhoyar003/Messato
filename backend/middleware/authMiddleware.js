const jwt = require("jsonwebtoken");

/**
 * 🔐 Hybrid Auth Middleware
 * - Checks SESSION first (browser login)
 * - Falls back to JWT (API / mobile)
 * - Supports role-based protection
 *
 * Usage:
 *   verifyUser()
 *   verifyUser("admin")
 *   verifyUser(["admin", "vendor"])
 *   verifyUser("user")
 *   verifyUser("vendor")
 */
const verifyUser = (roles = []) => {
  // normalize roles to array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    /* =========================
       🔍 DEBUG (ADD ONLY)
    ========================= */
    console.log("🔐 AuthMiddleware hit:", req.method, req.originalUrl);
    console.log("🔐 Authorization header:", req.headers.authorization);
    console.log("🔐 Session user:", req.session?.user);

    /* =========================
       🔐 1️⃣ JWT AUTH (PRIMARY)
    ========================= */
    const authHeader = req.headers.authorization;

    if (authHeader) {
      // 🔥 ROBUST TOKEN EXTRACTION (ADD)
      let token = authHeader;

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (authHeader.startsWith("bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          console.log("🔓 Decoded JWT:", decoded);

          // ✅ FLEXIBLE PAYLOAD SUPPORT
          const userId = decoded.id || decoded.userId || decoded._id;
          const role = decoded.role || "user"; // default role

          if (!userId) {
            return res.status(401).json({
              message: "Invalid token payload",
            });
          }

          if (roles.length && !roles.includes(role)) {
            return res.status(403).json({
              message: "Access denied",
            });
          }

          req.user = {
            id: userId,
            role,
            authType: "jwt",
          };

          return next();
        } catch (err) {
          console.error("❌ JWT verify failed:", err.message);
          return res.status(401).json({
            message: "Invalid or expired token",
          });
        }
      }
    }

    /* =========================
       🔐 2️⃣ SESSION AUTH (FALLBACK)
    ========================= */
    if (req.session && req.session.user) {
      const { id, role } = req.session.user;

      if (roles.length && !roles.includes(role)) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      req.user = {
        id,
        role,
        authType: "session",
      };

      return next();
    }

    /* =========================
       ❌ NOT AUTHENTICATED
    ========================= */
    console.warn("❌ Authentication failed");
    return res.status(401).json({
      message: "Not authenticated",
    });
  };
};

module.exports = { verifyUser };
