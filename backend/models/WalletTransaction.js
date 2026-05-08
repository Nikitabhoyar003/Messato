const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  type: { type: String, required: true }, // e.g. "EARNING", "WITHDRAWAL", "COD_COMMISSION"
  amount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  reference_id: { type: String }, // Can be Order ID or Withdrawal ID
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);
