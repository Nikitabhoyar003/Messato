import { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/messato-logo.svg";
import CartModal from "../cart/CartModal";

export default function Navbar({ user, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <img src={logo} alt="Messato" />
        </div>

        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li onClick={() => scrollToSection("home")}>Home</li>
          <li>Explore Tiffins</li>
          <li onClick={() => scrollToSection("plans")}>Plans</li>
          <li>Contact</li>

          {/* MOBILE LOGIN */}
          {user ? (
            <li className="mobile-login" onClick={onLogout}>
              Logout
            </li>
          ) : (
            <li className="mobile-login" onClick={onLogin}>
              Sign In
            </li>
          )}
        </ul>

        <div className="nav-right">
          {/* 🛒 CART BUTTON */}
          <button
            className="cart-btn"
            onClick={() => {
              console.log("🛒 Cart clicked");
              setShowCart(true);
            }}
          >
            🛒
          </button>

          {/* PROFILE / LOGIN */}
          {user ? (
            <div className="profile-icon">
              👤
              <div className="profile-dropdown">
                <p>{user.name}</p>
                <p onClick={onLogout}>Logout</p>
              </div>
            </div>
          ) : (
            <button className="login-btn" onClick={onLogin}>
              Sign In
            </button>
          )}

          {/* HAMBURGER */}
          <div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* ✅ CART MODAL */}
      {showCart && <CartModal onClose={() => setShowCart(false)} />}

      {/* BACKDROP */}
      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
