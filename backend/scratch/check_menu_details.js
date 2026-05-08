const mongoose = require("mongoose");
require("dotenv").config();

async function checkMenuDetails() {
  await mongoose.connect(process.env.MONGODB_URL);
  const menu = await mongoose.connection.db.collection("menus").findOne();
  console.log("Menu Details:", JSON.stringify(menu, null, 2));
  process.exit();
}

checkMenuDetails();
