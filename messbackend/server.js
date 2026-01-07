const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();     // ✅ app created FIRST

// ✅ middleware AFTER app creation
app.use(cors());
app.use(express.json());

// routes
app.use("/api", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
