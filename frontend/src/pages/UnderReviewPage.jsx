import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import "./UnderReviewPage.css";
import Navbar from "../components/navbar";
import Confetti from "react-confetti";


const UnderReviewPage = () => {
  const [profile, setProfile] = useState(null);
  const [vendorStatus, setVendorStatus] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  const navigate = useNavigate();

  /* 🔁 STATUS POLLING — SAME LOGIC */
 useEffect(() => {
  const checkStatus = async () => {
    try {
      const res = await API.get("/vendor/status");

      const status = res.data.status;

      setVendorStatus(status);

      if (status === "approved") {
        setShowCelebration(true);
      }

    } catch (err) {
      console.error("Status check failed", err);
    }
  };

  checkStatus();
  const interval = setInterval(checkStatus, 5000);
  return () => clearInterval(interval);
}, []);


  /* 📦 FETCH PROFILE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/vendor/profile");
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch failed", err);
      }
    };

    fetchProfile();
  }, []);
// useEffect(() => {
//   const checkStatus = async () => {
//     try {
//       const res = await API.get("/vendor/status");

//       const status = res.data.status;

//       setVendorStatus(status);

//       // ⭐ TRIGGER CELEBRATION WHEN APPROVED
//       if (status === "approved") {
//         setShowCelebration(true);
//       }

//     } catch (err) {
//       console.error("Status check failed", err);
//     }
//   };

//   checkStatus();
//   const interval = setInterval(checkStatus, 5000);
//   return () => clearInterval(interval);
// }, []);


const goToDashboard = async () => {
  try {
    const res = await API.get("/vendor/status");

    localStorage.setItem(
      "vendor",
      JSON.stringify(res.data)
    );

    localStorage.setItem("vendorEnteredDashboard", "true");

    navigate("/vendor-dashboard", { replace: true });

  } catch (err) {
    console.error(err);
  }
};

  const mealType =
    typeof profile?.meal_type === "string"
      ? JSON.parse(profile.meal_type)
      : profile?.meal_type;

  const isStepActive = (step) => {
    if (vendorStatus === "pending") {
      return step === 1 || step === 2;
    }
    if (vendorStatus === "approved") {
      return true;
    }
    return false;
  };

  return (
    <>
      <Navbar />

      <div className="review-page">
        <div className="review-container">

          {/* ✅ APPROVED BOX */}
       {vendorStatus === "approved" && (
  <div className="celebration-wrapper">

    {showCelebration && <Confetti width={window.innerWidth}
    height={window.innerHeight}
    numberOfPieces={400}
    recycle={false} />}

    <div className="celebration-card">
      <h1>🎉 Congratulations!</h1>
      <h2>Welcome to Messato 💙</h2>

      <p>Your shop is now live and ready to receive orders.</p>

    <button
  className="enter-dashboard-btn"
  onClick={goToDashboard}
>
  Enter Dashboard 
</button>

    </div>
  </div>
)}


          {/* 🔷 BANNER (hide when approved) */}
          {vendorStatus !== "approved" && (
            <div className="review-banner">
              <div className="review-banner-content">
                <div className="review-loader" />
                <div>
                  <h2>Application Under Review</h2>
                  <p>Your vendor profile has been submitted successfully.</p>

                  <div className="review-progress">
                    <span className="dot" />
                    Live status check in progress...
                  </div>
                </div>
              </div>
            </div>
          )}

          {!profile ? (
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card full" />
            </div>
          ) : (
            <div className="review-grid">

              {/* 👤 PERSONAL */}
              <div className="review-card">
                <h3>Personal Information</h3>
                <p><b>Owner:</b> {profile.owner_name}</p>
                <p><b>Email:</b> {profile.email}</p>
                <p><b>Phone:</b> {profile.mobile}</p>
              </div>

              {/* 🏪 BUSINESS */}
              <div className="review-card">
                <h3>Business Details</h3>
                <p><b>Shop:</b> {profile.shop_name}</p>
                <p><b>FSSAI:</b> {profile.fssai_number || "—"}</p>
                <p><b>Address:</b> {profile.location}</p>
              </div>

              {/* 🍱 SERVICE */}
              <div className="review-card full">
                <h3>Service Information</h3>

                <div className="tag-row">
                  {profile.pure_veg && <span className="tag">Veg</span>}
                  {profile.jain_food && <span className="tag">Jain</span>}
                  {profile.satvik && <span className="tag">Satvik</span>}
                </div>

                <div className="tag-row">
                  {mealType?.breakfast && <span className="tag">Breakfast</span>}
                  {mealType?.lunch && <span className="tag">Lunch</span>}
                  {mealType?.dinner && <span className="tag">Dinner</span>}
                </div>

                <p><b>Delivery Radius:</b> {profile.service_radius} km</p>
              </div>

              {/* 📄 DOCS */}
              <div className="review-card">
                <h3>Documents</h3>
                {profile.fssai_certificate && <p>✅ FSSAI Uploaded</p>}
                {profile.gst_certificate && <p>✅ GST Uploaded</p>}
                {profile.aadhaar_doc && <p>✅ Aadhaar Uploaded</p>}
                {profile.pan_doc && <p>✅ PAN Uploaded</p>}
              </div>

              {/* 📊 STATUS */}
              <div className="review-card status">
                <h3>Application Status</h3>

                <div className={`step ${isStepActive(1) ? "active" : ""}`}>
                  Application Submitted
                </div>

                <div className={`step ${isStepActive(2) ? "active" : ""}`}>
                  Under Review
                </div>

                <div className={`step ${isStepActive(3) ? "active" : ""}`}>
                  Document Verification
                </div>

                <div className={`step ${vendorStatus === "approved" ? "active" : ""}`}>
                  Approved
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default UnderReviewPage;
