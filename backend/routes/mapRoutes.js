const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const VendorProfile = require("../models/VendorProfile");
const Review = require("../models/Review");
const mongoose = require("mongoose");

/* =========================
   GET NEARBY TIFFIN VENDORS
========================= */
router.get("/nearby", async (req, res) => {
  try {
    let { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Lat & Lng required" });
    }

    lat = Number(lat);
    lng = Number(lng);
    const radiusKm = Number(radius);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Invalid coordinates" });
    }

    // Haversine calculation in JS (since we don't have geo-spatial index yet)
    const vendors = await Vendor.find({
      latitude: { $ne: null },
      longitude: { $ne: null },
      status: "approved",
      is_active: true
    });

    const result = await Promise.all(vendors.map(async (v) => {
      // Calculate distance
      const R = 6371;
      const dLat = (v.latitude - lat) * Math.PI / 180;
      const dLon = (v.longitude - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(v.latitude * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;

      if (distance > radiusKm) return null;

      // Get rating
      const ratingData = await Review.aggregate([
        { $match: { vendor_id: v._id, status: "active" } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]);

      // Get profile for image and area
      const profile = await VendorProfile.findOne({ vendor_id: v._id });

      return {
        vendor_id: v._id,
        shop_name: v.shop_name,
        rating: ratingData[0]?.avgRating ? Number(ratingData[0].avgRating.toFixed(1)) : 0,
        latitude: v.latitude,
        longitude: v.longitude,
        distance: Number(distance.toFixed(2)),
        image: profile?.shop_image || null,
        area: v.area || profile?.area || null,
        location: v.location || profile?.location || null
      };
    }));

    const filtered = result.filter(Boolean).sort((a, b) => a.distance - b.distance);
    res.json(filtered);

  } catch (err) {
    console.error("Nearby vendors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
