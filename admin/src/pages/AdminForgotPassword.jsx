import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import "./adminAuth.css";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email required");
      return;
    }

    try {
      setLoading(true);
      console.log("🔥 Sending forgot password request");

      const res = await API.post("/admin/auth/forgot-password", { email });

      toast.success(res.data.message || "Reset link sent");
    } catch (err) {
      console.error("❌ ERROR:", err);
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <form className="admin-auth-card" onSubmit={submit}>
        <div className="admin-auth-left">
          <h2>Forgot Password</h2>
          <p>Enter your admin email to reset password</p>

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="admin-auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="admin-auth-links">
            <a href="/admin-login">Back to Login</a>
          </div>
        </div>

        <div className="admin-auth-right">
          <h1>Messato</h1>
          <p>Secure Admin Control Panel</p>
        </div>
      </form>
    </div>
  );
};

export default AdminForgotPassword;
