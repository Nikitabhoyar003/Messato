const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  status: { type: String, default: "active" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);
