const db = require("../config/db");

exports.createRequest = async (vendorId, amount) => {
  await db.query(
    `INSERT INTO vendor_withdrawals (vendor_id, amount) VALUES (?,?)`,
    [vendorId, amount]
  );
};

exports.getTodayTotal = async (vendorId) => {
  const [rows] = await db.query(
    `SELECT SUM(amount) as total FROM vendor_withdrawals 
     WHERE vendor_id=? AND DATE(request_date)=CURDATE()`,
    [vendorId]
  );

  return rows[0].total || 0;
};