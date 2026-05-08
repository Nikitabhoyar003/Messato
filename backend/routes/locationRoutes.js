const express = require("express");
const axios = require("axios");
const router = express.Router();

console.log("Location routes loaded ✅");

/* ===================================
   🔎 SEARCH LOCATION
=================================== */
router.get("/search-location", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Query required" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
          countrycodes: "in",
        },
        headers: {
          "User-Agent": "messato-app",
          "Accept-Language": "en",
        },
        timeout: 8000,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Search error:", err.response?.data || err.message);
    res.status(500).json({ message: "Search failed" });
  }
});

/* ===================================
   📍 REVERSE GEOCODE
=================================== */
router.get("/reverse-geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat & lng required" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latNum,
          lon: lngNum,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "messato-app",
          "Accept-Language": "en",
        },
        timeout: 8000,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Reverse error:", err.response?.data || err.message);
    res.status(500).json({ message: "Reverse geocode failed" });
  }
});

module.exports = router;
