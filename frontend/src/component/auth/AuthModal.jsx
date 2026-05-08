import { useState } from "react";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
  // 🔹 Login / Register toggle
  const [isLogin, setIsLogin] = useState(true);

  // 🔹 Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 ROLE state (STEP 3.1 MAIN PART)
  const [role, setRole] = useState("user"); // user | vendor

  // 🔹 Submit handler
  const handleSubmit = () => {
    if (!email || !password || (!isLogin && !name)) {
      alert("Please fill all fields");
      return;
    }

    // ✅ User object (demo – backend baad me)
    const user = {
      name: isLogin ? "Messato User" : name,
      email: email,
      role: role // 🔥 ROLE SAVE
    };

    // ✅ Save to localStorage
    localStorage.setItem("messatoUser", JSON.stringify(user));

    // ✅ Close modal
    onClose();
  };

  return (
    <div className="auth-backdrop">
      <div className="auth-box">
        <h2>{isLogin ? "Login" : "Create Account"}</h2>

        {/* NAME (Only for Register) */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 🔥 ROLE SELECT (STEP 3.1 MAIN ADDITION) */}
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="vendor">Vendor</option>
        </select>

        {/* SUBMIT */}
        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Register"}
        </button>

        {/* TOGGLE LOGIN / REGISTER */}
        <p onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Create new account" : "Already have an account?"}
        </p>

        {/* CLOSE */}
        <span className="close" onClick={onClose}>✖</span>
      </div>
    </div>
  );
}
