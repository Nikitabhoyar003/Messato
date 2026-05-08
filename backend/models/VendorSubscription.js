const mongoose = require("mongoose");

const vendorSubscriptionSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VendorSubscription", vendorSubscriptionSchema);
