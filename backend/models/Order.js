const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  menu_id: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  order_id: { type: String }, // Custom order ID if needed
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  customer_name: { type: String },
  items: [orderItemSchema], // Embedded items
  total_amount: { type: Number, required: true },
  item_total: { type: Number },
  delivery_charge: { type: Number, default: 0 },
  handling_charge: { type: Number, default: 0 },
  gst_amount: { type: Number, default: 0 },
  vendor_earning: { type: Number },
  admin_commission: { type: Number },
  meal_time: { type: String },
  address: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  order_date: { type: Date },
  payment_method: { type: String, default: "COD" },
  payment_status: { type: String, default: "Pending" },
  status: { type: String, default: "Pending" },
  cancel_reason: { type: String },
  razorpay_payment_id: { type: String },
  order_type: { type: String, enum: ["One-Time", "Subscription"], default: "One-Time" },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  settlement_date: { type: Date },
  settlement_status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Order", orderSchema);
