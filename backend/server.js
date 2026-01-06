const express = require("express");
const cors = require("cors");

const authRoutes = require("/backend/routes/auth.routes");
// const vendorRoutes = require("/backend/routes/vendorRoutes");
// const adminRoutes = require("/backend/routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/backend/api/auth", authRoutes);
// app.use("/api/vendor", vendorRoutes);
// app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Messato Backend Running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

