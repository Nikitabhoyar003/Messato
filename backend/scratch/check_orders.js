const mongoose = require("mongoose");
const Order = require("../models/Order");
require("dotenv").config();

async function checkOrders() {
  await mongoose.connect(process.env.MONGODB_URL);
  const orders = await Order.find().limit(5);
  console.log("Latest Orders:", JSON.stringify(orders, null, 2));
  process.exit();
}

checkOrders();
