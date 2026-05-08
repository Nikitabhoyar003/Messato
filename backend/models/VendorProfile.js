const mongoose = require("mongoose");

const vendorProfileSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true, unique: true },
  shop_name: { type: String },
  owner_name: { type: String },
  email: { type: String },
  mobile: { type: String },
  experience: { type: String },
  description: { type: String },
  profile_image: { type: String },
  location: { type: String },
  town: { type: String },
  service_radius: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  pure_veg: { type: Boolean, default: false },
  jain_food: { type: Boolean, default: false },
  satvik: { type: Boolean, default: false },
  special_diet: { type: Boolean, default: false },
  meal_type: { type: [String] }, // Array of strings for meal types
  cuisine: { type: String },
  onion_garlic: { type: String },
  operating_days: { type: String },
  fssai_number: { type: String },
  fssai_certificate: { type: String },
  gst_certificate: { type: String },
  shop_act_license: { type: String },
  aadhaar_doc: { type: String },
  pan_doc: { type: String },
  account_holder: { type: String },
  bank_name: { type: String },
  account_number: { type: String },
  ifsc_code: { type: String },
  branch_name: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VendorProfile", vendorProfileSchema);
