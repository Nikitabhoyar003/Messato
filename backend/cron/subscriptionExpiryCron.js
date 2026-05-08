const cron = require("node-cron");
const UserSubscription = require("../models/UserSubscription");
const VendorSubscription = require("../models/VendorSubscription");

// 🕛 DAILY CRON – runs every day at 12:05 AM
cron.schedule("5 0 * * *", async () => {
  console.log("🕛 Running subscription expiry cron...");

  const now = new Date();

  try {
    // 🔴 EXPIRE USER SUBSCRIPTIONS
    const userResult = await UserSubscription.updateMany(
      { status: "active", end_date: { $ne: null, $lt: now } },
      { status: "expired" }
    );
    console.log(`✅ User subscriptions expired: ${userResult.modifiedCount}`);

    // 🔴 EXPIRE VENDOR SUBSCRIPTIONS
    const vendorResult = await VendorSubscription.updateMany(
      { status: "active", end_date: { $ne: null, $lt: now } },
      { status: "expired" }
    );
    console.log(`✅ Vendor subscriptions expired: ${vendorResult.modifiedCount}`);

  } catch (err) {
    console.error("❌ Subscription expiry cron error:", err);
  }
});

module.exports = cron;
