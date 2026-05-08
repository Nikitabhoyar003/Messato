import { useState } from "react";
import axios from "axios";
import "./vendorAuth.css";
import { useNavigate } from "react-router-dom";

const VendorAuth = () => {
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(true);

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const resetForm = () => {
    setShopName("");
    setOwnerName("");
    setEmail("");
    setPhone("");
    setLocation("");
    setPassword("");
  };

  /* =========================
     🔹 VENDOR SIGNUP
  ========================= */
  const handleVendorSignup = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/vendor/signup",
        {
          shopName,
          ownerName,
          email,
          phone,
          location,
          password,
        }
      );

      alert(res.data.message);
      resetForm();
      setIsSignup(false);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  /* =========================
     🔹 VENDOR LOGIN (FIXED)
  ========================= */
const handleVendorLogin = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/vendor/login",
      { email, password }
    );

    console.log("LOGIN RESPONSE:", res.data);

    // ✅ CHECK TOKEN INSTEAD OF success
    if (res.data.token) {

      // Save token
      localStorage.setItem("vendorToken", res.data.token);

      // Save vendor/user object
      localStorage.setItem(
        "vendor",
        JSON.stringify(res.data.user || res.data.vendor)
      );

      // Redirect
      navigate("/vendor-dashboard");
    }

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Login failed");
  }
};


  return (
    <div className="vendor-auth-page">
      <div className={`vendor-container ${isSignup ? "slide" : ""}`}>

        {/* LEFT PANEL */}
        <div className="vendor-left">
          <h1>Messato</h1>
          <h2>Partner With Us</h2>
          <p>
            Grow your tiffin business <br />
            and reach more customers.
          </p>

          <button
            className="switch-btn"
            onClick={() => {
              setIsSignup(!isSignup);
              resetForm();
            }}
          >
            {isSignup ? "Already a Vendor? Login" : "New Vendor? Register"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="vendor-right">
          <h2>{isSignup ? "Vendor Registration" : "Vendor Login"}</h2>

          {isSignup && (
            <>
              <input
                type="text"
                placeholder="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {isSignup && (
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}

          {isSignup && (
            <input
              type="text"
              placeholder="Business Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="submit-btn"
            onClick={isSignup ? handleVendorSignup : handleVendorLogin}
          >
            {isSignup ? "Register as Vendor" : "Login as Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorAuth;
