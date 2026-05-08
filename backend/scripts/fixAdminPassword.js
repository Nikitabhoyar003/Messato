require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const hash = bcrypt.hashSync("admin123", 10);

db.query(
  "UPDATE admins SET password=? WHERE email=?",
  [hash, "admin@messato.com"],
  (err) => {
    if (err) console.error(err);
    else console.log("✅ Admin password hashed successfully");
    process.exit();
  }
);
