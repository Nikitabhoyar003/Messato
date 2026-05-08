const express = require("express");
const router = express.Router();
const axios = require("axios");

const otpStore = {};

router.post("/send-otp", (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[phone] = otp;

  console.log("OTP:", otp);
  res.json({ message: "OTP sent" });
});

router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] == otp) {
    delete otpStore[phone];
    return res.json({ message: "OTP verified" });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

module.exports = router;
