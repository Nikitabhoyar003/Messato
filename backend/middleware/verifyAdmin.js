// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Admin token required" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== "admin") {
//       return res.status(403).json({ message: "Admin access only" });
//     }

//     req.admin = decoded;
//     next();
//   } catch (err) {
//     console.error("verifyAdmin error:", err.message);
//     return res.status(401).json({ message: "Invalid admin token" });
//   }
// };


const verifyToken = require("../middleware/verifytoken");
const verifyAdmin = require("../middleware/verifyAdmin");

router.post("/login", loginAdmin);

router.get(
  "/dashboard",
  verifyToken,
  verifyAdmin,
  adminDashboardController
);