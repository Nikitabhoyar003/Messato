const mongoose = require("mongoose");
const Vendor = require("../models/Vendor");
require("dotenv").config();

async function approveVendors() {
  await mongoose.connect(process.env.MONGODB_URL);
  const result = await Vendor.updateMany({}, { status: "approved" });
  console.log(`Approved ${result.modifiedCount} vendors.`);
  process.exit();
}

approveVendors();
