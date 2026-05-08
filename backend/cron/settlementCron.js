const Order = require("../models/Order");
const WalletTransaction = require("../models/WalletTransaction");

const runSettlement = async () => {
  try {
    console.log("⏳ Running settlement job...");

    const now = new Date();

    // Find processing wallet transactions whose settlement date has passed
    const pendingTransactions = await WalletTransaction.find({
      status: "Processing",
      type: "online_earning"
    }).populate("order_id");

    let settled = 0;

    for (const txn of pendingTransactions) {
      const order = txn.order_id;
      if (!order) continue;

      const settlementDate = order.settlement_date;
      if (settlementDate && new Date(settlementDate) <= now && order.settlement_status !== "Settled") {
        // Settle this transaction
        await WalletTransaction.findByIdAndUpdate(txn._id, { status: "Completed" });
        await Order.findByIdAndUpdate(order._id, { settlement_status: "Settled" });
        settled++;
      }
    }

    console.log(`✅ Settlement done — ${settled} transactions settled`);

    // Debug: what is still pending?
    const stillPending = await WalletTransaction.find({
      status: "Processing",
      type: "online_earning"
    }).populate("order_id");

    if (stillPending.length > 0) {
      console.log("⚠️ Still waiting for settlement:");
      stillPending.forEach(txn => {
        const order = txn.order_id;
        const secondsLeft = order?.settlement_date
          ? Math.floor((new Date(order.settlement_date) - now) / 1000)
          : "N/A";
        console.log({ txnId: txn._id, status: txn.status, settlement_date: order?.settlement_date, seconds_left: secondsLeft });
      });
    } else {
      console.log("🎉 No pending settlements");
    }

  } catch (err) {
    console.error("❌ Settlement cron error:", err);
  }
};

module.exports = runSettlement;