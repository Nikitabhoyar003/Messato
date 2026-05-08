const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const AuditLog = require("../models/AuditLog");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

/* =====================
   ADMIN LOGIN
 ===================== */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "24h" }
    );

    return res.json({ token });

  } catch (err) {
    console.error("LOGIN ERROR:", err.message);
    return res.status(500).json({ message: "DB timeout or error" });
  }
});


/* =====================
   ADMIN LOGOUT
 ===================== */
router.post("/logout", async (req, res) => {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);

      await AuditLog.create({
        admin_id: decoded.id,
        entity: "admin",
        action: "logout",
        description: "Admin logged out",
        ip_address: req.ip
      });
    } catch {}
  }

  res.json({ success: true });
});

router.get("/health/db", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      res.json({ db: "OK" });
    } else {
      res.status(500).json({ db: "DOWN" });
    }
  } catch (err) {
    res.status(500).json({ db: "DOWN" });
  }
});


module.exports = router;
