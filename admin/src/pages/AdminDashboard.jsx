import { useEffect, useState } from "react";
import API from "../services/api";

/* ================== CHARTS IMPORTS ================== */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

/* ================== ICONS ================== */
import { FaUsers, FaShoppingCart, FaStore } from "react-icons/fa";
import { FaIndianRupeeSign } from "react-icons/fa6";

/* ================== CSS ================== */
import "./AdminDashboard.css";


/* ================== CHART REGISTER ================== */
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
  Legend
);

/* =====================================================
   📊 DASHBOARD CHARTS (MERGED – NO LINE REMOVED)
===================================================== */
const DashboardCharts = () => {
  const [type, setType] = useState("monthly");
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const REFRESH_INTERVAL = 30000; // 30 seconds

  /* ================= REVENUE ================= */
  useEffect(() => {
    let intervalId;

    const loadRevenue = async () => {
      try {
        const res = await API.get(`/admin/charts/revenue?type=${type}`);
        setRevenue(res?.data || []);
      } catch (err) {
        console.warn("Revenue chart API not reachable");
        setRevenue([]);
      }
    };

    loadRevenue();
    intervalId = setInterval(loadRevenue, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [type]);

  /* ================= ORDERS ================= */
  useEffect(() => {
    let intervalId;

    const loadOrders = async () => {
      try {
        const res = await API.get("/admin/charts/orders");
        setOrders(res?.data || []);
      } catch (err) {
        console.warn("Orders chart API not reachable");
        setOrders([]);
      }
    };

    loadOrders();
    intervalId = setInterval(loadOrders, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="dashboard-section">
      <div className="chart-grid">
        {/* REVENUE */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h4>Revenue Trend</h4>
              <p>{type} revenue overview</p>
            </div>

            <div className="chart-tabs">
              {["monthly", "weekly", "daily"].map((t) => (
                <button
                  key={t}
                  className={type === t ? "active" : ""}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-canvas">
            <Line
              data={{
                labels: revenue.map((i) => i.label),
                datasets: [
                  {
                    label: "Revenue (₹)",
                    data: revenue.map((i) => i.value),
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37,99,235,0.15)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>

        {/* ORDERS */}
        <div className="chart-card">
          <h4>Orders Overview</h4>
          <p>Weekly orders overview</p>

          <div className="chart-canvas">
            <Bar
              data={{
                labels: orders.map((i) => i.label),
                datasets: [
                  {
                    label: "Orders",
                    data: orders.map((i) => i.value),
                    backgroundColor: "#2563eb",
                    borderRadius: 6,
                    maxBarThickness: 40,
                  },
                ],
              }}
              options={options}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   🧠 ADMIN DASHBOARD (ORIGINAL – UNTOUCHED LOGIC)
===================================================== */
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    vendors: 0,
    orders: 0,
    revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const adminToken = sessionStorage.getItem("adminToken");

      if (!adminToken) return;

      const res = await API.get("/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      setStats({
        users: res?.data?.users || 0,
        vendors: res?.data?.vendors || 0,
        orders: res?.data?.orders || 0,
        revenue: res?.data?.revenue || 0,
      });

    } catch (err) {
      console.warn("Dashboard error", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);

  if (loading) {
    return <p className="dashboard-loading">Loading dashboard…</p>;
  }

  return (
    <div className="dashboard-wrapper">
      {/* HEADER */}
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Platform overview and key metrics at a glance</p>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.users}</h3>
            <p>Total Users</p>
            <span className="positive">+5.7% from last month</span>
          </div>
          <div className="stat-icon blue">
            <FaUsers />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.orders}</h3>
            <p>Total Orders</p>
            <span className="positive">+12.5% from last month</span>
          </div>
          <div className="stat-icon purple">
            <FaShoppingCart />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.vendors}</h3>
            <p>Active Vendors</p>
            <span className="positive">+18 new this month</span>
          </div>
          <div className="stat-icon cyan">
            <FaStore />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>₹{Number(stats.revenue).toLocaleString()}</h3>
            <p>Total Revenue</p>
            <span className="positive">+8.2% from last month</span>
          </div>
          <div className="stat-icon green">
            <FaIndianRupeeSign />
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <DashboardCharts />
    </div>
  );
};

export default AdminDashboard;
