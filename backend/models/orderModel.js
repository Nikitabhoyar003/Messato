const db = require("../config/db");


exports.getOrderById = async (orderId) => {
  const [rows] = await db.query("SELECT * FROM orders WHERE id=?", [orderId]);
  return rows[0];
};

exports.updateOrderEarning = async (orderId, adminCommission, vendorEarning) => {
  await db.query(
    `UPDATE orders 
     SET admin_commission=?, vendor_earning=? 
     WHERE id=?`,
    [adminCommission, vendorEarning, orderId]
  );
};