const mongoose = require("mongoose");

const userSubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: "SubscriptionPlan", required: true },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserSubscription", userSubscriptionSchema);
