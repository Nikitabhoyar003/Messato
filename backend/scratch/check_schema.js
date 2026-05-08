require("dotenv").config({ path: "./.env" });
const db = require("../config/db");

(async () => {
  try {
    const [users] = await db.query("DESCRIBE users");
    console.log("USERS TABLE SCHEMA:", users);
    const [reviews] = await db.query("DESCRIBE reviews");
    console.log("REVIEWS TABLE SCHEMA:", reviews);
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
})();



