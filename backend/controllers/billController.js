const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Order = require("../models/Order");
const User = require("../models/User");
const Bill = require("../models/Bill");

/* ==============================
   🔥 AUTO GENERATE
============================== */
exports.generateBillAuto = async (orderId) => {
  try {
    console.log("🔥 Trying to generate bill for:", orderId);

    // CHECK IF BILL ALREADY EXISTS
    const existing = await Bill.findOne({ order_id: orderId });
    if (existing) {
      console.log("⚠ Bill already exists for order:", orderId);
      return;
    }

    // FETCH ORDER + USER
    const order = await Order.findById(orderId).populate("user_id", "name user_number");

    if (!order) {
      console.log("❌ Order not found for bill:", orderId);
      return;
    }

    const user = order.user_id;

    // CREATE BILLS FOLDER
    const billsDir = path.join(__dirname, "../bills");
    if (!fs.existsSync(billsDir)) fs.mkdirSync(billsDir);

    const fileName = `bill_${orderId}.pdf`;
    const filePath = path.join(billsDir, fileName);

    // GENERATE PDF
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const primary = "#3b82f6";
      const dark = "#111827";
      const gray = "#6b7280";
      const lightGray = "#f3f4f6";
      const border = "#e5e7eb";

      doc.fontSize(28).fillColor(primary).text("MESSATO", { align: "center" });
      doc.moveDown(0.3).fontSize(11).fillColor(gray).text("Premium Food Delivery Platform", { align: "center" });
      doc.moveDown(1).fontSize(16).fillColor(dark).text("INVOICE", { align: "center" });
      doc.moveDown(2);

      const cardTop = doc.y;
      doc.roundedRect(50, cardTop, 495, 85, 6).fill(lightGray);
      doc.fillColor(dark).fontSize(10)
        .text(`Invoice No: INV-${orderId}`, 70, cardTop + 15)
        .text(`Order ID: ${orderId}`, 70, cardTop + 30)
        .text(`Date: ${new Date().toLocaleDateString()}`, 70, cardTop + 45)
        .text(`Status: Paid`, 70, cardTop + 60);
      doc.fillColor(dark).fontSize(10).text("Bill To:", 330, cardTop + 15);
      doc.fillColor(gray)
        .text(user?.name || "Customer", 330, cardTop + 30)
        .text(`Phone: ${user?.user_number || "N/A"}`, 330, cardTop + 45);

      doc.moveDown(6);
      const tableTop = cardTop + 110;
      doc.roundedRect(50, tableTop, 495, 25, 4).fill("#e5e7eb");
      doc.fillColor(dark).fontSize(10)
        .text("Description", 70, tableTop + 8)
        .text("Qty", 300, tableTop + 8)
        .text("Unit Price", 360, tableTop + 8)
        .text("Total", 460, tableTop + 8);

      const rowTop = tableTop + 35;
      const subtotal = Number(order.total_amount);
      doc.fillColor(dark).fontSize(10)
        .text("Food Order Payment", 70, rowTop)
        .text(1, 310, rowTop)
        .text(`Rs ${subtotal.toFixed(2)}`, 360, rowTop)
        .text(`Rs ${subtotal.toFixed(2)}`, 460, rowTop);
      doc.moveTo(60, rowTop + 20).lineTo(540, rowTop + 20).strokeColor(border).stroke();

      const summaryTop = rowTop + 35;
      const delivery = 30;
      const tax = subtotal * 0.05;
      const grandTotal = subtotal + delivery + tax;
      doc.fillColor(gray).fontSize(10)
        .text("Subtotal", 360, summaryTop).text(`Rs ${subtotal.toFixed(2)}`, 460, summaryTop)
        .text("Delivery Charge", 360, summaryTop + 18).text(`Rs ${delivery.toFixed(2)}`, 460, summaryTop + 18)
        .text("Tax (5%)", 360, summaryTop + 36).text(`Rs ${tax.toFixed(2)}`, 460, summaryTop + 36);
      doc.moveTo(350, summaryTop + 55).lineTo(540, summaryTop + 55).strokeColor(border).stroke();
      doc.fillColor(dark).fontSize(12)
        .text("Grand Total", 360, summaryTop + 70)
        .text(`Rs ${grandTotal.toFixed(2)}`, 460, summaryTop + 70);

      const stampPath = path.join(__dirname, "../assets/paid-stamp.png");
      if (fs.existsSync(stampPath)) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const stampWidth = 140;
        const x = pageWidth - stampWidth - 60;
        const y = pageHeight - 180;
        doc.save();
        doc.rotate(-18, { origin: [x + stampWidth / 2, y + 40] });
        doc.image(stampPath, x, y, { width: stampWidth, opacity: 0.85 });
        doc.restore();
      }

      doc.moveTo(50, 740).lineTo(545, 740).strokeColor(border).stroke();
      doc.fontSize(9).fillColor(gray).text(
        "Messato Pvt Ltd • Business Tower, India • support@messato.com",
        50, 755, { align: "center", width: 495 }
      );

      doc.end();
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    const billUrl = `/bills/${fileName}`;

    // INSERT INTO DATABASE
    await Bill.create({ order_id: orderId, bill_url: billUrl });

    console.log("✅ Bill inserted into DB:", orderId);

  } catch (err) {
    console.error("❌ Auto Bill Error:", err);
  }
};

/* ==============================
   📄 MANUAL GENERATE
============================== */
exports.generateBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    await exports.generateBillAuto(orderId);
    res.json({ success: true, message: "Bill generated successfully" });
  } catch (err) {
    console.error("❌ Generate bill error:", err);
    res.status(500).json({ message: "Bill generation failed" });
  }
};
