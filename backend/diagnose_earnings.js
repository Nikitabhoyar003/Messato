const mongoose = require('mongoose');
const Order = require('./models/Order');
const WalletTransaction = require('./models/WalletTransaction');
const VendorProfile = require('./models/VendorProfile');
require('dotenv').config();

async function diagnose() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to DB");

  const vendorId = "69fcd582a1255d4189b33ef5"; // The vendor from the logs
  console.log("Diagnosing Vendor:", vendorId);

  try {
    const vId = new mongoose.Types.ObjectId(vendorId);
    
    console.log("1. Testing Wallet Stats...");
    const walletStats = await WalletTransaction.aggregate([
      { $match: { vendor_id: vId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    console.log("Wallet Stats:", walletStats);

    const revenueMatch = { 
      vendor_id: vId, 
      $or: [
        { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
        { status: "Delivered" }
      ]
    };

    console.log("2. Testing Revenue Match...");
    const totalEarnedData = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);
    console.log("Total Earned:", totalEarnedData);

    console.log("3. Testing Today's Stats...");
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayEarnedData = await Order.aggregate([
      { $match: { ...revenueMatch, created_at: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);
    console.log("Today Earned:", todayEarnedData);

    console.log("✅ Diagnostic Complete - All logic passed");
  } catch (err) {
    console.error("❌ Diagnostic Failed at:", err.message);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
  }
}

diagnose();
