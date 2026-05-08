import { useState } from "react";
import API from "../services/api";
import "./adminAuth.css";
import { useNavigate, Link } from "react-router-dom";


const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/admin/auth/register", {
        name,
        email,
        password
      });

      alert("Admin registered successfully");
      navigate("/admin-login");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* LEFT */}
        <div className="auth-left">
          <h2>Admin Register</h2>

          <form onSubmit={handleRegister}>
            <input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <button type="submit">Register</button>
          </form>

          <p className="auth-link">
            Already Admin? <Link to="/admin-login">Login</Link>
          </p>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <h1>Messato</h1>
          <p>Create Admin Account</p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
