const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* 🔹 GET user food preference */
router.get("/food-type/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ food_type: "Veg" }); // default
    }

    res.json({ food_type: user.food_type || "Veg" });
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/* 🔹 UPDATE user food preference */
router.post("/food-preference", async (req, res) => {
  try {
    const { userId, foodPreference } = req.body;

    if (!userId || !foodPreference) {
      return res.status(400).json({ message: "userId and foodPreference required" });
    }

    await User.findByIdAndUpdate(userId, { food_type: foodPreference });

    res.json({ message: "Food preference updated successfully" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
});

module.exports = router;
