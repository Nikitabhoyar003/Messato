const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// path to database file
const dbPath = path.join(__dirname, "C:\Users\HP\OneDrive\Desktop\Messato\database\database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
  }
});

module.exports = db;
