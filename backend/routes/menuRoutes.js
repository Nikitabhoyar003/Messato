const express = require("express");
const router = express.Router();
const Menu = require("../models/Menu");
const Vendor = require("../models/Vendor");
const Review = require("../models/Review");
const { verifyUser } = require("../middleware/authMiddleware");
const mongoose = require("mongoose");

/* =========================
   GET SINGLE MENU ITEM BY ID
========================= */
router.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findOne({ _id: id, is_available: true })
      .populate("vendor_id", "shop_name latitude longitude status is_active");

    if (!menu || menu.vendor_id?.status !== "approved" || !menu.vendor_id?.is_active) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Get average rating
    const ratingData = await Review.aggregate([
      { $match: { menu_id: new mongoose.Types.ObjectId(id), status: "active" } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, total: { $sum: 1 } } }
    ]);

    const result = menu.toObject();
    result.id = result._id;
    result.shop_name = menu.vendor_id?.shop_name;
    result.latitude = menu.vendor_id?.latitude;
    result.longitude = menu.vendor_id?.longitude;
    result.rating = ratingData[0]?.avgRating ? Number(ratingData[0].avgRating.toFixed(1)) : 0;
    result.total_reviews = ratingData[0]?.total || 0;
    result.time = result.meal_type;

    res.json(result);

  } catch (err) {
    console.error("Menu item fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ADMIN → UPDATE FULL MENU
========================= */
router.put("/menus/:menuId", verifyUser("admin"), async (req, res) => {
  try {
    const { menuId } = req.params;
    const updateData = { ...req.body };
    
    // Normalize enums if needed
    if (updateData.is_available !== undefined) {
      updateData.is_available = !!updateData.is_available;
    }

    const updated = await Menu.findByIdAndUpdate(menuId, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Menu not found" });

    res.json({ success: true, menu: updated });
  } catch (err) {
    console.error("❌ MENU UPDATE ERROR:", err);
    res.status(500).json({ message: "Menu update failed", error: err.message });
  }
});

/* =========================
   ADMIN → DELETE MENU
========================= */
router.delete("/menus/:menuId", verifyUser("admin"), async (req, res) => {
  try {
    const { menuId } = req.params;
    const result = await Menu.findByIdAndDelete(menuId);
    if (!result) return res.status(404).json({ message: "Menu not found" });

    res.json({ success: true, message: "Menu deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

/* =========================
   GET NEARBY MENUS
========================= */
router.get("/nearby", async (req, res) => {
  try {
    let { mealType, lat, lng, radius = 1, menuScope, date, monthName } = req.query;

    if (!mealType || !lat || !lng) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    lat = Number(lat);
    lng = Number(lng);
    const radiusKm = Number(radius) || 1;

    // Filter logic
    const filter = {
      is_available: true,
      meal_type: new RegExp(`^${mealType.trim()}$`, "i")
    };

    console.log("🔍 NEARBY SEARCH QUERY:", req.query);

    if (menuScope === "daily" && date) {
      filter.menu_scope = "Daily";
      // filter.menu_date = { $lte: new Date(date) };
    } else if (menuScope === "weekly") {
      filter.menu_scope = "Weekly";
    } else if (menuScope === "monthly" && monthName) {
      filter.menu_scope = "Monthly";
      filter.month_name = new RegExp(`^${monthName.trim()}$`, "i");
    }

    console.log("🔍 GENERATED FILTER:", filter);

    // Find menus and join with vendors
    const menus = await Menu.find(filter).populate("vendor_id");
    console.log("🔍 MENUS FOUND:", menus.length);

    const formatted = menus
      .map(m => {
        const v = m.vendor_id;
        if (!v) { console.log("❌ REJECTED: No vendor_id for menu", m.name); return null; }
        if (v.status !== "approved") { console.log("❌ REJECTED: Vendor status is", v.status, "for menu", m.name); return null; }
        if (!v.is_active) { console.log("❌ REJECTED: Vendor is inactive for menu", m.name); return null; }
        if (!v.latitude || !v.longitude) { console.log("❌ REJECTED: Vendor missing coords for menu", m.name); return null; }

        // Calculate distance (Haversine)
        const R = 6371;
        const dLat = (v.latitude - lat) * Math.PI / 180;
        const dLon = (v.longitude - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(v.latitude * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        console.log(`📏 DISTANCE for ${m.name}: ${distance.toFixed(2)} KM (Radius: ${radiusKm} KM)`);

        if (distance > radiusKm) {
          console.log(`❌ REJECTED: Outside radius (${distance.toFixed(2)} > ${radiusKm})`);
          return null;
        }

        return {
          ...m.toObject(),
          id: m._id,
          image: m.image?.[0] || null,
          images: m.image,
          time: m.meal_type,
          shop_name: v.shop_name,
          location: v.location,
          town: v.area,
          vid: v._id,
          distance: Number(distance.toFixed(2))
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance);

    res.json(formatted);

  } catch (err) {
    console.error("❌ /nearby error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* =========================
   GET SUGGESTED ITEMS
========================= */
router.get("/suggestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentMenu = await Menu.findById(id);
    if (!currentMenu) return res.status(404).json({ message: "Item not found" });

    const suggestions = await Menu.find({
      cuisine: currentMenu.cuisine,
      _id: { $ne: id },
      is_available: true
    })
    .populate("vendor_id", "shop_name rating status is_active")
    .limit(6);

    const filtered = suggestions
      .filter(s => s.vendor_id?.status === "approved" && s.vendor_id?.is_active)
      .map(s => ({
        id: s._id,
        name: s.name,
        price: s.price,
        image: s.image[0],
        cuisine: s.cuisine,
        meal_type: s.meal_type,
        shop_name: s.vendor_id?.shop_name,
        rating: 0 // Placeholder
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Suggestion fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   POST /cart-details
========================= */
router.post("/cart-details", async (req, res) => {
  try {
    let { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.json([]);

    ids = [...new Set(ids)];
    const items = await Menu.find({ _id: { $in: ids } }).populate("vendor_id", "shop_name area");

    const formatted = items.map(item => ({
      id: item._id,
      name: item.name,
      image: item.image[0],
      price: item.price,
      description: item.description,
      is_available: item.is_available,
      vendor_name: item.vendor_id?.shop_name,
      area: item.vendor_id?.area,
      rating: 0 // Placeholder
    }));

    // Keep order
    const ordered = ids.map(id => formatted.find(item => item.id.toString() === id)).filter(Boolean);
    res.json(ordered);
  } catch (err) {
    console.error("Cart details error:", err);
    res.status(500).json({ message: "Failed to fetch cart details" });
  }
});

/* =========================
   GET MENU BY MEAL TYPE (Dynamic)
========================= */
router.get("/:mealType", async (req, res) => {
  try {
    const mealType = req.params.mealType.toLowerCase();
    const mealMap = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
    if (!mealMap[mealType]) return res.status(400).json({ message: "Invalid meal type" });

    const formattedMeal = mealMap[mealType];
    const items = await Menu.find({ meal_type: formattedMeal, is_available: true })
      .populate("vendor_id", "status is_active rating")
      .sort({ _id: -1 });

    const filtered = items
      .filter(i => i.vendor_id?.status === "approved" && i.vendor_id?.is_active)
      .map(i => ({
        id: i._id,
        vendor_id: i.vendor_id?._id,
        name: i.name,
        price: i.price,
        image: i.image,
        cuisine: i.cuisine,
        food_type: i.food_type,
        time: i.meal_type,
        rating: 0 // Placeholder
      }));

    res.json(filtered);
  } catch (err) {
    console.error("Meal type fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
