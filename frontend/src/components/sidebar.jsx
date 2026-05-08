import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./sidebar.css";

const UserSidebar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 🔥 Backend logout API call
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        credentials: "include", // important if using session
      });

      // 🔥 Clear frontend auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("vendor");
      localStorage.removeItem("vendorToken");

      // Optional: clear everything
      // localStorage.clear();

      navigate("/", { replace: true });

    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="sidebar">
      <h2 className="logo">Messato</h2>

      <nav>
        <NavLink to="/user-dashboard">Dashboard</NavLink>
        <NavLink to="/find-tiffin">Find Tiffins</NavLink>
        <NavLink to="/my-orders">My Orders</NavLink>
        <NavLink to="/profile">Profile</NavLink>

        {/* 🔥 Logout Button */}
        <button 
          className="logout" 
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Logging out..." : "🚪 Logout"}
        </button>
      </nav>
    </aside>
  );
};

export default UserSidebar;
