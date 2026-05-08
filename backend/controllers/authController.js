

const User = require("../models/User");
const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

/* =================================================
   🔹 USER SIGNUP
================================================= */
exports.signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password, user_number, location, latitude, longitude } = req.body;

    if (!name || !email || !password || !user_number) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user",
      user_number,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null
    });

    return res.status(201).json({
      message: "Signup successful",
      userId: newUser._id,
    });

  } catch (err) {
    console.error("❌ SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

/* =================================================
   🔹 USER LOGIN (JWT ONLY)
================================================= */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;
    const lowerEmail = email.toLowerCase();

    /* ===============================
       CHECK VENDOR FIRST
    =============================== */
    const vendor = await Vendor.findOne({ email: lowerEmail });

    if (vendor) {
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Wrong password" });
      }

      const token = jwt.sign(
        { id: vendor._id, role: "vendor" },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "1h" }
      );

      return res.json({
        message: "Login successful",
        role: "vendor",
        token,
        vendor: {
          id: vendor._id,
          shop_name: vendor.shop_name,
          email: vendor.email,
          is_active: vendor.is_active,
        },
      });
    }

    /* ===============================
       CHECK USER
    =============================== */
    const user = await User.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.json({
      message: "Login successful",
      role: "user",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =================================================
   🔹 AUTH CHECK (JWT BASED)
================================================= */
exports.authCheck = (req, res) => {
  if (req.auth) {
    return res.json({
      authenticated: true,
      role: req.auth.role,
      id: req.auth.id,
    });
  }
  return res.status(401).json({ authenticated: false });
};

/* =================================================
   🔹 LOGOUT
================================================= */
exports.logout = (req, res) => {
  res.json({ success: true });
};