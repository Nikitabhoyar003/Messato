const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const router = express.Router();

const Order = require("../models/Order");
const Bill = require("../models/Bill");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const { generateBillAuto } = require("../controllers/billController");

require("dotenv").config();

// ============================
// RAZORPAY INSTANCE
// ============================
const razorpayKeyId = (process.env.RAZORPAY_KEY_ID || "").trim();
const razorpayKeySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

console.log("💳 [PaymentRoutes] Key ID:", razorpayKeyId ? `${razorpayKeyId.substring(0, 8)}...${razorpayKeyId.slice(-4)}` : "MISSING");
console.log("💳 [PaymentRoutes] Key Secret:", razorpayKeySecret ? `${razorpayKeySecret.substring(0, 4)}...${razorpayKeySecret.slice(-4)}` : "MISSING");

// ============================
// CREATE RAZORPAY ORDER
// ============================
router.post("/create-order", async (req, res) => {
  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || "").trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();

    if (!keyId || !keySecret) {
      return res.status(500).json({ message: "Razorpay keys are missing on the server" });
    }

    const rzp = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    let { amount, order_id } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ message: "Order ID and amount are required" });
    }

    amount = Number(amount);
    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.payment_status === "Paid") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    const amountInPaise = Math.round(amount * 100);
    
    const razorpayOrder = await rzp.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_rcpt_${order_id}`,
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      key: keyId,
      amount: amountInPaise,
    });

  } catch (err) {
    console.error("❌ Create Razorpay order error:", err);
    
    let message = "Payment order creation failed";
    if (err.statusCode === 401) {
      message = "Razorpay Authentication Failed: Your RAZORPAY_KEY_ID or SECRET is incorrect or deactivated. Please check your dashboard.";
    }

    res.status(err.statusCode || 500).json({ 
      message, 
      error: err.message,
      code: err.error?.code 
    });
  }
});

// ============================
// VERIFY PAYMENT
// ============================
router.post("/verify", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    const order = await Order.findById(order_id).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Order not found" });
    }

    // SIGNATURE VERIFY
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // UPDATE PAYMENT
    if (order.payment_status !== "Paid") {
      order.payment_status = "Paid";
      order.status = "Preparing";
      order.razorpay_payment_id = razorpay_payment_id;
      await order.save({ session });
    }

    // CHECK EXISTING BILL
    const existingBill = await Bill.findOne({ order_id }).session(session);
    let invoiceUrl = `http://localhost:5000/bills/bill_${order_id}.pdf`;

    if (!existingBill) {
      try {
        await generateBillAuto(order_id);
        await Bill.create([{ order_id, bill_url: invoiceUrl }], { session });
      } catch (billErr) {
        console.error("⚠️ BILL GENERATION FAILED:", billErr.message);
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.json({
      message: "✅ Payment verified & order moved to Preparing",
      invoiceUrl,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ VERIFY ERROR:", err.message);
    res.status(500).json({ message: "Payment verification error", error: err.message });
  }
});

router.post("/payment-failed", async (req, res) => {
  try {
    const { order_id } = req.body;
    await Order.findOneAndUpdate(
      { _id: order_id, payment_status: "Pending" },
      { payment_status: "Failed" }
    );
    res.json({ message: "Payment marked as failed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark payment as failed" });
  }
});

router.post("/refund", async (req, res) => {
  try {
    const { payment_id, order_id, amount } = req.body;
    const refund = await razorpay.payments.refund(payment_id, { amount: amount * 100 });

    await Order.findByIdAndUpdate(order_id, {
      payment_status: "Refunded",
      refund_id: refund.id
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Refund error:", err);
    res.status(500).json({ message: "Refund failed" });
  }
});

module.exports = router;