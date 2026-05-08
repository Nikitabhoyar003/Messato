const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: [String] }, // Array of image URLs
  cuisine: { type: String },
  food_type: { type: String, default: "Veg" },
  meal_type: { type: String, required: true },
  menu_date: { type: Date, required: true },
  day_of_week: { type: String },
  month_name: { type: String },
  menu_scope: { type: String, enum: ["Daily", "Weekly", "Monthly", "Everyday"], default: "Everyday" },
  latitude: { type: Number },
  longitude: { type: Number },
  is_available: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Menu", menuSchema);
