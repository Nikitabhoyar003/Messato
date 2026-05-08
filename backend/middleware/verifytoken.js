const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  try {

    /* =========================
       GET AUTH HEADER
    ========================= */
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER 👉", authHeader);

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    /* =========================
       CHECK FORMAT
    ========================= */
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      });
    }

    /* =========================
       EXTRACT TOKEN
    ========================= */
    const token = authHeader.split(" ")[1];

    console.log("TOKEN 👉", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing"
      });
    }

    /* =========================
       VERIFY JWT
    ========================= */
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED JWT 👉", decoded);

    /* =========================
       UNIVERSAL AUTH OBJECT
    ========================= */
    req.auth = {
      id: decoded.id,
      role: decoded.role,
    };

    /* =========================
       OLD USER SUPPORT
    ========================= */
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    /* =========================
       VENDOR SUPPORT
    ========================= */
    req.vendor = {
      id: decoded.id,
      role: decoded.role,
    };

    /* =========================
       NEXT
    ========================= */
    next();

  } catch (err) {

    console.error("❌ JWT VERIFY ERROR 👉", err);

    /* =========================
       TOKEN EXPIRED
    ========================= */
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    /* =========================
       INVALID TOKEN
    ========================= */
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    /* =========================
       DEFAULT ERROR
    ========================= */
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });

  }

};

module.exports = verifyToken;