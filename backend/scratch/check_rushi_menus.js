const mongoose = require("mongoose");
require("dotenv").config();

async function checkRushiMenu() {
  await mongoose.connect(process.env.MONGODB_URL);
  const rushi = await mongoose.connection.db.collection("vendors").findOne({ shop_name: "Rushi" });
  if (!rushi) {
      console.log("Rushi vendor not found");
      process.exit();
  }
  const menus = await mongoose.connection.db.collection("menus").find({ vendor_id: rushi._id }).toArray();
  console.log("Rushi Menus Count:", menus.length);
  console.log("Rushi Menus:", JSON.stringify(menus, null, 2));
  process.exit();
}

checkRushiMenu();
