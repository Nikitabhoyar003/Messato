const mongoose = require("mongoose");
require("dotenv").config();

async function checkVendor() {
  await mongoose.connect(process.env.MONGODB_URL);
  const vendor = await mongoose.connection.db.collection("vendors").findOne();
  console.log("Vendor Status:", vendor?.status);
  console.log("Vendor ID:", vendor?._id);
  
  const menu = await mongoose.connection.db.collection("menus").findOne();
  console.log("Menu Vendor ID:", menu?.vendor_id);
  console.log("Menu Availability:", menu?.is_available);
  
  process.exit();
}

checkVendor();
