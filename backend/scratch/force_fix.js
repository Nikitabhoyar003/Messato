const mongoose = require("mongoose");
const Menu = require("../models/Menu");
require("dotenv").config();

async function fixDatesAndCoords() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  // Set all menus to today and use Kunal's coords for testing
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const result = await Menu.updateMany({}, { 
    $set: { 
      menu_date: today,
      latitude: 21.1458,
      longitude: 79.0882
    } 
  });
  
  console.log(`Updated ${result.modifiedCount} menus.`);
  process.exit();
}

fixDatesAndCoords();
