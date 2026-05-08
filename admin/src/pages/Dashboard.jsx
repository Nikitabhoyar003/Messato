import { useEffect, useState } from "react";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const users = await API.get("/users/count");
      const vendors = await API.get("/vendors/count");
      const orders = await API.get("/orders/count");

      setStats({
        users: users.data.total,
        vendors: vendors.data.total,
        orders: orders.data.total,
      });
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <div className="card">Users: {stats.users}</div>
      <div className="card">Vendors: {stats.vendors}</div>
      <div className="card">Orders: {stats.orders}</div>
    </div>
  );
};

export default Dashboard;
