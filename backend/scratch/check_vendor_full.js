const mongoose = require("mongoose");
require("dotenv").config();

async function checkVendorFields() {
  await mongoose.connect(process.env.MONGODB_URL);
  const vendor = await mongoose.connection.db.collection("vendors").findOne();
  console.log("Full Vendor Document:", JSON.stringify(vendor, null, 2));
  process.exit();
}

checkVendorFields();
