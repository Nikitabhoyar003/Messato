import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./logout.css";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Clear user session
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // ⏳ Redirect after 2 seconds
    const timer = setTimeout(() => {
      navigate("/user-login"); // or "/"
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="logout-page">
      <div className="logout-card">
        <h2>You’ve been logged out 👋</h2>
        <p>Thank you for using Messato</p>
        <span>Redirecting to login...</span>
      </div>
    </div>
  );
};

export default Logout;
