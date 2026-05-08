const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();
const Order = require("../models/Order");
const { generateBillAuto } = require("./billController");

// 🔐 Validate Razorpay keys at startup
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay keys missing in .env");
}

// 🔹 Razorpay instance
const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

console.log("💳 [PaymentController] Key ID:", razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...${razorpayKeyId.slice(-4)}` : "MISSING");

// ============================
// 🔹 CREATE RAZORPAY ORDER
// ============================
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: Math.round(numericAmount * 100), // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      ...order,
      key: razorpayKeyId
    });
  } catch (err) {
    console.error("❌ Razorpay order error:", err);
    res.status(500).json({ message: "Payment order failed" });
  }
};

// ============================
// 🔹 VERIFY PAYMENT
// ============================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false });
    }

    /* 🔥 UPDATE ORDER */
    await Order.findByIdAndUpdate(order_id, {
      payment_status: "Paid",
      status: "Preparing",
      razorpay_payment_id: razorpay_payment_id
    });

    console.log("✅ Order marked as Paid:", order_id);

    /* 🔥 GENERATE BILL */
    try {
      await generateBillAuto(order_id);
      console.log("✅ Bill auto generated");
    } catch (billErr) {
      console.error("❌ Bill Generation Error:", billErr);
    }

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Verify payment error:", err);
    res.status(500).json({ success: false });
  }
};
