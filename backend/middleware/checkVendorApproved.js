const Vendor = require("../models/Vendor");

const checkVendorApproved = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.auth.id);

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (vendor.status !== "approved") {
      return res.status(403).json({
        message: "Account not approved",
        status: vendor.status
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkVendorApproved;
