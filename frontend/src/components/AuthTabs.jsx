import { useState } from "react";

const AuthTabs = ({ role }) => {
  const [tab, setTab] = useState("login");

  return (
    <div className="auth-container">
      <h2>{role === "user" ? "User" : "Vendor"} Access</h2>

      <div className="tabs">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => setTab("login")}
        >
          Login
        </button>

        <button
          className={tab === "signup" ? "active" : ""}
          onClick={() => setTab("signup")}
        >
          Signup
        </button>
      </div>

      {tab === "login" ? (
        <div className="form">
          <input placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Login</button>
        </div>
      ) : (
        <div className="form">
          <input placeholder="Name" />
          <input placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Signup</button>
        </div>
      )}
    </div>
  );
};

export default AuthTabs;
