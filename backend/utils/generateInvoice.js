const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const generateInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const billsDir = path.join(__dirname, "../bills");

      // ✅ ensure bills folder exists
      if (!fs.existsSync(billsDir)) {
        fs.mkdirSync(billsDir, { recursive: true });
      }

      const fileName = `invoice_${order.id}.pdf`;
      const filePath = path.join(billsDir, fileName);

      const doc = new PDFDocument({ margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      /* ================= HEADER ================= */

      doc
        .fontSize(20)
        .text("Messato", { align: "center" })
        .fontSize(10)
        .text("Food Ordering Invoice", { align: "center" });

      doc.moveDown();

      /* ================= ORDER INFO ================= */

      doc.text(`Invoice No: INV-${order.id}`);
      doc.text(`Order ID: #${order.id}`);
      doc.text(`Date: ${new Date().toLocaleString("en-IN")}`);

      doc.moveDown();

      /* ================= CUSTOMER ================= */

      doc.text("Bill To:");
      doc.text(order.customer_name || "Customer");
      if (order.phone) doc.text(order.phone);
      doc.text(order.address || "");

      doc.moveDown();

      /* ================= VENDOR ================= */

      doc.text("Vendor:");
      doc.text(order.vendor_name || "");

      doc.moveDown();

      /* ================= ITEMS TABLE ================= */

      doc.fontSize(12).text("Items", { underline: true });

      const items = order.items || []; // ✅ prevent crash

      if (items.length === 0) {
        doc.text("No items found");
      } else {
        items.forEach((item) => {
          doc.text(
            `${item.name}   |   Qty: ${item.quantity}   |   ₹${item.price}`
          );
        });
      }

      doc.moveDown();

      /* ================= TOTAL ================= */

      doc.text(`Total Amount: ₹${order.total_amount}`, {
        align: "right",
      });

      doc.moveDown();

      /* ================= PAYMENT ================= */

      doc.text(`Payment Method: ${order.payment_method || "Online"}`);
      if (order.payment_id) doc.text(`Payment ID: ${order.payment_id}`);

      doc.moveDown();

      doc.text("Thank you for your order ❤️", { align: "center" });

      doc.end();

      stream.on("finish", () => {
        resolve(`http://localhost:5000/bills/${fileName}`);
      });

      stream.on("error", (err) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = generateInvoice;