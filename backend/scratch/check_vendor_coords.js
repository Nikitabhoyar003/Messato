const mongoose = require("mongoose");
require("dotenv").config();

async function checkVendorCoords() {
  await mongoose.connect(process.env.MONGODB_URL);
  const vendor = await mongoose.connection.db.collection("vendors").findOne();
  console.log("Vendor Coords:", { lat: vendor?.latitude, lng: vendor?.longitude });
  process.exit();
}

checkVendorCoords();
