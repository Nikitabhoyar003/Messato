require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("C:\Users\HP\OneDrive\Desktop\Messato\backend\routes\authroutes.js");
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.listen(5000, () => {
  console.log("✅ Server running on port 5000");
});





