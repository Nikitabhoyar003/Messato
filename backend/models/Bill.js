const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  bill_url: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Bill", billSchema);
