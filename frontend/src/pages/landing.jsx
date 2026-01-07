import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <h1 className="logo">Messato</h1>
      <p className="tagline">
        Fresh • Home-style • Tiffin Services
      </p>

      <div className="role-box">
        <div className="card" onClick={() => navigate("/user-auth")}>
          👤
          <h3>Continue as User</h3>
          <p>Order fresh homemade food</p>
        </div>

        <div className="card" onClick={() => navigate("/vendor-auth")}>
          🏪
          <h3>Continue as Vendor</h3>
          <p>Sell your tiffin service</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
