import { useEffect, useState } from "react";
import "./VendorReports.css";
// import axios from "../utils/api";

const VendorReports = () => {
  const [reports, setReports] = useState({
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);

  // Safe recent orders
  const recentOrders = Array.isArray(reports.recentOrders)
    ? reports.recentOrders
    : [];

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/vendor/reports", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ FIXED
      },
    })
      .then((res) => {
        if (res.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        return res.json();
      })
      .then((data) => {
        setReports({
          revenue: Number(data.revenue) || 0,
          totalOrders: Number(data.totalOrders) || 0,
          pendingOrders: Number(data.pendingOrders) || 0,
          completedOrders: Number(data.completedOrders) || 0,
          recentOrders: Array.isArray(data.recentOrders)
            ? data.recentOrders
            : [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Reports fetch error:", err);
        setLoading(false);
      });
  }, []);

  const cancelledOrders =
    reports.totalOrders -
    (reports.pendingOrders + reports.completedOrders);

  return (
    <div className="reports-page">
      {loading ? (
        <h3>Loading reports...</h3>
      ) : (
        <>
          {/* HEADER */}
          <div className="reports-header">
            <div>
              <h2>Reports</h2>
              <p>Vendor order insights and performance</p>
            </div>

            <div className="date-filter">
              <input type="date" />
              <input type="date" />
              <button>Apply</button>
            </div>
          </div>

          {/* STAT CARDS */}
          <div className="stats-grid">
            <div className="stat-card">
              <p>Revenue</p>
              <h3>₹ {reports.revenue}</h3>
            </div>

            <div className="stat-card">
              <p>Total Orders</p>
              <h3>{reports.totalOrders}</h3>
            </div>

            <div className="stat-card">
              <p>Pending Orders</p>
              <h3>{reports.pendingOrders}</h3>
            </div>

            <div className="stat-card">
              <p>Completed Orders</p>
              <h3>{reports.completedOrders}</h3>
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="table-grid">
            {/* RECENT ORDERS */}
            <div className="table-card">
              <h4>Recent Orders</h4>

              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4">No recent orders</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.customer}</td>
                        <td className={(order.status || "").toLowerCase()}>
                          {order.status}
                        </td>
                        <td>₹ {Number(order.amount) || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ORDER STATUS */}
            <div className="table-card">
              <h4>Order Status</h4>

              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Pending</td>
                    <td>
                      <span className="badge red">
                        {reports.pendingOrders}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Completed</td>
                    <td>
                      <span className="badge green">
                        {reports.completedOrders}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>Cancelled</td>
                    <td>
                      <span className="badge gray">
                        {cancelledOrders > 0 ? cancelledOrders : 0}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* REVENUE SUMMARY */}
          <div className="table-card full">
            <h4>Revenue Summary</h4>

            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Orders</td>
                  <td>{reports.totalOrders}</td>
                </tr>
                <tr>
                  <td>Total Revenue</td>
                  <td>₹ {reports.revenue}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default VendorReports;
