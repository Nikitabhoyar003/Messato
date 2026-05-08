import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserSignup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // vendor fields
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [location, setLocation] = useState("");

  /* =========================
     ✅ SEND OTP
  ========================= */
  const sendOtp = async () => {
    if (phone.length !== 10) {
      alert("Enter valid 10-digit phone number");
      return;
    }

    const res = await fetch(
      "http://localhost:5000/api/send-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone })
      }
    );

    const data = await res.json();

    if (res.ok) {
      setOtpSent(true);
      alert("OTP sent successfully");
    } else {
      alert(data.message || "Failed to send OTP");
    }
  };

  /* =========================
     ✅ VERIFY OTP
  ========================= */
  const verifyOtp = async () => {
    const res = await fetch(
      "http://localhost:5000/api/verify-otp",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp })
      }
    );

    const data = await res.json();

    if (res.ok) {
      setOtpVerified(true);
      alert(data.message);
    } else {
      alert(data.message || "Invalid OTP");
    }
  };

  /* =========================
     ✅ SIGNUP
  ========================= */
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      if (role === "user") {

        if (!otpVerified) {
          alert("Please verify phone number first");
          return;
        }

        if (password !== confirmPassword) {
          alert("Passwords do not match");
          return;
        }

        const res = await fetch(
          "http://localhost:5000/api/auth/signup",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              email,
              password,
              user_number: phone
            })
          }
        );

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Signup failed");
          return;
        }

        alert("Signup successful");
      }

      if (role === "vendor") {

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
      }

      navigate("/user-login");

    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="signup-left">
          <h1>Messato</h1>
          <p>Create your account and enjoy homemade meals near you</p>

          <div style={{ marginTop: "20px" }}>
            <button type="button" onClick={() => setRole("user")}>
              Register as User
            </button>

            <button type="button" onClick={() => setRole("vendor")}>
              Register as Vendor
            </button>
          </div>
        </div>

        <div className="signup-right">

          <h2>{role === "user" ? "User Signup" : "Vendor Signup"}</h2>

          <form onSubmit={handleSignup}>

            {role === "user" && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
            
             

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <button type="button" onClick={sendOtp}>
                  Send OTP
                </button>

                {otpSent && (
                  <>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />

                    <button type="button" onClick={verifyOtp}>
                      Verify OTP
                    </button>
                  </>
                )}
        
                {otpVerified && (
                  <p style={{ color: "green" }}>
                    Phone number verified ✔
                  </p>
                  
                )}
               
              </>
            )}

            {role === "vendor" && (
              <>
                <input
                  type="text"
                  placeholder="Shop Name"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Owner Name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />

                <input
                  type="text"
                  placeholder="Business Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </>
            )}

            <input
              type="email"
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
                 <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

            <button type="submit" className="signup-btn">
              Create Account
            </button>

          </form>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/user-login")}>
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default UserSignup;
