import { useEffect, useState } from "react";
import { FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";
import "./adminLayout.css";

const Navbar = ({ setOpen }) => {
  const [dark, setDark] = useState(false);

  /* 🌙 INIT THEME */
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.body.classList.add("dark");
      setDark(true);
    }
  }, []);

  /* 🌙 TOGGLE */
  const toggleTheme = () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    setDark(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  return (
    <header className="navbar">
      <button className="hamburger" onClick={() => setOpen(true)}>☰</button>

      <div className="nav-search">
        <input placeholder="Search vendors, users, orders..." />
      </div>

      <div className="nav-right">
        <button className="theme-toggle" onClick={toggleTheme}>
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        <FaBell />
        <FaUserCircle />
      </div>
    </header>
  );
};

export default Navbar;
