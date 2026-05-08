const express = require("express");
const router = express.Router();

const {
  getPlans,
  createPlan,
  assignUserPlan,
  assignVendorPlan,
  getUserSubscriptions,
  getVendorSubscriptions,
  updatePlan,
  deletePlan
} = require("../controllers/subscriptionController");

router.get("/plans", getPlans);
router.post("/plans", createPlan);

router.post("/assign-user", assignUserPlan);
router.post("/assign-vendor", assignVendorPlan);

router.get("/user-subscriptions", getUserSubscriptions);
router.get("/vendor-subscriptions", getVendorSubscriptions);

router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);


module.exports = router;
