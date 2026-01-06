import { useState } from "react";
import "./Navbar.css";
import logo from "../../assets/messato-logo.svg";

export default function Navbar({ onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
        {/* LEFT */}
        <div className="nav-left">
          <img src={logo} alt="Messato" />
        </div>

        {/* CENTER LINKS */}
        <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
          <li onClick={() => scrollToSection("home")}>Home</li>
          <li>Explore Tiffins</li>
          <li onClick={() => scrollToSection("plans")}>Plans</li>
          <li>Contact</li>

          {/* MOBILE CART */}
          <li className="mobile-cart">🛒 Cart</li>

          {/* MOBILE SIGN IN */}
          <li className="mobile-login" onClick={onLogin}>
            Sign In
          </li>
        </ul>

        {/* RIGHT */}
        <div className="nav-right">
          {/* DESKTOP CART */}
          <button className="cart-btn">
            🛒
            <span className="cart-count">2</span>
          </button>

          {/* DESKTOP SIGN IN */}
          <button className="login-btn" onClick={onLogin}>
            Sign In
          </button>

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

      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMenuOpen(false)}
          
        />
      )}
    </>
  );
}
