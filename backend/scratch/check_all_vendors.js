const mongoose = require("mongoose");
require("dotenv").config();

async function checkVendors() {
  await mongoose.connect(process.env.MONGODB_URL);
  const vendors = await mongoose.connection.db.collection("vendors").find().toArray();
  console.log("Vendors Status List:", vendors.map(v => ({ shop: v.shop_name, status: v.status })));
  process.exit();
}

checkVendors();
