import { Link } from "react-router-dom";
import "../styles/register.css";

function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <input placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button>Login</button>

        <p>
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
