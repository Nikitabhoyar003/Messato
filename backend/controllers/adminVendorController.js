const Order = require("../models/Order");
const VendorProfile = require("../models/VendorProfile");

exports.getVendorOrders = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const filter = req.query.filter || "all";

    const now = new Date();
    const matchFilter = { vendor_id: vendorId };

    if (filter === "today") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      matchFilter.created_at = { $gte: startOfDay };
    } else if (filter === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchFilter.created_at = { $gte: startOfMonth };
    }

    const orders = await Order.find(matchFilter).sort({ created_at: -1 });

    let totalRevenue = 0, totalVendorEarnings = 0, totalAdminCommission = 0, totalGST = 0;

    orders.forEach(order => {
      totalRevenue += Number(order.total_amount || 0);
      totalVendorEarnings += Number(order.vendor_earning || 0);
      totalAdminCommission += Number(order.admin_commission || 0);
      totalGST += Number(order.gst_amount || 0);
    });

    res.json({
      success: true,
      summary: {
        totalOrders: orders.length,
        revenue: totalRevenue,
        vendorEarn: totalVendorEarnings,
        adminComm: totalAdminCommission,
        gst: totalGST
      },
      orders: orders.map(o => ({ ...o.toObject(), id: o._id }))
    });

  } catch (error) {
    console.error("Vendor Orders Error:", error);
    res.status(500).json({ success: false, message: "Vendor orders fetch failed", error: error.message });
  }
};