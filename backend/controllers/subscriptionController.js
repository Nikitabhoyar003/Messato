const SubscriptionPlan = require("../models/SubscriptionPlan");
const UserSubscription = require("../models/UserSubscription");
const VendorSubscription = require("../models/VendorSubscription");
const User = require("../models/User");
const Vendor = require("../models/Vendor");
const VendorProfile = require("../models/VendorProfile");
const mongoose = require("mongoose");

/* =================================================
   GET ALL SUBSCRIPTION PLANS
================================================= */
exports.getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ _id: -1 });
    res.json(plans);
  } catch (err) {
    console.error("GET PLANS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
};

/* =================================================
   CREATE SUBSCRIPTION PLAN
================================================= */
exports.createPlan = async (req, res) => {
  try {
    const { type, name, price, duration_days, features } = req.body;

    if (!type || !name || !price || !duration_days) {
      return res.status(400).json({ message: "All fields required" });
    }

    const plan = await SubscriptionPlan.create({
      type,
      name,
      price: Number(price),
      duration_days: Number(duration_days),
      features: features || {}
    });

    res.json({ message: "Plan created successfully", planId: plan._id });
  } catch (err) {
    console.error("CREATE PLAN ERROR:", err);
    res.status(500).json({ message: "Plan creation failed" });
  }
};

/* =================================================
   ASSIGN USER PLAN
================================================= */
exports.assignUserPlan = async (req, res) => {
  try {
    const { user_id, plan_id, start_date, end_date } = req.body;

    if (!user_id || !plan_id) {
      return res.status(400).json({ message: "User & plan required" });
    }

    await UserSubscription.updateMany(
      { user_id, status: "active" },
      { status: "expired" }
    );

    await UserSubscription.create({
      user_id,
      plan_id,
      start_date: start_date ? new Date(start_date) : Date.now(),
      end_date: end_date ? new Date(end_date) : null,
      status: "active"
    });

    res.json({ message: "User subscription assigned successfully" });
  } catch (err) {
    console.error("ASSIGN USER PLAN ERROR:", err);
    res.status(500).json({ message: "Assign user plan failed" });
  }
};

/* =================================================
   ASSIGN VENDOR PLAN
================================================= */
exports.assignVendorPlan = async (req, res) => {
  try {
    const { vendor_id, plan_id, start_date, end_date } = req.body;

    if (!vendor_id || !plan_id) {
      return res.status(400).json({ message: "Vendor & plan required" });
    }

    await VendorSubscription.updateMany(
      { vendor_id, status: "active" },
      { status: "expired" }
    );

    const sub = await VendorSubscription.create({
      vendor_id,
      plan_id,
      start_date: start_date ? new Date(start_date) : Date.now(),
      end_date: end_date ? new Date(end_date) : null,
      status: "active"
    });

    res.json({ message: "Vendor subscription assigned successfully", id: sub._id });
  } catch (err) {
    console.error("ASSIGN VENDOR PLAN ERROR:", err);
    res.status(500).json({ message: "Assign vendor plan failed" });
  }
};

/* =================================================
   GET USER SUBSCRIPTIONS (ADMIN)
================================================= */
exports.getUserSubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find()
      .populate("user_id", "name email")
      .populate("plan_id", "name")
      .sort({ _id: -1 });

    const formatted = subs.map(s => ({
      id: s._id,
      user_name: s.user_id?.name || "N/A",
      email: s.user_id?.email || "N/A",
      plan_name: s.plan_id?.name || "N/A",
      start_date: s.start_date,
      end_date: s.end_date,
      status: s.status
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET USER SUBSCRIPTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user subscriptions" });
  }
};

/* =================================================
   GET VENDOR SUBSCRIPTIONS (ADMIN)
================================================= */
exports.getVendorSubscriptions = async (req, res) => {
  try {
    const subs = await VendorSubscription.find()
      .populate("vendor_id")
      .populate("plan_id", "name")
      .sort({ _id: -1 });

    const result = await Promise.all(subs.map(async (s) => {
      const profile = await VendorProfile.findOne({ vendor_id: s.vendor_id?._id });
      return {
        id: s._id,
        vendor_name: profile?.shop_name || "N/A",
        plan_name: s.plan_id?.name || "N/A",
        status: s.status,
        created_at: s.created_at
      };
    }));

    res.json(result);
  } catch (err) {
    console.error("GET VENDOR SUBSCRIPTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch vendor subscriptions" });
  }
};

/* =================================================
   UPDATE SUBSCRIPTION PLAN
================================================= */
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration_days, features, status } = req.body;

    await SubscriptionPlan.findByIdAndUpdate(id, {
      name,
      price: Number(price),
      duration_days: Number(duration_days),
      features: features || {},
      status: status || "active"
    });

    res.json({ message: "Plan updated successfully" });
  } catch (err) {
    console.error("UPDATE PLAN ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  }
};

/* =================================================
   DELETE SUBSCRIPTION PLAN
================================================= */
exports.deletePlan = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await UserSubscription.deleteMany({ plan_id: id }).session(session);
    await VendorSubscription.deleteMany({ plan_id: id }).session(session);
    await SubscriptionPlan.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    session.endSession();
    res.json({ message: "Plan and all related subscriptions deleted permanently" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).json({ message: "Plan delete failed" });
  }
};
