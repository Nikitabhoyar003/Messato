 const mysql = require("mysql2/promise");
const { URL } = require("url");
require("dotenv").config();

const { breakfastData } = require(".../data/breakfast");
const { lunchData } = require(".../data/lunch");
const { dinnerData } = require(".../data/dinner");

const dbUrl = new URL(process.env.MYSQL_SERVICE_URL);

const db = mysql.createPool({
  host: dbUrl.hostname,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.replace("/", ""),
  ssl: { rejectUnauthorized: false },
});

const allItems = [
  ...breakfastData,
  ...lunchData,
  ...dinnerData,
];

(async () => {
  for (const item of allItems) {
    await db.query(
      `INSERT INTO vendor_items
       (vendor_id, name, price, image, cuisine, rating, time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        item.vendor_id,
        item.name,
        item.price,
        item.image,
        item.cuisine,
        item.rating,
        item.time,
      ]
    );
  }

  console.log("✅ Items seeded successfully");
  process.exit();
})();
