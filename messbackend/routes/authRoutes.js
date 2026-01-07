const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyUser } = require("../middlewares/authMiddleware");

router.post("/login", authController.login);

// User dashboard API
router.get("/user/dashboard", verifyUser("user"), (req, res) => {
  res.json({
    message: "Welcome to User Dashboard",
    userId: req.user.id
  });
});

module.exports = router;
