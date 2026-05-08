const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  payment_id: { type: String }, // Razorpay payment ID
  txn_id: { type: String },
  customer_name: { type: String },
  amount: { type: Number, required: true },
  vendor_earning: { type: Number },
  admin_commission: { type: Number },
  payment_method: { type: String },
  payment_mode: { type: String },
  payment_status: { type: String, default: "Pending" },
  delivery_status: { type: String, default: "Pending" },
  address: { type: String },
  paid_at: { type: Date },
  order_time: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", paymentSchema);
