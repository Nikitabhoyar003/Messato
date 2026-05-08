
import { useState } from "react";
import axios from "axios";
import "../pages/userLogin.css";
import { useNavigate } from "react-router-dom";
import "./userSignup.css";
import { useAuth } from "../components/AuthContext";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "/api/auth/login",
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    console.log("✅ LOGIN RESPONSE:", res.data);

    login(res.data);

    alert(res.data.message || "Login successful");

    if (res.data.role === "vendor") {
      navigate("/vendor-dashboard/home", { replace: true });
    } else {
      navigate("/select-location", { replace: true });
    }

  } catch (err) {
    console.error("❌ LOGIN ERROR:", err);
    alert(err?.response?.data?.message || "Login failed. Please try again.");
  }
};


  return (
    <div className="login-page">
      <div className="login-card">
        {/* LEFT PANEL */}
        <div className="login-left">
          <h1>Messato</h1>
          <h3>Welcome Back</h3>
          <p>
            Order fresh homemade tiffins from trusted vendors near you.
          </p>

          <button
            className="outline-btn"
            onClick={() => navigate("/user-signup")}
          >
            New Register
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <h2> Login</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
