require("dotenv").config({ path: "./.env" });
const { connectDB } = require("../config/db");
const AppConfig = require("../models/AppConfig");

const seedConfig = async () => {
  try {
    await connectDB();
    
    const configs = [
      { key: "delivery_charge", value: 30 },
      { key: "handling_charge", value: 10 },
      { key: "gst_percent", value: 5 }
    ];

    for (const config of configs) {
      await AppConfig.findOneAndUpdate(
        { key: config.key },
        config,
        { upsert: true }
      );
    }

    console.log("✅ AppConfig seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedConfig();
