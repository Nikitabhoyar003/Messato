const Vendor = require("../models/Vendor");
const Menu = require("../models/Menu");
const VendorProfile = require("../models/VendorProfile");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Payment = require("../models/Payment");
const WalletTransaction = require("../models/WalletTransaction");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const earningService = require("../utils/earningService");

const vendorSignup = async (req, res) => {
  try {
    const { shopName, ownerName, email, phone, location, password } = req.body;

    if (!shopName || !ownerName || !email || !phone || !location || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const lowerEmail = email.trim().toLowerCase();
    const existing = await Vendor.findOne({ email: lowerEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Vendor already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newVendor = await Vendor.create({
      shop_name: shopName,
      owner_name: ownerName,
      email: lowerEmail,
      phone,
      location,
      password: hashedPassword,
      status: "incomplete"
    });

    return res.status(201).json({
      success: true,
      message: "Vendor registered successfully",
      vendorId: newVendor._id
    });

  } catch (err) {
    console.error("❌ VENDOR SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
};

const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const vendor = await Vendor.findOne({ email: email.toLowerCase() });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: vendor._id, role: "vendor" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "7d" }
    );

    res.json({
      success: true,
      token,
      vendor: {
        id: vendor._id,
        shopName: vendor.shop_name,
        status: vendor.status,
        reject_reason: vendor.reject_reason,
      },
    });

  } catch (err) {
    console.error("❌ VENDOR LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};


const vendorDashboard = async (req, res) => {
  try {
    const vendorId = req.auth.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    /* TOTAL ORDERS */
    const totalOrders = await Order.countDocuments({ vendor_id: vendorId });

    /* STATUS COUNTS */
    const statusCounts = await Order.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const orderStatus = {};
    let delivered = 0;
    let pending = 0;

    statusCounts.forEach((item) => {
      orderStatus[item._id] = item.count;
      if (item._id.toLowerCase() === "delivered") delivered = item.count;
      if (item._id.toLowerCase() === "pending") pending = item.count;
    });

    /* TOTAL REVENUE */
    const revenueData = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId), 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ]
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_amount" } } }
    ]);
    const revenue = revenueData[0]?.total || 0;

    /* ORDERS BY DATE (Last 30 days) */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateWiseOrders = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId),
          created_at: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d %b", date: "$created_at" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const ordersByTime = {};
    dateWiseOrders.forEach(item => {
      ordersByTime[item._id] = item.count;
    });

    /* MONTHLY REVENUE */
    const monthlyRevenueData = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId),
          status: "Delivered"
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%b %Y", date: "$created_at" } },
          revenue: { $sum: "$total_amount" },
          sort_date: { $min: "$created_at" }
        }
      },
      { $sort: { "sort_date": 1 } }
    ]);

    const monthlyRevenue = monthlyRevenueData.map(item => ({
      month: item._id,
      revenue: item.revenue
    }));

    /* LATEST REVIEWS */
    const reviews = await Review.find({ vendor_id: vendorId })
      .populate("user_id", "name")
      .sort({ created_at: -1 })
      .limit(5);

    const formattedReviews = reviews.map(r => ({
      rating: r.rating,
      comment: r.comment,
      user_name: r.user_id?.name || "Anonymous"
    }));

    res.json({
      totalOrders,
      delivered,
      pending,
      revenue,
      orderStatus,
      ordersByTime,
      monthlyRevenue,
      reviews: formattedReviews,
    });

  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Dashboard fetch failed" });
  }
};
  //  212121212121212121212121

// ================= IST TIME FUNCTION =================
const getISTHour = () => {
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  return istTime.getHours();
};

// ================= MENU TIME VALIDATION =================
const isMenuEditAllowed = (mealType) => {
  const hour = getISTHour();

  // DINNER RULE
  // if (mealType === "Dinner") {
  //   if (hour >= 48) {
  //     return {
  //       allowed: false,
  //       message:
  //         "Dinner menu can only be edited before 24 PM IST."
  //     };
  //   }
  // }

  // BREAKFAST & LUNCH RULE
  // if (mealType === "Breakfast" || mealType === "Lunch") {
  //   if (hour < 48) {
  //     return {
  //       allowed: false,
  //       message:
  //         "Breakfast & Lunch menu can only be edited between 3 PM - 12 AM IST."
  //     };
  //   }
  // }

  return { allowed: true };
};
/* =================================================
   🔹 ADD MENU (FIXED: CLOUDINARY + DB)
================================================= */

const deriveDateFields = (dateStr) => {
  const d = new Date(dateStr);
  return {
    dayOfWeek : d.toLocaleString("en-US", { weekday: "long" }), // "Monday"
    monthName : d.toLocaleString("en-US", { month:   "long" }), // "March"
  };
};


/* ────────────────────────────────────────────────────────────
   ADD MENU
   POST /vendor/menu
   Body  : name, description, price, cuisine, foodType,
           mealType, menuScope, menu_date, latitude, longitude
   Files : images (2–4 required)
──────────────────────────────────────────────────────────── */
const addMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const {
      name,
      description,
      price,
      cuisine,
      foodType,
      mealType,
      menuScope,
      menu_date,
      latitude,
      longitude,
    } = req.body;

    /* ── 1. Required field validation ── */
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Food name is required" });
    }
    if (!mealType) {
      return res.status(400).json({ message: "Meal type is required" });
    }
    if (!menuScope || !["Daily", "Weekly", "Monthly"].includes(menuScope)) {
      return res.status(400).json({ message: "Scope must be Daily, Weekly, or Monthly" });
    }
    if (!menu_date) {
      return res.status(400).json({ message: "Menu date is required" });
    }

    /* ── 2. Date must be tomorrow or later ── */
    const today     = new Date(); today.setHours(0, 0, 0, 0);
    const submitted = new Date(menu_date); submitted.setHours(0, 0, 0, 0);

    if (submitted <= today) {
      return res.status(403).json({
        message: "Menu date must be at least tomorrow. You cannot add menu for today or past dates.",
      });
    }

    /* ── 3. Meal time window check ── */
    const check = isMenuEditAllowed(mealType);
    if (!check.allowed) {
      return res.status(403).json({ message: check.message });
    }

    /* ── 4. Image upload ── */
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
    }
    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    /* ── 5. Location Fallback ── */
    let finalLat = latitude ? Number(latitude) : null;
    let finalLng = longitude ? Number(longitude) : null;

    if (!finalLat || !finalLng) {
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        finalLat = vendor.latitude || null;
        finalLng = vendor.longitude || null;
      }
    }

    /* ── 6. Auto-derive day_of_week and month_name from menu_date ── */
    const { dayOfWeek, monthName } = deriveDateFields(menu_date);
    const parsedDayOfWeek = dayOfWeek;
    const parsedMonthName = menuScope === "Monthly" ? monthName : null;

    /* ── 7. Insert into MongoDB ── */
    const newMenu = await Menu.create({
      vendor_id: vendorId,
      name: name.trim(),
      description: description || null,
      price: price ? Number(price) : null,
      cuisine: cuisine || null,
      meal_type: mealType,
      food_type: foodType || "Veg",
      menu_scope: menuScope,
      day_of_week: parsedDayOfWeek,
      month_name: parsedMonthName,
      menu_date: menu_date,
      latitude: finalLat,
      longitude: finalLng,
      image: imageUrls,
    });

    return res.status(201).json({
      success : true,
      message : "Menu added successfully",
      saved   : {
        ...newMenu.toObject(),
        image: newMenu.image[0] || null,
        images: newMenu.image
      },
    });

  } catch (err) {
    console.error("ADD MENU ERROR:", err);
    return res.status(500).json({ message: "Failed to add menu. Please try again." });
  }
};


/* ────────────────────────────────────────────────────────────
   GET MENU
   GET /vendor/menu
   Returns all menu items for the logged-in vendor
──────────────────────────────────────────────────────────── */
const getMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const rows = await Menu.find({ vendor_id: vendorId }).sort({ menu_date: 1 });

    const formattedRows = rows.map(item => {
      const itemObj = item.toObject();
      const images = Array.isArray(itemObj.image) ? itemObj.image : [itemObj.image].filter(Boolean);
      return {
        ...itemObj,
        image: images[0] || null,
        images: images
      };
    });

    return res.status(200).json(formattedRows);

  } catch (err) {
    console.error("GET MENU ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch menu" });
  }
};


/* ────────────────────────────────────────────────────────────
   UPDATE MENU
   PUT /vendor/menu/:id
   Re-derives day_of_week and month_name if menu_date changes
──────────────────────────────────────────────────────────── */
const updateMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    const menuId   = req.params.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const existing = await Menu.findOne({ _id: menuId, vendor_id: vendorId });

    if (!existing) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    /* ── Block edits on today or past dates ── */
    const today        = new Date(); today.setHours(0, 0, 0, 0);
    const existingDate = new Date(existing.menu_date); existingDate.setHours(0, 0, 0, 0);

    if (existingDate <= today) {
      return res.status(403).json({
        message: "Cannot edit today's or past menu items",
      });
    }

    const {
      name,
      description,
      price,
      cuisine,
      foodType,
      mealType,
      menuScope,
      menu_date,
      latitude,
      longitude,
    } = req.body;

    /* ── If new date provided, validate it ── */
    const targetDate = menu_date || existing.menu_date;
    const submitted  = new Date(targetDate); submitted.setHours(0, 0, 0, 0);

    if (submitted <= today) {
      return res.status(403).json({
        message: "Updated date must also be tomorrow or later",
      });
    }

    /* ── Meal time window check ── */
    const targetMealType = mealType || existing.meal_type;
    const check = isMenuEditAllowed(targetMealType);
    if (!check.allowed) {
      return res.status(403).json({ message: check.message });
    }

    /* ── Re-derive from (possibly new) date ── */
    const targetScope             = menuScope || existing.menu_scope;
    const { dayOfWeek, monthName } = deriveDateFields(targetDate);

    const parsedDayOfWeek = dayOfWeek;
    const parsedMonthName = targetScope === "Monthly" ? monthName : null;

    /* ── Optional new images ── */
    let imageUrls = existing.image;
    if (req.files && req.files.length > 0) {
      imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
    }

    /* ── Update ── */
    existing.name = name || existing.name;
    existing.description = description || existing.description;
    existing.price = price ? Number(price) : existing.price;
    existing.cuisine = cuisine || existing.cuisine;
    existing.meal_type = mealType || existing.meal_type;
    existing.food_type = foodType || existing.food_type;
    existing.menu_scope = targetScope;
    existing.day_of_week = parsedDayOfWeek;
    existing.month_name = parsedMonthName;
    existing.menu_date = targetDate;
    existing.latitude = latitude ? Number(latitude) : existing.latitude;
    existing.longitude = longitude ? Number(longitude) : existing.longitude;
    existing.image = imageUrls;

    await existing.save();

    return res.status(200).json({
      success : true,
      message : "Menu updated successfully",
      saved   : {
        ...existing.toObject(),
        image: existing.image[0] || null,
        images: existing.image
      },
    });

  } catch (err) {
    console.error("UPDATE MENU ERROR:", err);
    return res.status(500).json({ message: "Failed to update menu. Please try again." });
  }
};


/* ────────────────────────────────────────────────────────────
   DELETE MENU
   DELETE /vendor/menu/:id
   Blocks deletion of today's or past items
──────────────────────────────────────────────────────────── */
const deleteMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    const menuId   = req.params.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const item = await Menu.findOne({ _id: menuId, vendor_id: vendorId });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const itemDate = new Date(item.menu_date); itemDate.setHours(0, 0, 0, 0);

    if (itemDate <= today) {
      return res.status(403).json({
        message: "Cannot delete today's or past menu items",
      });
    }

    await Menu.deleteOne({ _id: menuId });

    return res.status(200).json({
      success : true,
      message : "Menu item deleted successfully",
    });

  } catch (err) {
    console.error("DELETE MENU ERROR:", err);
    return res.status(500).json({ message: "Failed to delete menu item" });
  }
};


module.exports = { addMenu, getMenu, updateMenu, deleteMenu };




/* ──────────────────────────────────────────────────────────────
   addWeeklyMenu  (bulk — moved out of addMenu, was dead code)
────────────────────────────────────────────────────────────── */
const addWeeklyMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    const { weeklyItems } = req.body;

    if (!weeklyItems || weeklyItems.length !== 7) {
      return res.status(400).json({
        message: "Full week menu (all 7 days) required",
      });
    }

    // Delete existing items for this vendor + week (for re-editing)
    // Note: Mongoose doesn't have a direct 'week_number' in schema unless we add it.
    // For now, let's just delete by vendor and scope if needed, or based on the dates provided.
    const dates = weeklyItems.map(item => item.menu_date);
    await Menu.deleteMany({
      vendor_id: vendorId,
      menu_scope: "Weekly",
      menu_date: { $in: dates }
    });

    const menusToSave = weeklyItems.map(item => {
      const { dayOfWeek, monthName } = deriveDateFields(item.menu_date);
      return {
        vendor_id: vendorId,
        name: item.name,
        description: item.description || null,
        price: item.price,
        cuisine: item.cuisine || null,
        meal_type: item.mealType,
        food_type: item.foodType || "Veg",
        menu_scope: "Weekly",
        day_of_week: dayOfWeek,
        month_name: item.menuScope === "Monthly" ? monthName : null,
        menu_date: item.menu_date,
        image: item.images || []
      };
    });

    const savedMenus = await Menu.insertMany(menusToSave);

    return res.status(201).json({
      success: true,
      message: `Weekly menu saved successfully`,
      savedMenus
    });

  } catch (err) {
    console.error("WEEKLY MENU ERROR:", err);
    return res.status(500).json({ message: "Failed to save weekly menu" });
  }
};


module.exports = { addMenu, updateMenu, addWeeklyMenu };



/* =================================================
   🔹 GET VENDOR MENU
================================================= */
const getVendorMenu = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const menu = await Menu.find({ vendor_id: vendorId }).sort({ created_at: -1 });
    
    const formattedMenu = menu.map(item => {
      const itemObj = item.toObject();
      const images = Array.isArray(itemObj.image) ? itemObj.image : [itemObj.image].filter(Boolean);
      return {
        ...itemObj,
        image: images[0] || null,
        images: images
      };
    });

    return res.json(formattedMenu);

  } catch (err) {
    console.error("❌ FETCH MENU ERROR FULL:", err);
    return res.status(500).json({ message: err.message });
  }
};

// [[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
  
// ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]


// 987868756656545434

const getVendorOrders = async (req, res) => {
  try {
    if (!req.auth || !req.auth.id) {
      return res.status(401).json({ message: "Vendor not logged in" });
    }

    const vendorId = req.auth.id;

    const orders = await Order.find({ vendor_id: vendorId })
      .populate("user_id", "name")
      .sort({ created_at: -1 });

    const formattedOrders = orders.map(o => ({
      id: o._id,
      user_id: o.user_id?._id,
      vendor_id: o.vendor_id,
      meal_type: (o.meal_time || "").toLowerCase(),
      order_status: o.status,
      payment_status: o.payment_status,
      payment_method: o.payment_method,
      amount: o.total_amount,
      address: o.address,
      latitude: o.latitude,
      longitude: o.longitude,
      reject_reason: o.reject_reason,
      created_at: o.created_at,
      user_name: o.user_id?.name || "Customer"
    }));

    return res.json(formattedOrders);

  } catch (err) {
    console.error("❌ GET VENDOR ORDERS ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message
    });
  }
};


const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};


   /* ===============================
   UPDATE ORDER STATUS (FIXED)
================================ */
/* ===============================
   UPDATE ORDER STATUS (FIXED + ARRIVING ADDED + OTP DISABLED)
================================ */
const updateOrderStatus = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    const orderId = req.params.id;
    let { order_status, reason } = req.body;

    if (order_status) {
      order_status = order_status
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase()); 
    }

    const STATUS_MAP = {
      pending: "Pending",
      accepted: "Accepted",
      preparing: "Preparing",
      out_for_delivery: "Out for Delivery",
      arriving: "Arriving",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const STATUS_FLOW = {
      pending: ["accepted", "preparing", "cancelled"],
      accepted: ["preparing", "cancelled"],
      preparing: ["out_for_delivery"],
      out_for_delivery: ["arriving", "delivered"],
      arriving: ["delivered"],
    };

    const formattedStatus = order_status?.toLowerCase().replaceAll(" ", "_");
    const nextStatus = STATUS_MAP[formattedStatus];

    if (!nextStatus) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findOne({ _id: orderId, vendor_id: vendorId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = (order.status || "").toLowerCase().replaceAll(" ", "_");

    if (
      STATUS_FLOW[currentStatus] &&
      !STATUS_FLOW[currentStatus].includes(formattedStatus)
    ) {
      return res.status(400).json({ message: "Invalid status flow" });
    }

    if (order_status === "cancelled" && !reason) {
      return res.status(400).json({ message: "Cancellation reason required" });
    }

    order.status = nextStatus;
    order.reject_reason = reason || null;
    order.updated_at = Date.now();

    // ✅ If marked as Delivered, ensure payment_status is also Paid
    if (nextStatus === "Delivered") {
      order.payment_status = "Paid";
    }

    await order.save();

    // 💰 Handle Vendor Earnings if Delivered
    if (nextStatus === "Delivered") {
      try {
        await earningService.handleDeliveredOrder(orderId);
      } catch (earnErr) {
        console.error("⚠️ EARNING CALCULATION FAILED:", earnErr.message);
      }
    }

    // 🔥 Realtime emit
    req.io.to(`order_${orderId}`).emit("orderStatusUpdated", {
      orderId,
      status: nextStatus,
    });

    return res.json({
      success: true,
      message: "Order status updated",
      newStatus: nextStatus,
    });

  } catch (err) {
    console.error("❌ UPDATE ORDER STATUS ERROR:", err);
    return res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};



//     res.json({ message: "Order status updated successfully" });
//   } catch (err) {
//     console.error("❌ UPDATE ORDER STATUS ERROR:", err);
//     res.status(500).json({ message: "Failed to update order status" });

//   }

//      const generateOtp = () =>
//   Math.floor(1000 + Math.random() * 9000).toString();


// };




/* ===============================
   DELETE ORDER
================================ */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("❌ DELETE ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

const saveVendorProfile = async (req, res) => {
  try {
    const vendorId = req.auth?.id;
    if (!vendorId) return res.status(401).json({ message: "Unauthorized" });

    const {
      shopName, ownerName, email, mobile, experience, description, fullAddress, location: detectedLocation,
      town, radius, pureVeg, jainFood, satvik, specialDiet, cuisine, onionGarlic, operatingDays,
      fssaiNumber, accountHolder, bankName, accountNumber, ifsc, branch, latitude, longitude, city, area, mealType
    } = req.body;

    let parsedMealType = [];
    try { 
      const mealObj = mealType ? JSON.parse(mealType) : {}; 
      parsedMealType = Object.keys(mealObj).filter(key => mealObj[key] === true || mealObj[key] === "true");
    } catch { 
      parsedMealType = []; 
    }

    const location = detectedLocation || fullAddress || null;
    const files = req.files || {};

    const profileImage = files?.profileImage?.[0]?.path || null;
    const fssaiCert   = files?.fssaiCert?.[0]?.path || null;
    const gstCert     = files?.gstCert?.[0]?.path || null;
    const shopAct     = files?.shopAct?.[0]?.path || null;
    const aadhaarDoc  = files?.aadhaarDoc?.[0]?.path || null;
    const panDoc      = files?.panDoc?.[0]?.path || null;

    const profileData = {
      vendor_id: vendorId,
      shop_name: shopName,
      owner_name: ownerName,
      email: email,
      mobile: mobile,
      experience: experience,
      description: description,
      profile_image: profileImage,
      location,
      town: town,
      service_radius: radius ? Number(radius) : null,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      pure_veg: pureVeg === "true" || pureVeg === true,
      jain_food: jainFood === "true" || jainFood === true,
      satvik: satvik === "true" || satvik === true,
      special_diet: specialDiet === "true" || specialDiet === true,
      meal_type: parsedMealType,
      cuisine: cuisine,
      onion_garlic: onionGarlic,
      operating_days: operatingDays,
      fssai_number: fssaiNumber,
      fssai_certificate: fssaiCert,
      gst_certificate: gstCert,
      shop_act_license: shopAct,
      aadhaar_doc: aadhaarDoc,
      pan_doc: panDoc,
      account_holder: accountHolder,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifsc,
      branch_name: branch,
    };

    // Use upsert
    await VendorProfile.findOneAndUpdate(
      { vendor_id: vendorId },
      profileData,
      { upsert: true, new: true }
    );

    await Vendor.findByIdAndUpdate(vendorId, {
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      location,
      city: city || null,
      area: area || null,
      status: "pending",
      reject_reason: null
    });

    res.json({
      success: true,
      message: "Profile submitted successfully. Waiting for admin approval.",
    });

  } catch (err) {
    console.error("❌ FULL SAVE PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Vendor profile save failed",
      error: err.message,
    });
  }
};






/* =================================================
   📊 GET VENDOR REPORTS
================================================= */
const getVendorReports = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    if (!vendorId) return res.status(401).json({ message: "Vendor not logged in" });

    const revenueResult = await Order.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId), status: "Delivered" } },
      { $group: { _id: null, revenue: { $sum: "$total_amount" } } }
    ]);

    const totalOrders = await Order.countDocuments({ vendor_id: vendorId });
    const pendingOrders = await Order.countDocuments({ vendor_id: vendorId, status: "Pending" });
    const completedOrders = await Order.countDocuments({ vendor_id: vendorId, status: "Delivered" });

    const recentOrders = await Order.find({ vendor_id: vendorId })
      .populate("user_id", "name")
      .sort({ created_at: -1 })
      .limit(5);

    res.json({
      revenue: revenueResult[0]?.revenue || 0,
      totalOrders,
      pendingOrders,
      completedOrders,
      recentOrders: recentOrders.map(o => ({
        id: o._id,
        customer: o.user_id?.name || "Customer",
        status: o.status,
        amount: o.total_amount
      })),
    });

  } catch (err) {
    console.error("❌ GET VENDOR REPORTS ERROR:", err);
    res.status(500).json({ message: "Failed to load vendor reports" });
  }
};



//  jhjhrjhghehehjheh

/* =================================================
   💰 GET VENDOR PAYMENTS (ACCORDING TO YOUR TABLE)
================================================= */
const getVendorPayments = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    if (!vendorId) return res.status(401).json({ message: "Vendor not logged in" });

    // Fetch orders to populate the payments table
    const orders = await Order.find({ vendor_id: vendorId })
      .populate("user_id", "name")
      .sort({ created_at: -1 });

    /* Calculate Summary Stats for Cards */
    const totalOrders = orders.length;
    
    let totalEarnings = 0;
    let pendingAmount = 0;

    const formattedPayments = orders.map(o => {
      const isPaid = ["Paid", "paid", "Success", "success"].includes(o.payment_status) || o.status === "Delivered";
      
      if (isPaid) {
        totalEarnings += (o.vendor_earning || 0);
      } else if (o.status !== "Cancelled") {
        pendingAmount += (o.vendor_earning || 0);
      }

      return {
        id: o._id,
        order_id: o.order_id || o._id,
        customer_name: o.user_id?.name || "Customer",
        amount: o.total_amount,
        vendor_earning: o.vendor_earning,
        payment_method: o.payment_method,
        payment_mode: o.payment_method === "COD" ? "Offline" : "Online",
        payment_status: o.payment_status,
        status: o.status,
        paidAt: isPaid ? (o.updatedAt || o.created_at).toLocaleString() : "Pending",
      };
    });

    res.json({
      stats: {
        totalOrders,
        totalEarnings,
        pendingAmount
      },
      payments: formattedPayments
    });
  } catch (err) {
    console.error("❌ GET PAYMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
const getVendorEarningsDashboard = async (req, res) => {
  try {
    const vendorId = req.auth.id;

    const totalResult = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId), 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ]
        } 
      },
      { $group: { _id: null, totalEarned: { $sum: "$vendor_earning" } } }
    ]);

    const recentOrders = await Order.find({ vendor_id: vendorId })
      .select("total_amount status created_at")
      .sort({ created_at: -1 })
      .limit(5);

    const weekly = await Order.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId), 
          $or: [
            { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
            { status: "Delivered" }
          ]
        } 
      },
      {
        $group: {
          _id: { $week: "$created_at" },
          amount: { $sum: "$vendor_earning" }
        }
      },
      { $project: { week: "$_id", amount: 1, _id: 0 } }
    ]);

    res.json({
      totalEarned: totalResult[0]?.totalEarned || 0,
      recentOrders,
      weekly
    });
  } catch (err) {
    console.error("❌ EARNINGS DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Failed to fetch earnings dashboard" });
  }
};

module.exports = {
  vendorSignup,
  vendorLogin,
  vendorDashboard,
  addMenu,
  getVendorMenu,
  deleteMenu,
  getVendorOrders,
  updateOrderStatus,
  deleteOrder,
  updateMenu,
  saveVendorProfile,
  getVendorReports,
  getVendorPayments,
  getVendorEarningsDashboard,

};



// .fjnvkjdfnvkdnvdnknkvg

/* =================================================
   🔹 EXPORTS
================================================= */
// module.exports = {
//   vendorSignup,
//   vendorLogin,
//   vendorDashboard,
//   addMenu,
//   getVendorMenu,
//   deleteMenu,
//   getVendorOrders,
//   updateOrderStatus,
//   deleteOrder,
//   updateMenu,
//   saveVendorProfile, 
// };



// module.exports = {
//   vendorSignup,
//   vendorLogin,
//   vendorDashboard,
//   addMenu,
//   getVendorMenu,
//   deleteMenu,
//   getVendorOrders,
//   updateOrderStatus,
//   deleteOrder,
//   updateMenu,

//   // 🔥 ADD THIS LINE
//   saveVendorProfile
// };