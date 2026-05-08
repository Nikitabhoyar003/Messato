const Order = require("../models/Order");
const WalletTransaction = require("../models/WalletTransaction");

exports.handleDeliveredOrder = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // Check if transaction already exists for this order
  const existing = await WalletTransaction.findOne({ reference_id: orderId });
  if (existing) return;

  const commission = order.item_total * 0.1;
  const vendorEarning = order.item_total - commission;

  const settlementDate = new Date();
  settlementDate.setDate(settlementDate.getDate() + 2);

  order.admin_commission = commission;
  order.vendor_earning = vendorEarning;
  order.settlement_date = settlementDate;
  await order.save();

  if (order.payment_method !== "COD") {
    await WalletTransaction.create({
      vendor_id: order.vendor_id,
      reference_id: orderId,
      type: "ONLINE_EARNING",
      amount: vendorEarning,
      status: "Processing",
    });
  } else {
    await WalletTransaction.create({
      vendor_id: order.vendor_id,
      reference_id: orderId,
      type: "COD_COMMISSION",
      amount: -commission,
      status: "Completed",
    });
  }
};