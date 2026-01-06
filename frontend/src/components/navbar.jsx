import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <div className="logo">Messato 🍱</div>
      <div>
        <Link to="/login">Login</Link>
        <Link to="/register">Sign Up</Link>
      </div>
    </div>
  );
}

export default Navbar;
