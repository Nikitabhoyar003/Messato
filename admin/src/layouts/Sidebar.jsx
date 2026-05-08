
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaStore,
  FaGift,
  FaCog,
  FaTimes,
  FaClipboardList,
  FaChartLine
    // 🆕 Audit icon
} from "react-icons/fa";
import "./adminLayout.css";

const Sidebar = ({ open, setOpen }) => {
  const closeSidebar = () => {
    if (window.innerWidth <= 1024) setOpen(false);
  };
  const navigate = useNavigate();

const logout = () => {
  sessionStorage.removeItem("adminToken");   // ya localStorage (jo use kar raha hai)
  navigate("/admin-login");
};
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* ================= HEADER ================= */}
        <div className="sidebar-header">
          <h2 className="logo">Messato</h2>

          <button className="close-btn" onClick={() => setOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* ================= MENU ================= */}
        <nav className="menu">
  <NavLink to="/admin" end onClick={closeSidebar}>
    <FaHome /> <span>Dashboard</span>
  </NavLink>

  <NavLink to="/admin/users" onClick={closeSidebar}>
    <FaUsers /> <span>Users</span>
  </NavLink>

  <NavLink to="/admin/vendors" onClick={closeSidebar}>
    <FaStore /> <span>Vendors</span>
  </NavLink>

  <NavLink to="/admin/bills" onClick={closeSidebar}>
    <FaGift  /> <span>Bills</span>
  </NavLink>

  <NavLink to="/admin/subscriptions" onClick={closeSidebar}>
    <FaGift /> <span>Subscriptions</span>
  </NavLink>

  <NavLink to="/admin/earnings" onClick={closeSidebar}>
  <FaChartLine /> <span>Earnings</span>
  </NavLink>

  <NavLink to="/admin/settings" onClick={closeSidebar}>
    <FaCog /> <span>Settings</span>
  </NavLink>
</nav>

        {/* ================= LOGOUT ================= */}
        <button className="sidebar-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
