const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateBillPDF = (order) => {
  return new Promise((resolve, reject) => {

    const fileName = `bill_${order.id}.pdf`;
    const filePath = path.join(__dirname, "../bills", fileName);

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    /* =========================
       HEADER
    ========================= */

    doc
      .fontSize(26)
      .fillColor("#4f46e5")
      .text("MESSATO", { align: "center" });

    doc
      .fontSize(14)
      .fillColor("#555")
      .text("Order Invoice", { align: "center" });

    doc.moveDown(2);

    /* =========================
       CUSTOMER DETAILS
    ========================= */

    doc
      .fontSize(12)
      .fillColor("#000")
      .text(`Invoice No: #${order.id}`)
      .text(`Customer: ${order.customer_name}`)
      .text(`Phone: ${order.phone}`)
      .text(`Date: ${new Date(order.created_at).toLocaleString()}`);

    doc.moveDown(2);

    /* =========================
       ITEMS TABLE HEADER
    ========================= */

    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 360;
    const totalX = 450;

    doc
      .fontSize(12)
      .fillColor("#ffffff")
      .rect(40, tableTop - 5, 520, 25)
      .fill("#4f46e5");

    doc
      .fillColor("#ffffff")
      .text("Item", itemX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text("Price", priceX, tableTop)
      .text("Total", totalX, tableTop);

    doc.moveDown();

    /* =========================
       ITEMS
    ========================= */

    let position = tableTop + 30;

    doc.fillColor("#000");

    order.items.forEach((item, index) => {
      const itemTotal = item.qty * item.price;

      doc
        .fontSize(11)
        .text(item.name, itemX, position)
        .text(item.qty, qtyX, position)
        .text(`₹${item.price}`, priceX, position)
        .text(`₹${itemTotal}`, totalX, position);

      position += 25;
    });

    doc.moveDown(2);

    /* =========================
       TOTAL BOX
    ========================= */

    doc
      .rect(350, position + 10, 200, 40)
      .fill("#f3f4f6");

    doc
      .fillColor("#000")
      .fontSize(14)
      .text(
        `Grand Total: ₹${order.total_amount}`,
        360,
        position + 22
      );

    doc.moveDown(4);

    /* =========================
       FOOTER
    ========================= */

    doc
      .fontSize(11)
      .fillColor("#666")
      .text(
        "Thank you for ordering with Messato ❤️",
        { align: "center" }
      );

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};

module.exports = generateBillPDF;
