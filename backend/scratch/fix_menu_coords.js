const mongoose = require("mongoose");
const Menu = require("../models/Menu");
const Vendor = require("../models/Vendor");
require("dotenv").config();

async function fixMenuCoords() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  const menus = await Menu.find({ latitude: null });
  console.log(`Found ${menus.length} menus with null coordinates.`);
  
  for (const menu of menus) {
    const vendor = await Vendor.findById(menu.vendor_id);
    if (vendor && vendor.latitude && vendor.longitude) {
      menu.latitude = vendor.latitude;
      menu.longitude = vendor.longitude;
      await menu.save();
      console.log(`Fixed coords for menu: ${menu.name}`);
    }
  }
  
  process.exit();
}

fixMenuCoords();
