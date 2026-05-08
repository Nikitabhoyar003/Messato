const bcrypt = require("bcryptjs");
const db = require("../config/db");

const name = "Super Admin";
const email = "admin@messato.com";
const password = bcrypt.hashSync("admin123", 10);

db.query(
  "INSERT INTO admins (name, email, password) VALUES (?, ?, ?)",
  [name, email, password],
  (err) => {
    if (err) {
      console.error("❌ Error:", err);
    } else {
      console.log("✅ Admin created successfully");
    }
    process.exit();
  }
);
