const mongoose = require("mongoose");
require("dotenv").config();

async function checkRushiCoords() {
  await mongoose.connect(process.env.MONGODB_URL);
  const vendor = await mongoose.connection.db.collection("vendors").findOne({ shop_name: "Rushi" });
  console.log("Rushi Coords:", { lat: vendor?.latitude, lng: vendor?.longitude, status: vendor?.status });
  process.exit();
}

checkRushiCoords();
