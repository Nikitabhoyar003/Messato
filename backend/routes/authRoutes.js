const express = require("express");
const router = express.Router();


// ✅ Controller imports (MATCHING NAMES)
const {
  signup,
  login,
  logout,
  authCheck,
} = require("../controllers/authController");

// ============================
// AUTH ROUTES
// ============================

const verifyToken = require("../middleware/verifytoken");

// SIGNUP
router.post("/signup", signup);

// LOGIN
router.post("/login", login);

// AUTH CHECK
router.get("/check", verifyToken, authCheck);

// LOGOUT
router.post("/logout", logout);
router.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully" });
});




module.exports = router;
