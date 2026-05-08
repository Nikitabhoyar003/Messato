const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" }, // Pending, Approved, Rejected, Completed
  method: { type: String, default: "Bank Transfer" },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Withdrawal", withdrawalSchema);
