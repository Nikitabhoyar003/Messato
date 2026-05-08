const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  type: { type: String, enum: ["user", "vendor"], required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration_days: { type: Number, required: true },
  features: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
