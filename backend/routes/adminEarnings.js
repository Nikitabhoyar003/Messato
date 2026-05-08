const express = require("express");
const router = express.Router();

const { getAdminEarnings } = require("../controllers/adminEarningController");
const { getVendorOrders } = require("../controllers/adminVendorController");

router.get("/", getAdminEarnings);

router.get("/vendor/:vendorId/orders", getVendorOrders);

module.exports = router;