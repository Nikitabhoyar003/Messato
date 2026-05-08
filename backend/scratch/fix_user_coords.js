const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

async function fixUserCoords() {
  await mongoose.connect(process.env.MONGODB_URL);
  const result = await User.updateOne(
    { name: "Kunal" },
    { $set: { latitude: 21.1458, longitude: 79.0882 } }
  );
  console.log(`Updated ${result.modifiedCount} users.`);
  process.exit();
}

fixUserCoords();
