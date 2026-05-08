require("dotenv").config();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const db = require("../config/db");
 // FIXED PATH

async function generateOldBills() {
  try {
    const [orders] = await db.query(`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        u.user_number
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.payment_status = 'Paid'
    `);

    const billsDir = path.join(__dirname, "../bills");

    if (!fs.existsSync(billsDir)) {
      fs.mkdirSync(billsDir);
    }

    for (const order of orders) {

      // 🔥 CHECK IF ALREADY EXISTS IN DB
      const [[exists]] = await db.query(
        "SELECT id FROM bills WHERE order_id = ?",
        [order.id]
      );

      if (exists) {
        console.log("Already exists:", order.id);
        continue;
      }

      const fileName = `bill_${order.id}.pdf`;
      const filePath = path.join(billsDir, fileName);

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      doc.fontSize(20).text("Messato - Order Bill", { align: "center" });
      doc.moveDown();
      doc.text(`Order ID: ${order.id}`);
      doc.text(`Phone: ${order.user_number}`);
      doc.text(`Amount: ₹${order.total_amount}`);
      doc.text(`Date: ${new Date().toLocaleString()}`);
      doc.end();

      const billUrl = `/bills/${fileName}`;

      // 🔥 INSERT INTO DATABASE (THIS WAS MISSING)
      await db.query(
        `
        INSERT INTO bills
        (order_id, user_id, phone, total_amount, bill_url)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          order.id,
          order.user_id,
          order.user_number,
          order.total_amount,
          billUrl,
        ]
      );

      console.log("Generated bill:", order.id);
    }

    console.log("🎉 All bills generated successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

generateOldBills();
