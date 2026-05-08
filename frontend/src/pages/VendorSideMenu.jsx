import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBook,
  FiShoppingBag,
  FiRepeat,
  FiMap,
  FiCreditCard,
  FiUser,
  FiSettings,
  FiLogOut,
  FiDollarSign
} from "react-icons/fi";
import "./VendorDashboard.css";

const VendorSideMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/user-login", { replace: true });
  };

  return (
    <aside className="vendor-sidebar">
      {/* LOGO */}
      <div className="vendor-logo">
        <h2>Messato</h2>
        <span>Vendor</span>
      </div>

      {/* MAIN MENU */}
      <nav className="vendor-menu">
       <NavLink to="/vendor-dashboard/home" className="menu-link">
          <FiHome /> Dashboard
        </NavLink>

        <NavLink to="/vendor-dashboard/menu" className="menu-link">
          <FiBook /> Menu
        </NavLink>

        <NavLink to="/vendor-dashboard/orders" className="menu-link">
          <FiShoppingBag /> Orders
        </NavLink>

        <NavLink to="/vendor-dashboard/subscriptions" className="menu-link">
          <FiRepeat /> Subscriptions
        </NavLink>

        <NavLink to="/vendor-dashboard/live-tracking" className="menu-link">
          <FiMap /> Live Tracking
        </NavLink>

        <NavLink to="/vendor-dashboard/payments" className="menu-link">
          <FiCreditCard /> Payments
        </NavLink>
              
              <NavLink to="/vendor-dashboard/reports" className="menu-link">
          <FiCreditCard /> Report
                  </NavLink>
                  <NavLink to="/vendor-dashboard/earnings" className="menu-link">
  <FiDollarSign /> Earnings
</NavLink>

        <NavLink to="/vendor-dashboard/shop-profile" className="menu-link">
          <FiUser /> Shop Profile
        </NavLink>
      </nav>

      {/* BOTTOM FIXED ACTIONS */}
      <div className="sidebar-bottom">
        <NavLink to="/vendor-dashboard/settings" className="menu-link bottom">
          <FiSettings /> Settings
        </NavLink>

        <button className="menu-link logout-btn" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </div>
    </aside>
  );
};


// kjghbkjfnknbklerfmblkerm
export default VendorSideMenu;