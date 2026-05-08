import { useState } from "react";
import "./profile.css";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const navigate = useNavigate();

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const [showLogout, setShowLogout] = useState(false);

  if (!user) return <p style={{ padding: 20 }}>User not logged in</p>;

  const initial = user.name?.charAt(0).toUpperCase();
const handleConfirmLogout = async () => {
  try {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout API failed", err);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogout(false);
    navigate("/user-login", { replace: true }); // 👈 landing page
  }
};

  // const  handleConfirmLogout = () => {
    
  //   localStorage.clear(); // ✅ CLEAN EXIT
  //   navigate("/user-login", { replace: true });
//   // };
//   const handleConfirmLogout = async () => {
//   try {
//     await fetch("http://localhost:5000/api/auth/logout", {
//       method: "POST",
//       credentials: "include",
//     });
//   } catch (err) {
//     console.error("Logout API failed", err);
//   } finally {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     setShowLogout(false);
//     navigate("/", { replace: true }); // 👈 landing page
//   }
// };

  return (
    <div className="profile-wrapper">
      

      {/* TOP CARD */}
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-circle">{initial}</div>

          <div>
            <h3>{user.name}</h3>
            <p className="location">
              {user.city || "Nagpur"}, {user.country || "India"}
            </p>
          </div>

          <button className="edit-btn">✏ Edit</button>
        </div>

        {/* DETAILS */}
        <div className="profile-grid">
          <div>
            <h4>Personal Information</h4>

            <label>First Name</label>
            <input value={user.name?.split(" ")[0]} readOnly />

            <label>Last Name</label>
            <input value={user.name?.split(" ")[1] || ""} readOnly />

            <label>Email Address</label>
            <input value={user.email} readOnly />
          </div>

          <div>
            <h4>Address</h4>

            <label>Country</label>
            <input value={user.country || "India"} readOnly />

            <label>State</label>
            <input value={user.state || "Maharashtra"} readOnly />

            <label>Zip Code</label>
            <input value={user.zip || "440001"} readOnly />
          </div>
        </div>

        <button className="logout-link" onClick={() => setShowLogout(true)}>
          Log Out
        </button>
      </div>

      {/* LOGOUT MODAL */}
      {showLogout && (
        <div className="logout-backdrop">
          <div className="logout-modal">
            <button className="close-btn" onClick={() => setShowLogout(false)}>
              ✕
            </button>

            <h3>Log Out?</h3>
            <p>Are you sure you want to log out?</p>

            <button className="confirm-logout" onClick={handleConfirmLogout}>
              LOG OUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
