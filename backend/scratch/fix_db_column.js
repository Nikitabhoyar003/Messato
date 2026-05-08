require("dotenv").config({ path: "./.env" });
const db = require("../config/db");

(async () => {
  try {
    console.log("Renaming order_status to status in orders table...");
    await db.query("ALTER TABLE orders CHANGE order_status status varchar(100) DEFAULT 'Pending'");
    console.log("✅ Column renamed successfully!");
    
    console.log("Verifying columns...");
    const [rows] = await db.query("DESCRIBE orders");
    console.log("ORDERS TABLE COLUMNS:", rows.map(r => r.Field));
    
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
})();
