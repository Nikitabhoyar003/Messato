import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import "./adminAuth.css";

const AdminResetPassword = () => {
  const { token } = useParams(); // 🔥 VERY IMPORTANT
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast.error("Password required");
      return;
    }

    try {
      setLoading(true);
      console.log("🔥 Reset token:", token);

      const res = await API.post(
        `/admin/auth/reset-password/${token}`,
        { password }
      );

      toast.success(res.data.message || "Password updated");
      navigate("/admin-login");
    } catch (err) {
      console.error("❌ RESET ERROR:", err);
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-wrapper">
      <form className="admin-auth-card" onSubmit={submit}>
        <div className="admin-auth-left">
          <h2>Reset Password</h2>
          <p>Enter your new password</p>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="admin-auth-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>

        <div className="admin-auth-right">
          <h1>Messato</h1>
          <p>Admin Control Panel</p>
        </div>
      </form>
    </div>
  );
};

export default AdminResetPassword;
