const mongoose = require("mongoose");

const orderTrackingSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("OrderTracking", orderTrackingSchema);
