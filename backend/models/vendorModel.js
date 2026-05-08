const db = require("../config/db");
const bcrypt = require("bcryptjs");

class Vendor {
  // =========================
  // CREATE VENDOR
  // =========================
  static async createVendor(data) {
  const {
    shopName,
    ownerName,
    email,
    phone,
    location,
    password,
  } = data;

  // 🔹 check if vendor exists
  const [existing] = await db.query(
    "SELECT vendor_id FROM vendors WHERE LOWER(email) = LOWER(?)",
    [email]
  );

  if (existing.length > 0) {
    const error = new Error("Vendor already exists");
    error.code = "VENDOR_EXISTS";
    throw error;
  }

  // 🔹 hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔥 IMPORTANT CHANGE HERE
  await db.query(
    `INSERT INTO vendors 
     (shop_name, owner_name, email, phone, location, password, status)
     VALUES (?, ?, ?, ?, ?, ?, 'incomplete')`,
    [
      shopName,
      ownerName,
      email.toLowerCase(),
      phone,
      location,
      hashedPassword,
    ]
  );
}

  // =========================
  // FIND VENDOR BY EMAIL
  // =========================
  static async findVendorByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM vendors WHERE LOWER(email) = LOWER(?)",
      [email]
    );

    return rows[0]; // undefined if not found
  }
}

module.exports = Vendor;
