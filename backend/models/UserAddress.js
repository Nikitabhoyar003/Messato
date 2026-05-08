const mongoose = require("mongoose");

const userAddressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  label: { type: String }, // Home, Office, etc.
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserAddress", userAddressSchema);
