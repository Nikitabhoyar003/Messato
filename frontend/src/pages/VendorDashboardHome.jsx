import { useEffect, useState } from "react";
// import axios from "axios";
// import { Outlet } from "react-router-dom";
import API from "../utils/api";
import "./VendorDashboardHome.css";


import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";


const COLORS = ["#22c55e", "#f97316", "#ef4444"];

const VendorDashboardHome = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🚨 BLOCK NON-VENDORS
  if (!token || role !== "vendor") {
    window.location.href = "/user-login";
    return;
  }

 API
    .get(`/vendor/dashboard`)
    .then((res) => setData(res.data))
    .catch((err) => {
      console.error(err);
      setError("Failed to load dashboard");
    });
}, []);


  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="loading">Loading dashboard...</p>;

  /* ======================
     DATA TRANSFORMSsss
  ====================== */

  const statusData = data.orderStatus
    ? Object.entries(data.orderStatus).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const timeData = data.ordersByTime
    ? Object.entries(data.ordersByTime).map(([time, orders]) => ({
        time,
        orders,
      }))
    : [];

  const monthlyRevenue = data.monthlyRevenue || [];

  /* ======================
     JSX
  ====================== */

  return (
    <div className="vendor-dashboard-home">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Business overview & performance</p>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span>Total Orders</span>
          <h3>{data.totalOrders ?? 0}</h3>
        </div>

        <div className="kpi-card">
          <span>Delivered</span>
          <h3>{data.delivered ?? 0}</h3>
        </div>

        <div className="kpi-card">
          <span>Pending</span>
          <h3>{data.pending ?? 0}</h3>
        </div>

        <div className="kpi-card highlight">
          <span>Revenue</span>
          <h3>₹ {data.revenue ?? 0}</h3>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="charts-grid">
        {/* PIE CHART */}
        <div className="chart-card">
          <h4>Order Status</h4>

          {statusData.length === 0 ? (
            <p className="nodata">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                >
                  {statusData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* BAR CHART */}
        <div className="chart-card">
          <h4>Orders by Date</h4>

          {timeData.length === 0 ? (
            <p className="nodata">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={timeData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="orders"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* MONTHLY REVENUE LINE CHART */}
      <div className="chart-card full-width">
        <h4>Monthly Revenue</h4>

        {monthlyRevenue.length === 0 ? (
          <p className="nodata">No revenue data</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* REVIEWS */}
      <div className="reviews-card">
        <h4>Latest Reviews</h4>

        {data.reviews && data.reviews.length > 0 ? (
          data.reviews.map((r, i) => (
            <div key={i} className="review">
              ⭐ {r.rating}
              <p>{r.comment}</p>
              <small>{r.user_name}</small>
            </div>
          ))
        ) : (
          <p className="nodata">No reviews yet</p>
        )}
      </div>
      
    </div>
    
  );
};

export default VendorDashboardHome;