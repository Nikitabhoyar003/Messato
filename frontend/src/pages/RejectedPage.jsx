import { useNavigate } from "react-router-dom";
import "./RejectedPage.css";
import Navbar from "../components/navbar";


const RejectedPage = ({ reason }) => {
  const navigate = useNavigate();

  const handleReapply = () => {
    navigate("/vendor-dashboard/shop-profile");
  };

  return (
    <div>
      <Navbar />
    <div className="rejected-wrapper">
      <div className="rejected-card">

        <div className="rejected-icon">✖</div>

        <h2>Profile Rejected</h2>

        <p className="rejected-subtitle">
          Unfortunately your profile did not meet our verification criteria.
        </p>

        <div className="rejected-reason">
          <strong>Reason:</strong>
          <p>{reason || "No reason provided by admin."}</p>
        </div>

        <button className="reapply-btn" onClick={handleReapply}>
          Fix & Reapply
        </button>
        </div>
      </div>
    </div>
  );
};

export default RejectedPage;
