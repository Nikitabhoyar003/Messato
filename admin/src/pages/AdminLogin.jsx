import { useState } from "react";
import API from "../services/api";
import "./adminAuth.css";
import { useNavigate, Link } from "react-router-dom";



const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("Login clicked");

  try {
    const res = await API.post("/admin/auth/login", {
      email,
      password,
    });

    console.log("LOGIN RESPONSE 👉", res.data);

    // localStorage.setItem("adminToken", res.data.token);
    // sessionStorage.setItem("adminToken", res.data.token);
    sessionStorage.setItem("adminToken", res.data.token);
    navigate("/admin");
  } catch (err) {
    console.error("LOGIN ERROR 👉", err);
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* LEFT */}
        <div className="auth-left">
          <h2>Admin Login</h2>

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Email"
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

            <button type="submit">Login</button>
          </form>

          {/* 👇 REGISTER LINK */}
          <p className="auth-link">
            New Admin? <Link to="/admin-register">Create Account</Link>
          </p>

           <p>
  <a href="/admin-forgot-password">Forgot Password?</a>
</p>
        </div>


       


        {/* RIGHT */}
        <div className="auth-right">
          <h1>Messato</h1>
          <p>Admin Control Panel</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;