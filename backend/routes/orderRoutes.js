const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Menu = require("../models/Menu");
const User = require("../models/User");
const AppConfig = require("../models/AppConfig");
const mongoose = require("mongoose");
const verifyToken = require("../middleware/verifytoken");
const controller = require("../controllers/orderController");


console.log("✅ orderRoutes loaded (JWT based)");



/* =========================
   TIME VALIDATION FUNCTION
========================= */
const isMealAllowed = (mealType) => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11 && mealType === "Breakfast") return false;
  if (hour >= 11 && hour < 17 && mealType === "Lunch") return false;
  if (hour >= 17 && mealType === "Dinner") return false;

  return true;
};

router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const userId = req.auth.id;

    const orders = await Order.find({ user_id: userId })
      .populate("items.menu_id")
      .sort({ created_at: -1 });

    const formattedOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.id = order._id; // Ensure id is present for frontend
      
      // IST Formatting
      if (orderObj.created_at) {
        orderObj.created_at_ist = new Date(orderObj.created_at).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }

      // Format items for frontend
      orderObj.items = orderObj.items.map(item => {
        let images = item.menu_id?.image || [];
        if (typeof images === "string") {
          try { images = JSON.parse(images); } catch { images = [images]; }
        }

        const firstImage = images[0] || null;
        const fullImage = firstImage && (firstImage.startsWith("http") ? firstImage : `http://localhost:5000/${firstImage.replace(/^\/+/, "")}`);

        return {
          ...item,
          name: item.name || item.menu_id?.name,
          image: fullImage,
          images: images.map(img => img.startsWith("http") ? img : `http://localhost:5000/${img.replace(/^\/+/, "")}`)
        };
      });

      return orderObj;
    });

    res.json(formattedOrders);
  } catch (err) {
    console.error("❌ Get orders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});





/* =========================
   PLACE ORDER
========================= */
router.post("/place", verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.auth.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    console.log("📥 PLACE ORDER REQUEST:", JSON.stringify(req.body, null, 2));

    let {
      cart,
      total_amount,
      meal_time,
      address,
      order_date,
      payment_method,
      order_type,
      totalAmount,
      latitude,
      longitude
    } = req.body;

    latitude = latitude ?? null;
    longitude = longitude ?? null;
    total_amount = Number(total_amount ?? totalAmount ?? 0);
    payment_method = payment_method ?? "COD";
    order_type = order_type ?? "One-Time";

    if (payment_method === "ONLINE") {
      payment_method = "RAZORPAY";
    }

    /* ================= VALIDATION ================= */
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const vendor_id = cart[0].vendor_id;
    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor not found" });
    }

    /* ================= ADDRESS ================= */
    if (!address) {
      const user = await User.findById(userId);
      if (latitude == null || longitude == null) {
        return res.status(400).json({ message: "User location coordinates missing" });
      }
      if (!user?.location) {
        return res.status(400).json({ message: "User address not found" });
      }
      address = user.location;
    }

    /* ================= TIME CHECK ================= */
    if (!meal_time) {
      return res.status(400).json({ message: "Meal time missing" });
    }
    if (!isMealAllowed(meal_time)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "This meal is out of stock for current time" });
    }

    if (!order_date) {
      order_date = new Date().toISOString().slice(0, 10);
    }

    /* ================= 🧾 BILL CALCULATION ================= */
    const configs = await AppConfig.find({});
    const config = {};
    configs.forEach(c => config[c.key] = Number(c.value));

    let itemTotal = 0;
    const orderItems = await Promise.all(cart.map(async (item) => {
      const price = Number(item.price);
      const quantity = Number(item.quantity);
      itemTotal += price * quantity;
      
      let itemName = item.name;
      if (!itemName && item.id) {
        const menu = await Menu.findById(item.id);
        itemName = menu?.name || "Tiffin Item";
      }

      return {
        menu_id: item.id,
        name: itemName || "Tiffin Item",
        quantity: quantity,
        price: price
      };
    }));

    const deliveryCharge = config.delivery_charge || 0;
    const handlingCharge = config.handling_charge || 0;
    const gst = (itemTotal * (config.gst_percent || 0)) / 100;

    total_amount = itemTotal + deliveryCharge + handlingCharge + gst;

    /* ================= EARNING CALCULATION ================= */
    const subtotal = itemTotal;
    const adminCommission = subtotal * 0.10;
    const vendorEarning = subtotal - adminCommission;

    /* ================= INSERT ORDER ================= */
    const newOrder = await Order.create([{
      user_id: userId,
      vendor_id: vendor_id,
      total_amount,
      item_total: itemTotal,
      delivery_charge: deliveryCharge,
      handling_charge: handlingCharge,
      gst_amount: gst,
      vendor_earning: vendorEarning,
      admin_commission: adminCommission,
      meal_time,
      address,
      latitude,
      longitude,
      order_date,
      payment_status: "Pending",
      payment_method,
      order_type,
      order_id: `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: "Pending",
      items: orderItems
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order_id: newOrder[0]._id,
      id: newOrder[0]._id
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Place order error:", err);
    res.status(500).json({ message: "Unable to place order", error: err.message });
  }
});


/* =========================
   PAYMENT SUCCESS
========================= */
router.post("/payment-success", verifyToken, async (req, res) => {
  try {
    const { order_id, razorpay_payment_id } = req.body;

    await Order.findByIdAndUpdate(order_id, {
      payment_status: "Paid",
      status: "Preparing",
      razorpay_payment_id: razorpay_payment_id
    });

    res.json({ message: "Payment updated successfully" });
  } catch (err) {
    console.error("Payment update failed:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   CANCEL ORDER (FIXED WITHOUT REMOVAL)
========================= */
router.put("/cancel/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.auth.id;
    const orderId = req.params.id;
    const { cancel_reason } = req.body;

    const order = await Order.findOne({ _id: orderId, user_id: userId });

    if (!order) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Order cannot be cancelled now" });
    }

    order.status = "Cancelled";
    order.cancel_reason = cancel_reason || "User Cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Order cancel failed" });
  }
});

/* =========================
   GET ORDER DETAILS BY ID
========================= */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.auth.id;

    const order = await Order.findOne({ _id: orderId, user_id: userId })
      .populate("vendor_id", "shop_name latitude longitude")
      .populate("items.menu_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderObj = order.toObject();
    orderObj.id = order._id;

    // IST Formatting
    const formatTime = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true
      });
    };

    orderObj.placed_at = formatTime(orderObj.created_at);
    orderObj.arrived_at = formatTime(orderObj.delivery_time);
    orderObj.vendor_name = orderObj.vendor_id?.shop_name;
    orderObj.vendor_latitude = orderObj.vendor_id?.latitude;
    orderObj.vendor_longitude = orderObj.vendor_id?.longitude;

    // Format items
    orderObj.items = orderObj.items.map(item => {
      let images = item.menu_id?.image || [];
      if (typeof images === "string") {
        try { images = JSON.parse(images); } catch { images = [images]; }
      }
      return {
        ...item,
        name: item.name || item.menu_id?.name,
        image: images[0] || null,
        images: images.map(img => img.startsWith("http") ? img : `http://localhost:5000/${img.replace(/^\/+/, "")}`)
      };
    });

    res.json(orderObj);
  } catch (err) {
    console.error("Order fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/bill-preview", verifyToken, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!cart?.length) {
      return res.status(400).json({ message: "Cart empty" });
    }

    const ids = cart.map(i => i.id);
    const menuItems = await Menu.find({ _id: { $in: ids } });

    const configs = await AppConfig.find({});
    const config = {};
    configs.forEach(c => config[c.key] = Number(c.value));

    let itemTotal = 0;
    const detailedItems = menuItems.map(dbItem => {
      const cartItem = cart.find(c => c.id === dbItem._id.toString());
      const total = dbItem.price * cartItem.quantity;
      itemTotal += total;
      return {
        id: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: cartItem.quantity,
        total
      };
    });

    const gst = (itemTotal * (config.gst_percent || 0)) / 100;
    const grandTotal = itemTotal + (config.delivery_charge || 0) + (config.handling_charge || 0) + gst;

    res.json({
      items: detailedItems,
      itemTotal,
      deliveryCharge: config.delivery_charge || 0,
      handlingCharge: config.handling_charge || 0,
      gst,
      grandTotal
    });

  } catch (err) {
    console.error("Bill preview error:", err);
    res.status(500).json({ message: "Bill preview failed" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { order_id } = req.body;
    // signature verification logic here

    await Order.findByIdAndUpdate(order_id, {
      payment_status: "Paid",
      status: "Preparing"
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ================= ORDER STATUS ================= */
router.put("/status/:id", verifyToken, controller.updateOrderStatus);

/* ================= WALLET ================= */
// router.get("/wallet", verifyToken, controller.getWallet);

// router.get("/wallet/stats", verifyToken, controller.getVendorEarningStats);

// router.get("/wallet/total-earning", verifyToken, controller.getTotalVendorEarning); // ⭐ REQUIRED

// router.get("/wallet", verifyToken, controller.getWallet);
router.get("/wallet/panel", verifyToken, controller.getVendorEarningPanel);
router.post("/wallet/withdraw", verifyToken, controller.requestWithdrawal);
router.post('/wallet/deposit-cod',verifyToken, controller.depositCod);
router.get('/vendor/payment-methods',verifyToken, controller.getPaymentMethods);
// router.get("/wallet/dashboard", verifyToken, controller.getVendorFinanceDashboard);
// router.put(
//   "/update-status/:id",
//   verifyToken,
//   updateOrderStatus
// );


module.exports = router;