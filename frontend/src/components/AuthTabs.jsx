
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AuthTabs = ({ role }) => {
  const [tab, setTab] = useState("login");
  const { login } = useAuth();

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup state
  const [name, setName] = useState("");
  const [userNumber, setUserNumber] = useState("")

  const navigate = useNavigate();

  // ✅ LOGIN
 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "/api/auth/login",
      {
        email,
        password
      }
    );

    login(res.data);

    alert(res.data.message);
    
    if (res.data.role === "vendor") {
      navigate("/vendor-dashboard/home");
    } else {
      navigate("/select-location");
    }

  } catch (err) {
    alert(err.response?.data?.message || "Login failed");
  }
};


  // ✅ SIGNUP
  const handleSignup = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          name,
          email,
          password,
          user_number: userNumber
        }
      );

      alert(res.data.message);
      setTab("login");
      setName("");
      setPassword("");
      setUserNumber("");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2>{role === "user" ? "User" : "Vendor"} Access</h2>

      <button onClick={() => setTab("login")}>Login</button>
      <button onClick={() => setTab("signup")}>Signup</button>

      {tab === "login" && (
        <div>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin}>Login</button>
        </div>
      )}

      {tab === "signup" && (
        <div>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
 <input
            placeholder="Phone Number"
            value={userNumber}
            onChange={(e) => setUserNumber(e.target.value)}
          />

          <button onClick={handleSignup}>Signup</button>
        </div>
      )}
    </div>
  );
};

export default AuthTabs;


