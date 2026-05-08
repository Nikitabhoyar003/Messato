const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  shop_name: { type: String, required: true },
  owner_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  city: { type: String },
  area: { type: String },
  status: { type: String, enum: ["incomplete", "pending", "approved", "rejected"], default: "incomplete" },
  is_active: { type: Boolean, default: true },
  reject_reason: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Vendor", vendorSchema);
