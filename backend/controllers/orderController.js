const Order = require("../models/Order");
const Vendor = require("../models/Vendor");
const VendorProfile = require("../models/VendorProfile");
const WalletTransaction = require("../models/WalletTransaction");
const Withdrawal = require("../models/Withdrawal");
const earningService = require("../utils/earningService");
const mongoose = require("mongoose");

/* =====================================================
   📌 UPDATE ORDER STATUS
===================================================== */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_status, reason } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, 
      { status: order_status, cancel_reason: reason || null },
      { new: true }
    );

    if (order_status === "Delivered") {
      await earningService.handleDeliveredOrder(orderId);
    }

    // 🔥 SOCKET EMIT
    if (req.io) {
      req.io.to(`order_${orderId}`).emit("orderStatusUpdated", {
        orderId,
        status: order_status,
      });
    }

    res.json({ success: true, order: { ...order.toObject(), id: order._id } });

  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

/* =====================================================
   📌 REQUEST WITHDRAWAL
===================================================== */
const requestWithdrawal = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    const amount = Number(req.body.amount);

    if (!amount || isNaN(amount) || amount < 100) {
      return res.status(400).json({ message: "Minimum withdrawal is ₹100" });
    }
    if (amount > 500) {
      return res.status(400).json({ message: "Maximum withdrawal per request is ₹500" });
    }

    // Calculate Available Balance
    const balanceData = await WalletTransaction.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId), status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const availableBalance = balanceData[0]?.total || 0;

    if (amount > availableBalance) {
      return res.status(400).json({ message: "Insufficient available balance" });
    }

    await Withdrawal.create({
      vendor_id: vendorId,
      amount: amount,
      status: "Pending"
    });

    await WalletTransaction.create({
      vendor_id: vendorId,
      type: "WITHDRAWAL",
      amount: -amount,
      status: "Processing",
    });

    res.json({ message: "Withdrawal requested successfully" });
  } catch (err) {
    console.error("WITHDRAW ERROR:", err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
};

/* =====================================================
   📌 DEPOSIT COD CASH
===================================================== */
const depositCod = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    const amount = Number(req.body.amount);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    // Check COD holding balance
    const codData = await WalletTransaction.aggregate([
      { 
        $match: { 
          vendor_id: new mongoose.Types.ObjectId(vendorId), 
          type: "COD_COMMISSION", 
          status: "Pending" 
        } 
      },
      { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }
    ]);
    const codTotal = codData[0]?.total || 0;

    if (amount > codTotal) {
      return res.status(400).json({
        message: `Deposit amount exceeds COD holding of ₹${codTotal}`,
      });
    }

    await WalletTransaction.create({
      vendor_id: vendorId,
      type: "COD_DEPOSIT",
      amount: amount,
      status: "Completed",
    });

    // Mark one COD_COMMISSION as completed (simplified logic)
    await WalletTransaction.findOneAndUpdate(
      { vendor_id: vendorId, type: "COD_COMMISSION", status: "Pending" },
      { status: "Completed" }
    );

    res.json({ message: "COD deposited successfully", amount });
  } catch (err) {
    console.error("COD DEPOSIT ERROR:", err);
    res.status(500).json({ message: "COD deposit failed" });
  }
};

/* =====================================================
   📌 GET VENDOR PAYMENT METHODS
===================================================== */
const getPaymentMethods = async (req, res) => { 
  try {
    const vendorId = req.auth.id;

    const profile = await VendorProfile.findOne({ vendor_id: vendorId });

    const methods = [];
    if (profile?.account_number) {
      const masked = String(profile.account_number).slice(-4);
      methods.push({
        id: 1,
        label: "Bank Transfer",
        value: `${profile.bank_name || "Bank"} ****${masked}${profile.ifsc_code ? " · " + profile.ifsc_code : ""}`,
        icon: "🏦",
        detail: {
          holder: profile.account_holder,
          bank:   profile.bank_name,
          acc:    profile.account_number,
          ifsc:   profile.ifsc_code,
          branch: profile.branch_name,
        },
      });
    }

    if (methods.length === 0) {
      return res.status(404).json({
        message: "No payment methods found. Please update your bank details in your vendor profile.",
        methods: [],
      });
    }

    res.json({ methods });
  } catch (err) {
    console.error("PAYMENT METHODS ERROR:", err);
    res.status(500).json({ message: "Could not fetch payment methods" });
  }
};

/* =====================================================
   📌 GET VENDOR EARNING PANEL
===================================================== */
const getVendorEarningPanel = async (req, res) => {
  try {
    const vendorId = req.auth.id;
    const profile = await VendorProfile.findOne({ vendor_id: vendorId });

    /* 1. Wallet Balances from Transactions */
    const walletStats = await WalletTransaction.aggregate([
      { $match: { vendor_id: new mongoose.Types.ObjectId(vendorId) } },
      {
        $group: {
          _id: null,
          availableBalance: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0] }
          },
          processingBalance: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "Processing"] }, { $gt: ["$amount", 0] }] }, "$amount", 0] }
          },
          withdrawn: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "WITHDRAWAL"] }, { $eq: ["$status", "Completed"] }] }, { $abs: "$amount" }, 0] }
          },
          codHolding: {
            $sum: { $cond: [{ $and: [{ $eq: ["$type", "COD_COMMISSION"] }, { $eq: ["$status", "Pending"] }] }, { $abs: "$amount" }, 0] }
          }
        }
      }
    ]);

    const wallet = walletStats[0] || { availableBalance: 0, processingBalance: 0, withdrawn: 0, codHolding: 0 };

    /* 2. Order Revenue (Standardized: Paid or Delivered) */
    const revenueMatch = { 
      vendor_id: new mongoose.Types.ObjectId(vendorId), 
      $or: [
        { payment_status: { $in: ["Paid", "paid", "Success", "success"] } },
        { status: "Delivered" }
      ]
    };

    const totalEarnedData = await Order.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);

    const today = new Date();
    today.setHours(0,0,0,0);
    const todayEarnedData = await Order.aggregate([
      { $match: { ...revenueMatch, created_at: { $gte: today } } },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyEarnedData = await Order.aggregate([
      { $match: { ...revenueMatch, created_at: { $gte: last7Days } } },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0,0,0,0);
    const monthlyEarnedData = await Order.aggregate([
      { $match: { ...revenueMatch, created_at: { $gte: firstOfMonth } } },
      { $group: { _id: null, total: { $sum: "$vendor_earning" } } }
    ]);

    /* 3. Trend Graph */
    const graphData = await Order.aggregate([
      { $match: { ...revenueMatch, created_at: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          amount: { $sum: "$vendor_earning" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", amount: 1, _id: 0 } }
    ]);

    /* 4. Recent Transactions */
    const transactions = await WalletTransaction.find({ vendor_id: vendorId })
      .sort({ created_at: -1 })
      .limit(20);

    res.json({
      vendor: { name: profile?.shop_name || "My Store" },
      wallet: {
        totalEarned: totalEarnedData[0]?.total || 0,
        availableBalance: wallet.availableBalance,
        processingBalance: wallet.processingBalance,
        withdrawn: wallet.withdrawn,
        codHolding: wallet.codHolding,
      },
      stats: {
        today: todayEarnedData[0]?.total || 0,
        weekly: weeklyEarnedData[0]?.total || 0,
        monthly: monthlyEarnedData[0]?.total || 0,
      },
      graph: graphData,
      transactions,
    });
  } catch (err) {
    console.error("❌ EARNING PANEL ERROR:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Panel error", error: err.message });
  }
};

module.exports = {
  updateOrderStatus,
  requestWithdrawal,
  depositCod,
  getPaymentMethods,
  getVendorEarningPanel
};